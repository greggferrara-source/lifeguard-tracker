import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { employee_id, latitude, longitude, location_id, location_name, event_type, shift_id } = await req.json();

    if (!employee_id || latitude === undefined || longitude === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify employee has GPS tracking enabled
    const employee = await base44.asServiceRole.entities.Employee.read(employee_id);
    if (!employee?.gps_tracking_enabled) {
      return Response.json({ error: 'GPS tracking not enabled for this employee' }, { status: 403 });
    }

    // Save location tracking record
    const tracking = await base44.asServiceRole.entities.EmployeeLocationTracking.create({
      employee_id,
      employee_name: employee.first_name + ' ' + employee.last_name,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      accuracy_meters: 10,
      location_name,
      location_id,
      event_type: event_type || 'location_update',
      shift_id
    });

    // Check for geofence events
    if (location_id && event_type?.includes('geofence')) {
      const location = await base44.asServiceRole.entities.Location.read(location_id);
      
      if (location) {
        // Send geofence alert notification
        await base44.asServiceRole.entities.UserNotification.create({
          recipient_email: employee.email,
          recipient_name: employee.first_name + ' ' + employee.last_name,
          title: event_type === 'geofence_entry' ? 'Arrival Detected' : 'Departure Detected',
          message: `${event_type === 'geofence_entry' ? 'Arrived at' : 'Left'} ${location.name}`,
          notification_type: 'location_alert',
          severity: 'info',
          related_entity_type: 'EmployeeLocationTracking',
          related_entity_id: tracking.id
        });
      }
    }

    return Response.json({
      success: true,
      tracking_id: tracking.id
    });
  } catch (error) {
    console.error('Location update error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});