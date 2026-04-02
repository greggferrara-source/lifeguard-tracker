/**
 * geofenceCheckin
 * Server-side GPS verification for shift check-in/check-out.
 * Validates coordinates against location geofence before updating shift status.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { shift_id, action, latitude, longitude, accuracy } = await req.json();

    if (!shift_id || !action || latitude == null || longitude == null) {
      return Response.json({ error: "Missing required fields: shift_id, action, latitude, longitude" }, { status: 400 });
    }
    if (!["checkin", "checkout"].includes(action)) {
      return Response.json({ error: "action must be 'checkin' or 'checkout'" }, { status: 400 });
    }

    // Fetch shift
    const shifts = await base44.entities.Shift.filter({ id: shift_id });
    const shift = shifts[0];
    if (!shift) return Response.json({ error: "Shift not found" }, { status: 404 });

    // Verify user owns this shift
    const employees = await base44.entities.Employee.filter({ email: user.email });
    const employee = employees[0];
    if (!employee) return Response.json({ error: "No employee profile found" }, { status: 403 });
    if (shift.employee_id !== employee.id && user.role !== "admin") {
      return Response.json({ error: "This shift does not belong to you" }, { status: 403 });
    }

    // Fetch location
    const locations = await base44.entities.Location.filter({ id: shift.location_id });
    const location = locations[0];
    if (!location?.latitude || !location?.longitude) {
      return Response.json({ error: "Location has no GPS coordinates configured" }, { status: 422 });
    }

    // Geofence check
    const radius = (location.geofence_radius_meters || 100) + 50; // 50m buffer
    const distance = haversineDistance(latitude, longitude, location.latitude, location.longitude);
    const withinFence = distance <= radius;

    if (!withinFence) {
      console.warn(`[geofenceCheckin] REJECTED: user=${user.email}, dist=${Math.round(distance)}m, allowed=${Math.round(radius)}m`);
      return Response.json({
        success: false,
        verified: false,
        distance_meters: Math.round(distance),
        allowed_radius_meters: Math.round(radius),
        error: `Too far from ${location.name}. You are ${Math.round(distance)}m away (max ${Math.round(radius)}m).`,
      }, { status: 422 });
    }

    // Apply update
    const now = new Date().toISOString();
    if (action === "checkin") {
      if (shift.status !== "scheduled" && shift.status !== "open") {
        return Response.json({ error: `Cannot check in — shift status is '${shift.status}'` }, { status: 409 });
      }
      await base44.entities.Shift.update(shift_id, {
        status: "in_progress",
        checkin_time: now,
        checkin_latitude: latitude,
        checkin_longitude: longitude,
        checkin_accuracy_meters: Math.round(accuracy || 0),
        checkin_distance_meters: Math.round(distance),
      });

      // Log ClockEntry
      await base44.entities.ClockEntry.create({
        employee_id: employee.id,
        employee_name: `${employee.first_name} ${employee.last_name}`,
        employee_email: employee.email,
        location_id: shift.location_id,
        location_name: shift.location_name,
        shift_id,
        shift_start: shift.start_time,
        shift_end: shift.end_time,
        shift_date: shift.date,
        clock_in: now,
        clock_in_latitude: latitude,
        clock_in_longitude: longitude,
        clock_in_verified: true,
        clock_in_distance_meters: Math.round(distance),
        status: "clocked_in",
      });

    } else {
      if (shift.status !== "in_progress") {
        return Response.json({ error: `Cannot check out — shift status is '${shift.status}'` }, { status: 409 });
      }
      await base44.entities.Shift.update(shift_id, {
        status: "completed",
        checkout_time: now,
        checkout_latitude: latitude,
        checkout_longitude: longitude,
        checkout_accuracy_meters: Math.round(accuracy || 0),
        checkout_distance_meters: Math.round(distance),
      });

      // Update ClockEntry
      const entries = await base44.entities.ClockEntry.filter({ shift_id, status: "clocked_in" });
      if (entries[0]) {
        const totalMins = Math.round((new Date(now) - new Date(entries[0].clock_in)) / 60000);
        await base44.entities.ClockEntry.update(entries[0].id, {
          clock_out: now,
          clock_out_latitude: latitude,
          clock_out_longitude: longitude,
          clock_out_verified: true,
          clock_out_distance_meters: Math.round(distance),
          status: "clocked_out",
          total_minutes: totalMins,
        });
      }
    }

    console.log(`[geofenceCheckin] ${action.toUpperCase()} verified: user=${user.email}, dist=${Math.round(distance)}m, shift=${shift_id}`);
    return Response.json({
      success: true,
      verified: true,
      action,
      distance_meters: Math.round(distance),
      allowed_radius_meters: Math.round(radius),
      timestamp: now,
    });

  } catch (error) {
    console.error("[geofenceCheckin] error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});