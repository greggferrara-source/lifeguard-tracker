import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { week_start, location_ids, shift_slots } = await req.json();
    // shift_slots: [{ date, start_time, end_time, location_id, location_name }]

    if (!shift_slots || shift_slots.length === 0) {
      return Response.json({ error: 'No shift slots provided' }, { status: 400 });
    }

    // Fetch all data in parallel
    const [employees, existingShifts, availabilities] = await Promise.all([
      base44.asServiceRole.entities.Employee.filter({ status: 'active' }),
      base44.asServiceRole.entities.Shift.list('-date', 1000),
      base44.asServiceRole.entities.EmployeeAvailability.list()
    ]);

    console.log(`Auto-assigning ${shift_slots.length} slots across ${employees.length} employees`);

    // Build a map of employee -> dates already assigned this week
    const assignedMap = {};  // employee_id -> Set of date strings
    existingShifts.forEach(s => {
      if (s.employee_id && s.status !== 'cancelled') {
        if (!assignedMap[s.employee_id]) assignedMap[s.employee_id] = new Set();
        assignedMap[s.employee_id].add(s.date);
      }
    });

    // Track hours assigned in this planning session
    const sessionHours = {};  // employee_id -> hours

    const assignments = [];
    const unassigned = [];

    for (const slot of shift_slots) {
      const slotStart = timeToMinutes(slot.start_time);
      const slotEnd = timeToMinutes(slot.end_time);
      const slotDuration = (slotEnd - slotStart) / 60;

      // Filter eligible employees for this slot
      const eligible = employees.filter(emp => {
        // Location preference (if set)
        if (emp.location_id && emp.location_id !== slot.location_id) return false;

        // Already assigned at this location/time same day?
        const sameDayShifts = existingShifts.filter(s =>
          s.employee_id === emp.id &&
          s.date === slot.date &&
          s.status !== 'cancelled'
        );
        const hasConflict = sameDayShifts.some(s => {
          const eStart = timeToMinutes(s.start_time);
          const eEnd = timeToMinutes(s.end_time);
          return slotStart < eEnd && slotEnd > eStart;
        });
        if (hasConflict) return false;

        // Check availability settings
        const avail = availabilities.find(a => a.employee_id === emp.id);
        if (avail) {
          for (const period of (avail.unavailable_periods || [])) {
            if (period.start_date && period.end_date &&
              slot.date >= period.start_date && slot.date <= period.end_date) {
              return false;
            }
          }
        }

        // Max hours per week
        const maxHours = emp.max_hours_per_week || 40;
        const weekHoursAlready = getWeekHours(emp.id, existingShifts, week_start);
        const sessionH = sessionHours[emp.id] || 0;
        if (weekHoursAlready + sessionH + slotDuration > maxHours) return false;

        return true;
      });

      if (eligible.length === 0) {
        unassigned.push(slot);
        continue;
      }

      // Pick the employee with fewest hours assigned (load balance)
      eligible.sort((a, b) => {
        const aH = getWeekHours(a.id, existingShifts, week_start) + (sessionHours[a.id] || 0);
        const bH = getWeekHours(b.id, existingShifts, week_start) + (sessionHours[b.id] || 0);
        return aH - bH;
      });

      const chosen = eligible[0];
      sessionHours[chosen.id] = (sessionHours[chosen.id] || 0) + slotDuration;

      assignments.push({
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        location_id: slot.location_id,
        location_name: slot.location_name,
        employee_id: chosen.id,
        employee_name: `${chosen.first_name} ${chosen.last_name}`,
        status: 'scheduled',
        color: chosen.color || null
      });
    }

    // Bulk create the assigned shifts
    let created = 0;
    for (const assignment of assignments) {
      await base44.asServiceRole.entities.Shift.create(assignment);
      created++;
    }

    console.log(`Created ${created} shifts, ${unassigned.length} could not be assigned`);

    return Response.json({
      success: true,
      assigned: created,
      unassigned: unassigned.length,
      unassigned_slots: unassigned
    });
  } catch (error) {
    console.error('Auto-assign error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function timeToMinutes(time) {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function getWeekHours(employeeId, shifts, weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  return shifts
    .filter(s => s.employee_id === employeeId && s.status !== 'cancelled' && s.date >= weekStart && s.date < weekEndStr)
    .reduce((sum, s) => {
      const dur = (timeToMinutes(s.end_time) - timeToMinutes(s.start_time)) / 60;
      return sum + Math.max(0, dur);
    }, 0);
}