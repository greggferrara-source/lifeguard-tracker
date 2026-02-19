import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { startDate, endDate, openShifts } = body;

    if (!openShifts || !Array.isArray(openShifts) || openShifts.length === 0) {
      return Response.json({ recommendations: [] });
    }

    // Fetch all required data
    const [employees, shifts, availabilities, locations] = await Promise.all([
      base44.entities.Employee.list(),
      base44.entities.Shift.list('-created_date', 500),
      base44.entities.EmployeeAvailability.list(),
      base44.entities.Location.list(),
    ]);

    // Calculate employee workload and performance
    const employeeStats = employees.map(emp => {
      const empShifts = shifts.filter(s => s.employee_id === emp.id && s.status !== 'cancelled');
      const totalHours = empShifts.reduce((sum, s) => {
        const [sh, sm] = s.start_time.split(':').map(Number);
        const [eh, em] = s.end_time.split(':').map(Number);
        return sum + Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
      }, 0);
      
      const availability = availabilities.find(a => a.employee_id === emp.id);
      
      return {
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        role: emp.role,
        status: emp.status,
        certifications: emp.certifications || [],
        totalHours,
        maxHours: emp.max_hours_per_week || 40,
        preferredDays: availability?.preferred_days || [],
        preferredStart: availability?.preferred_start,
        preferredEnd: availability?.preferred_end,
        unavailablePeriods: availability?.unavailable_periods || [],
        availabilityStatus: availability?.status || 'no_submission',
        recentShifts: empShifts.slice(-5).map(s => ({
          date: s.date,
          start: s.start_time,
          end: s.end_time,
          location: s.location_name,
        })),
      };
    });

    const locationMap = {};
    locations.forEach(loc => {
      locationMap[loc.id] = { name: loc.name, minGuards: loc.min_guards_required || 1 };
    });

    // Build prompt for LLM
    const prompt = `You are an expert workforce scheduler. Analyze the following scheduling data and provide intelligent shift recommendations.

EMPLOYEE DATA:
${JSON.stringify(employeeStats, null, 2)}

LOCATION REQUIREMENTS:
${JSON.stringify(locationMap, null, 2)}

OPEN SHIFTS TO FILL:
${JSON.stringify(openShifts, null, 2)}

DATE RANGE: ${startDate} to ${endDate}

SCHEDULING REQUIREMENTS:
1. Match employees to shifts based on their availability (preferred days/hours)
2. Respect unavailable periods and blocked dates
3. Balance workload - avoid overloading employees, distribute hours fairly
4. Consider certifications and role requirements
5. Prioritize employees with approved availability submissions
6. Minimize conflicts and scheduling changes
7. Ensure minimum location coverage requirements are met
8. Suggest alternatives when optimal matches aren't available

IMPORTANT: Return ONLY a valid JSON array with no additional text or markdown code blocks.
Each recommendation should be a JSON object with:
- shift_id: the open shift ID
- employee_id: recommended employee ID
- employee_name: employee name
- reason: brief explanation of why this is recommended (1-2 sentences)
- confidence: "high", "medium", or "low"
- alternative_ids: array of alternative employee IDs if primary isn't available

Example format (return only JSON array, no code blocks):
[
  {
    "shift_id": "shift123",
    "employee_id": "emp456",
    "employee_name": "John Doe",
    "reason": "Available on this day with preferred hours matching shift time",
    "confidence": "high",
    "alternative_ids": ["emp789", "emp012"]
  }
]`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                shift_id: { type: 'string' },
                employee_id: { type: 'string' },
                employee_name: { type: 'string' },
                reason: { type: 'string' },
                confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
                alternative_ids: { type: 'array', items: { type: 'string' } },
              },
              required: ['shift_id', 'employee_id', 'employee_name', 'reason', 'confidence'],
            },
          },
        },
      },
    });

    // Parse response - handle if it's already parsed or if it's a string
    let recommendations = [];
    if (response && response.recommendations) {
      recommendations = response.recommendations;
    } else if (Array.isArray(response)) {
      recommendations = response;
    } else if (typeof response === 'string') {
      try {
        const parsed = JSON.parse(response);
        recommendations = parsed.recommendations || parsed;
      } catch {
        recommendations = [];
      }
    }

    return Response.json({ recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return Response.json({ error: error.message, recommendations: [] }, { status: 500 });
  }
});