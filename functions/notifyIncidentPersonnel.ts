import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Notify relevant personnel when incident is reported
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { incident_id, incident_type, location_id, severity, reported_by_name } = await req.json();

    // Determine who needs to be notified based on incident type and severity
    const notifyRoles = [];
    if (severity === 'critical') notifyRoles.push('admin', 'manager', 'head_lifeguard');
    else if (severity === 'severe') notifyRoles.push('manager', 'head_lifeguard');
    else notifyRoles.push('manager');

    // Get facility location info
    const location = await base44.entities.Location.filter({ id: location_id });
    const locationName = location[0]?.name || 'Unknown Location';

    // Create audit trail entry
    await base44.asServiceRole.entities.IncidentAuditTrail.create({
      incident_id,
      action: 'created',
      performed_by_email: 'system',
      performed_by_name: 'Automated System',
      timestamp: new Date().toISOString(),
      description: `Incident created: ${incident_type} at ${locationName}`
    });

    // Get managers/admins to notify
    const managers = await base44.asServiceRole.entities.User.list();
    const recipients = managers.filter(m => notifyRoles.includes(m.role));

    // Send notifications
    const incidentLabel = incident_type.replace('_', ' ').toUpperCase();
    for (const recipient of recipients) {
      await base44.integrations.Core.SendEmail({
        to: recipient.email,
        subject: `🚨 ${severity.toUpperCase()} Incident: ${incidentLabel} at ${locationName}`,
        body: `An incident has been reported:\n\nType: ${incident_type}\nLocation: ${locationName}\nSeverity: ${severity}\nReported by: ${reported_by_name}\n\nPlease review the incident report immediately.`
      });
    }

    console.log(`Notified ${recipients.length} personnel about incident ${incident_id}`);

    return Response.json({ 
      success: true, 
      notified: recipients.length 
    });
  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});