import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Process IoT sensor data and trigger alerts if thresholds are exceeded
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { sensor_id, sensor_type, location_id, value } = await req.json();

    // Get sensor thresholds
    const thresholds = await base44.asServiceRole.entities.IoTSensorThreshold.filter({
      sensor_id,
      enabled: true
    });

    if (!thresholds || thresholds.length === 0) {
      // Create reading without alert
      await base44.asServiceRole.entities.IoTSensorReading.create({
        sensor_id,
        sensor_type,
        location_id,
        value,
        status: 'normal',
        timestamp: new Date().toISOString()
      });
      return Response.json({ success: true, alert_triggered: false });
    }

    const threshold = thresholds[0];
    let status = 'normal';
    let alert_triggered = false;
    let alert_type = null;

    // Check thresholds
    if (value < threshold.min_critical || value > threshold.max_critical) {
      status = 'critical';
      alert_triggered = true;
      alert_type = value < threshold.min_critical ? 'low_threshold' : 'high_threshold';
    } else if (value < threshold.min_warning || value > threshold.max_warning) {
      status = 'warning';
      alert_triggered = true;
      alert_type = value < threshold.min_warning ? 'low_threshold' : 'high_threshold';
    }

    // Create reading
    const reading = await base44.asServiceRole.entities.IoTSensorReading.create({
      sensor_id,
      sensor_type,
      location_id,
      value,
      min_normal: threshold.min_optimal,
      max_normal: threshold.max_optimal,
      status,
      timestamp: new Date().toISOString(),
      alert_triggered
    });

    // If alert triggered, create alert and notify
    if (alert_triggered && threshold.alert_on_breach) {
      const alert = await base44.asServiceRole.entities.IoTSensorAlert.create({
        reading_id: reading.id,
        sensor_id,
        sensor_type,
        location_id,
        alert_type,
        severity: status === 'critical' ? 'critical' : 'warning',
        value,
        threshold: status === 'critical' 
          ? (value < threshold.min_critical ? threshold.min_critical : threshold.max_critical)
          : (value < threshold.min_warning ? threshold.min_warning : threshold.max_warning),
        message: `${sensor_type.replace('_', ' ')} is ${value < threshold.min_optimal ? 'too low' : 'too high'}: ${value}`,
        triggered_at: new Date().toISOString(),
        automated_action_taken: 'alert_sent'
      });

      // Send notifications to configured users
      if (threshold.notify_emails && threshold.notify_emails.length > 0) {
        for (const email of threshold.notify_emails) {
          await base44.integrations.Core.SendEmail({
            to: email,
            subject: `⚠️ IoT Alert: ${sensor_type.replace('_', ' ')} - ${status}`,
            body: `Sensor: ${sensor_id}\nLocation: ${location_id}\nValue: ${value}\nMessage: ${alert.message}\n\nPlease check your facility immediately.`
          });
        }
      }

      console.log(`Alert created for sensor ${sensor_id}: ${alert_type}`);
    }

    return Response.json({ 
      success: true, 
      alert_triggered,
      status,
      reading_id: reading.id
    });
  } catch (error) {
    console.error('Sensor processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});