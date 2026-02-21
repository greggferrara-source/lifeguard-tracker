import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { week_start, location_id } = await req.json();

    // Fetch required data
    const [shifts, employees, locations, templates, availabilities] = await Promise.all([
      base44.entities.Shift.list('-created_date', 500),
      base44.entities.Employee.list(),
      base44.entities.Location.list(),
      base44.entities.ShiftTemplate.list(),
      base44.entities.EmployeeAvailability.list(),
    ]);

    // Filter for week and location
    const weekStart = new Date(week_start);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const activeEmployees = employees.filter(e => e.status === 'active');
    const targetLocations = location_id ? locations.filter(l => l.id === location_id) : locations;
    
    const weekShifts = shifts.filter(s => {
      const shiftDate = new Date(s.date);
      return shiftDate >= weekStart && shiftDate < weekEnd && targetLocations.some(l => l.id === s.location_id);
    });

    // Find open shifts
    const openShifts = weekShifts.filter(s => s.status === 'open');
    
    // Generate suggestions
    const suggestions = [];
    const assignments = {};

    for (const shift of openShifts) {
      const location = locations.find(l => l.id === shift.location_id);
      const shiftDate = shift.date;
      
      // Find available employees for this shift
      const candidates = activeEmployees.filter(emp => {
        // Check role match if needed
        const matchesRole = !shift.required_role || emp.role === shift.required_role;
        
        // Check availability
        const dayAvailability = availabilities.find(
          a => a.employee_id === emp.id && a.day_of_week === new Date(shiftDate).getDay()
        );
        
        const isAvailable = !dayAvailability || 
          (dayAvailability.available && 
           emp.id !== shift.employee_id); // Don't reassign existing
        
        // Check certifications if required
        const hasCerts = !location || emp.certifications?.some(c => c.status === 'approved');
        
        return matchesRole && isAvailable && hasCerts;
      });

      // Rank candidates by availability score
      const ranked = candidates.map(emp => {
        let score = 100;
        
        // Prefer employees with fewer shifts that week
        const empWeekShifts = weekShifts.filter(s => 
          s.employee_id === emp.id && s.status !== 'open'
        ).length;
        score -= empWeekShifts * 5;
        
        // Check max hours
        const empTotalHours = empWeekShifts * 8; // approximate
        if (empTotalHours >= (emp.max_hours_per_week || 40)) {
          score -= 50;
        }
        
        return { employee: emp, score };
      }).sort((a, b) => b.score - a.score);

      if (ranked.length > 0) {
        const bestMatch = ranked[0].employee;
        suggestions.push({
          shift_id: shift.id,
          shift_date: shift.date,
          shift_start: shift.start_time,
          shift_end: shift.end_time,
          location_id: shift.location_id,
          location_name: location?.name,
          suggested_employee_id: bestMatch.id,
          suggested_employee_name: `${bestMatch.first_name} ${bestMatch.last_name}`,
          confidence: Math.round((ranked[0].score / 100) * 100),
          alternatives: ranked.slice(1, 3).map(r => ({
            employee_id: r.employee.id,
            employee_name: `${r.employee.first_name} ${r.employee.last_name}`,
            score: Math.round(r.score),
          })),
        });
        
        assignments[shift.id] = bestMatch.id;
      }
    }

    console.log(`Generated ${suggestions.length} schedule suggestions for week ${week_start}`);

    return Response.json({
      suggestions,
      open_shifts_count: openShifts.length,
      suggested_assignments: Object.keys(assignments).length,
      week_start,
    });
  } catch (error) {
    console.error('Schedule generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});