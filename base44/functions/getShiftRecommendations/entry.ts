import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { location_id, week_start } = await req.json();
    if (!location_id || !week_start) {
      return Response.json({ error: 'Missing location_id or week_start' }, { status: 400 });
    }

    // Fetch relevant data in parallel
    const [employees, shifts, patronCounts, incidents, certifications, location] = await Promise.all([
      base44.asServiceRole.entities.Employee.filter({ status: 'active' }),
      base44.asServiceRole.entities.Shift.list('-date', 500),
      base44.asServiceRole.entities.PatronCount.list('-date', 200).catch(() => []),
      base44.asServiceRole.entities.IncidentReport.list('-date_time', 100).catch(() => []),
      base44.asServiceRole.entities.Certification.list().catch(() => []),
      base44.asServiceRole.entities.Location.filter({ id: location_id }).catch(() => [])
    ]);

    const locationData = location[0] || {};
    const locationEmployees = employees.filter(e => !e.location_id || e.location_id === location_id);
    const locationShifts = shifts.filter(s => s.location_id === location_id);
    const locationPatrons = patronCounts.filter(p => p.location_id === location_id);
    const locationIncidents = incidents.filter(i => i.location_id === location_id);

    // Build weekly patterns from historical shifts
    const dayOfWeekCounts = Array(7).fill(0);
    const dayOfWeekStaff = Array(7).fill(0);
    locationShifts.forEach(s => {
      if (s.date) {
        const dow = new Date(s.date + 'T00:00:00').getDay();
        dayOfWeekCounts[dow]++;
        dayOfWeekStaff[dow]++;
      }
    });

    // Patron peak hours from historical data
    const patronByDay = {};
    locationPatrons.forEach(p => {
      if (p.date && p.count) {
        const dow = new Date(p.date + 'T00:00:00').getDay();
        if (!patronByDay[dow]) patronByDay[dow] = [];
        patronByDay[dow].push(p.count);
      }
    });
    const avgPatronsByDay = Array(7).fill(0).map((_, i) => {
      const counts = patronByDay[i] || [];
      return counts.length ? Math.round(counts.reduce((a, b) => a + b, 0) / counts.length) : 0;
    });

    // Incident pattern by day
    const incidentsByDay = Array(7).fill(0);
    locationIncidents.forEach(i => {
      if (i.date_time) {
        const dow = new Date(i.date_time).getDay();
        incidentsByDay[dow]++;
      }
    });

    // Employee cert summary
    const certifiedCount = certifications.filter(c =>
      c.status === 'active' && locationEmployees.some(e => e.id === c.employee_id)
    ).length;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekDate = new Date(week_start + 'T00:00:00');

    const prompt = `You are an expert aquatic facility staffing advisor. Analyze the following data and recommend an optimal shift schedule for the week of ${week_start} at ${locationData.name || 'this facility'}.

FACILITY INFO:
- Location: ${locationData.name || 'Aquatic Facility'}
- Total active staff: ${locationEmployees.length}
- Certified lifeguards available: ${certifiedCount}

HISTORICAL PATTERNS (last 500 shifts):
${days.map((d, i) => `- ${d}: avg ${Math.round(dayOfWeekStaff[i] / Math.max(1, Math.ceil(locationShifts.length / 7)))} staff assigned, avg ${avgPatronsByDay[i]} patrons, ${incidentsByDay[i]} incidents historically`).join('\n')}

WEEK TO PLAN:
${Array.from({ length: 7 }, (_, i) => {
  const d = new Date(weekDate);
  d.setDate(d.getDate() + i);
  return `- ${days[d.getDay()]} ${d.toISOString().split('T')[0]}`;
}).join('\n')}

Based on patron load trends, incident history, and staff availability, recommend specific shift slots for this week. Consider:
1. High-traffic days (weekends typically need more coverage)
2. Incident-prone days need extra lifeguards
3. Minimum safe staffing ratios (1 guard per 25 patrons)
4. Avoid over-scheduling staff

Return a JSON object with this exact schema:
{
  "recommendations": [
    {
      "date": "YYYY-MM-DD",
      "day_name": "Monday",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "staff_count": 2,
      "priority": "high|medium|low",
      "reason": "brief explanation"
    }
  ],
  "insights": [
    "Key insight about this week's staffing needs"
  ],
  "total_shifts_recommended": 12,
  "risk_flags": ["any staffing risks identified"]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                day_name: { type: 'string' },
                start_time: { type: 'string' },
                end_time: { type: 'string' },
                staff_count: { type: 'number' },
                priority: { type: 'string' },
                reason: { type: 'string' }
              }
            }
          },
          insights: { type: 'array', items: { type: 'string' } },
          total_shifts_recommended: { type: 'number' },
          risk_flags: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Expand recommendations by staff_count into individual slots
    const expandedSlots = [];
    for (const rec of (result.recommendations || [])) {
      for (let i = 0; i < (rec.staff_count || 1); i++) {
        expandedSlots.push({
          date: rec.date,
          day_name: rec.day_name,
          start_time: rec.start_time,
          end_time: rec.end_time,
          location_id,
          location_name: locationData.name || '',
          priority: rec.priority,
          reason: rec.reason
        });
      }
    }

    console.log(`AI generated ${expandedSlots.length} shift slots for ${location_id}`);

    return Response.json({
      success: true,
      slots: expandedSlots,
      insights: result.insights || [],
      risk_flags: result.risk_flags || [],
      total_shifts_recommended: result.total_shifts_recommended || expandedSlots.length
    });

  } catch (error) {
    console.error('Shift recommendations error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});