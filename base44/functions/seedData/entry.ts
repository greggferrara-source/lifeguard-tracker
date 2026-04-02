import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Only allow admin users to seed data
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create locations
    const locations = await base44.entities.Location.bulkCreate([
      { name: "Main Pool", type: "pool", address: "123 Water Lane", min_guards_required: 2, color: "#3b82f6" },
      { name: "Beach Zone A", type: "beach", address: "456 Sandy Ave", min_guards_required: 3, color: "#f59e0b" },
      { name: "Wave Pool", type: "waterpark", address: "789 Splash Rd", min_guards_required: 2, color: "#10b981" }
    ]);
    console.log(`Created ${locations.length} locations`);

    // Create employees
    const employees = await base44.entities.Employee.bulkCreate([
      { first_name: "Alex", last_name: "Johnson", email: "alex@example.com", phone: "555-0001", role: "lifeguard", status: "active", hourly_rate: 18, max_hours_per_week: 40, color: "#ef4444" },
      { first_name: "Morgan", last_name: "Smith", email: "morgan@example.com", phone: "555-0002", role: "head_lifeguard", status: "active", hourly_rate: 22, max_hours_per_week: 40, color: "#3b82f6" },
      { first_name: "Jordan", last_name: "Davis", email: "jordan@example.com", phone: "555-0003", role: "lifeguard", status: "active", hourly_rate: 18, max_hours_per_week: 35, color: "#8b5cf6" },
      { first_name: "Casey", last_name: "Wilson", email: "casey@example.com", phone: "555-0004", role: "lifeguard", status: "active", hourly_rate: 18, max_hours_per_week: 40, color: "#f59e0b" },
      { first_name: "Riley", last_name: "Brown", email: "riley@example.com", phone: "555-0005", role: "supervisor", status: "active", hourly_rate: 25, max_hours_per_week: 40, color: "#10b981" },
      { first_name: "Taylor", last_name: "Lee", email: "taylor@example.com", phone: "555-0006", role: "lifeguard", status: "active", hourly_rate: 18, max_hours_per_week: 40, color: "#06b6d4" }
    ]);
    console.log(`Created ${employees.length} employees`);

    // Create shifts for next 4 weeks
    const shifts = [];
    const today = new Date();
    const employeeIds = employees.map(e => e.id);
    const locationIds = locations.map(l => l.id);

    for (let day = 0; day < 28; day++) {
      const shiftDate = new Date(today);
      shiftDate.setDate(today.getDate() + day);
      const dateStr = shiftDate.toISOString().split('T')[0];

      // 2-3 shifts per day across locations
      for (let i = 0; i < 2; i++) {
        const startHour = 6 + (i * 8);
        const endHour = startHour + 8;
        const empIdx = (day + i) % employeeIds.length;
        const locIdx = i % locationIds.length;

        shifts.push({
          date: dateStr,
          start_time: `${String(startHour).padStart(2, '0')}:00`,
          end_time: `${String(endHour).padStart(2, '0')}:00`,
          employee_id: employeeIds[empIdx],
          employee_name: employees[empIdx].first_name + " " + employees[empIdx].last_name,
          location_id: locationIds[locIdx],
          location_name: locations[locIdx].name,
          status: "scheduled"
        });
      }
    }

    const createdShifts = await base44.entities.Shift.bulkCreate(shifts);
    console.log(`Created ${createdShifts.length} shifts`);

    return Response.json({ 
      success: true, 
      created: {
        locations: locations.length,
        employees: employees.length,
        shifts: createdShifts.length
      }
    });
  } catch (error) {
    console.error("Seed data error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});