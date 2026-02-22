import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const locations = await base44.asServiceRole.entities.Location.list();
    const shifts = await base44.asServiceRole.entities.Shift.list();
    const clockEntries = await base44.asServiceRole.entities.ClockEntry.list('-created_date', 1000);

    const forecasts = [];

    for (const location of locations) {
      // Get shifts for this location
      const locShifts = shifts.filter(s => s.location_id === location.id);
      
      // Calculate historical demand (average staff needed per shift time)
      const demandByTime = {};
      const clockByTime = {};

      for (const entry of clockEntries) {
        if (entry.location_id !== location.id) continue;
        const hour = new Date(entry.clock_in_time).getHours();
        clockByTime[hour] = (clockByTime[hour] || 0) + 1;
      }

      // Forecast next 7 days
      const today = new Date();
      for (let i = 1; i <= 7; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(forecastDate.getDate() + i);

        const dateFmt = forecastDate.toISOString().split('T')[0];
        const dayShifts = locShifts.filter(s => s.date === dateFmt);
        const scheduledStaff = dayShifts.length;

        // Estimate required based on historical data
        const avgDemand = Object.values(clockByTime).reduce((a, b) => a + b, 0) / 7 || 3;
        const requiredStaff = Math.max(Math.ceil(avgDemand), 2);

        const shortage = scheduledStaff - requiredStaff;

        forecasts.push({
          location_id: location.id,
          location_name: location.name,
          date: dateFmt,
          shift_start_time: '06:00',
          shift_end_time: '18:00',
          required_staff: requiredStaff,
          scheduled_staff: scheduledStaff,
          predicted_shortage: shortage,
          confidence: 75,
          historical_demand: Math.round(avgDemand * 10) / 10,
          risk_level: shortage > 1 ? 'high' : shortage > 0 ? 'medium' : 'low',
          recommended_action: shortage > 0 ? `Hire ${shortage} more staff` : 'Adequate staffing',
          forecast_generated_at: new Date().toISOString()
        });
      }
    }

    await base44.asServiceRole.entities.StaffingForecast.bulkCreate(forecasts);
    return Response.json({ forecasts_created: forecasts.length });
  } catch (error) {
    console.error('Forecast error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});