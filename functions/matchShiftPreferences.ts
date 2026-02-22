import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const { open_shift_id } = await req.json();

  try {
    const base44 = createClientFromRequest(req);
    const shift = await base44.asServiceRole.entities.Shift.get(open_shift_id);
    const prefs = await base44.asServiceRole.entities.ShiftPreference.list();
    const employees = await base44.asServiceRole.entities.Employee.list();

    const candidates = [];

    for (const pref of prefs) {
      const emp = employees.find(e => e.id === pref.employee_id);
      if (!emp || emp.status !== 'active') continue;

      // Check if in blackout
      if (pref.blackout_dates?.includes(shift.date)) continue;

      // Check day preference
      const shiftDate = new Date(shift.date);
      const dayOfWeek = shiftDate.getDay();
      if (pref.preferred_days && !pref.preferred_days.includes(dayOfWeek)) {
        continue;
      }

      // Check location preference
      if (pref.preferred_locations && !pref.preferred_locations.includes(shift.location_id)) {
        continue;
      }

      // Check time preference
      let timeMatch = !pref.preferred_shift_times || pref.preferred_shift_times.length === 0;
      if (pref.preferred_shift_times) {
        timeMatch = pref.preferred_shift_times.some(t => 
          shift.start_time >= t.start_time && shift.end_time <= t.end_time
        );
      }
      if (!timeMatch) continue;

      // Score candidate
      let score = 100;
      if (!pref.preferred_days?.includes(dayOfWeek)) score -= 10;
      if (!pref.preferred_locations?.includes(shift.location_id)) score -= 15;
      score *= (pref.priority_weight || 1) / 5;

      candidates.push({
        employee_id: emp.id,
        employee_name: emp.first_name + ' ' + emp.last_name,
        email: emp.email,
        match_score: Math.round(score),
        prefers_day: pref.preferred_days?.includes(dayOfWeek),
        prefers_location: pref.preferred_locations?.includes(shift.location_id),
        prefers_time: timeMatch
      });
    }

    // Sort by score
    candidates.sort((a, b) => b.match_score - a.match_score);

    return Response.json({ 
      shift_id: open_shift_id,
      candidates: candidates.slice(0, 5)
    });
  } catch (error) {
    console.error('Match error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});