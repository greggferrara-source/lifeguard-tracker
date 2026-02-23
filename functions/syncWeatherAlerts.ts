import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const locations = await base44.entities.Location.list();
    const weatherAlerts = [];

    // Mock weather data - in production, call actual weather API
    for (const location of locations) {
      if (!location.latitude || !location.longitude) continue;

      // Simulate weather alert logic
      const mockWeatherData = {
        temp: 72 + Math.random() * 20,
        condition: ['clear', 'cloudy', 'thunderstorm', 'rain'][Math.floor(Math.random() * 4)],
        wind_speed: Math.random() * 30,
        alert: Math.random() > 0.7 ? true : false
      };

      if (mockWeatherData.alert) {
        const alertTypes = ['severe_thunderstorm', 'extreme_heat', 'lightning', 'heavy_rain', 'wind'];
        const selectedAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        await base44.entities.WeatherAlert.create({
          location_id: location.id,
          location_name: location.name,
          alert_type: selectedAlert,
          severity: Math.random() > 0.5 ? 'moderate' : 'severe',
          description: `${selectedAlert.replace(/_/g, ' ')} alert for ${location.name}`,
          issued_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          impact_on_operations: selectedAlert === 'severe_thunderstorm' || selectedAlert === 'lightning' 
            ? 'closure_recommended'
            : 'limited_operations',
          recommended_action: `Clear area and move to shelter immediately. Do not resume operations until alert expires.`
        });
        
        weatherAlerts.push({ location: location.name, alert: selectedAlert });
      }
    }

    return Response.json({
      success: true,
      alerts_created: weatherAlerts.length,
      details: weatherAlerts
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});