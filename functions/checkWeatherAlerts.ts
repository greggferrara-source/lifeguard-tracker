import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const locations = await base44.asServiceRole.entities.Location.list();

    const alerts = [];

    for (const location of locations) {
      if (!location.latitude || !location.longitude) continue;

      const weatherData = await fetch(
        `${WEATHER_API}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit`
      ).then(r => r.json());

      const current = weatherData.current;
      const temp = current.temperature_2m;
      const humidity = current.relative_humidity_2m;
      const windSpeed = current.wind_speed_10m;
      const weatherCode = current.weather_code;

      // Check for hazardous conditions
      if (weatherCode >= 80 && weatherCode <= 82) { // Thunderstorm
        alerts.push({
          location_id: location.id,
          location_name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          alert_type: 'lightning',
          severity: 'critical',
          temperature: temp,
          humidity: humidity,
          wind_speed: windSpeed,
          condition_description: 'Active thunderstorm detected',
          recommended_action: 'evacuate',
          checked_at: new Date().toISOString(),
          status: 'active'
        });
      } else if (temp > 95) {
        alerts.push({
          location_id: location.id,
          location_name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          alert_type: 'extreme_heat',
          severity: temp > 100 ? 'critical' : 'warning',
          temperature: temp,
          humidity: humidity,
          wind_speed: windSpeed,
          condition_description: `Extreme heat: ${temp}°F`,
          recommended_action: temp > 100 ? 'close_pool' : 'monitor',
          checked_at: new Date().toISOString(),
          status: 'active'
        });
      } else if (windSpeed > 25) {
        alerts.push({
          location_id: location.id,
          location_name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          alert_type: 'high_wind',
          severity: windSpeed > 35 ? 'critical' : 'warning',
          temperature: temp,
          humidity: humidity,
          wind_speed: windSpeed,
          condition_description: `High wind: ${windSpeed} mph`,
          recommended_action: windSpeed > 35 ? 'close_pool' : 'reduce_operations',
          checked_at: new Date().toISOString(),
          status: 'active'
        });
      }
    }

    // Save alerts
    if (alerts.length > 0) {
      await base44.asServiceRole.entities.WeatherAlert.bulkCreate(alerts);
    }

    return Response.json({ alerts_created: alerts.length });
  } catch (error) {
    console.error('Weather check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});