import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { days_ahead = 7 } = body;

    const [employees, locations, shifts, timeOffRequests] = await Promise.all([
      base44.asServiceRole.entities.Employee.list(),
      base44.asServiceRole.entities.Location.list(),
      base44.asServiceRole.entities.Shift.list("-date", 1000),
      base44.asServiceRole.entities.TimeOffRequest.list("-created_date", 200),
    ]);

    const activeLocations = locations.filter(l => l.status === "active");
    const activeEmployees = employees.filter(e => e.status === "active");

    const predictions = [];

    for (let i = 0; i < days_ahead; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });

      // Approved time-off on this date
      const offEmployeeIds = new Set(
        timeOffRequests
          .filter(r => r.status === "approved" && r.start_date <= dateStr && r.end_date >= dateStr)
          .map(r => r.employee_id)
      );

      for (const loc of activeLocations) {
        const locShifts = shifts.filter(s => s.date === dateStr && s.location_id === loc.id && s.status !== "cancelled");
        const scheduledCount = locShifts.filter(s => s.employee_id && s.status === "scheduled").length;
        const openShifts = locShifts.filter(s => s.status === "open").length;
        const required = loc.min_guards_required || 1;

        // Count available employees (active, no time-off)
        const availableEmployees = activeEmployees.filter(e => !offEmployeeIds.has(e.id)).length;

        const risk = scheduledCount < required
          ? (scheduledCount === 0 ? "critical" : "high")
          : openShifts > 0
          ? "medium"
          : "low";

        if (risk !== "low") {
          predictions.push({
            date: dateStr,
            dayName,
            location_id: loc.id,
            location_name: loc.name,
            scheduled: scheduledCount,
            required,
            open_shifts: openShifts,
            available_pool: availableEmployees,
            risk,
            shortage: Math.max(0, required - scheduledCount),
          });
        }
      }
    }

    // Sort by risk (critical first) then date
    const rankRisk = { critical: 3, high: 2, medium: 1, low: 0 };
    predictions.sort((a, b) => rankRisk[b.risk] - rankRisk[a.risk] || a.date.localeCompare(b.date));

    return Response.json({ success: true, predictions, days_ahead, checked_locations: activeLocations.length });
  } catch (error) {
    console.error("predictUnderstaffing error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});