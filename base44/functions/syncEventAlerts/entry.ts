import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const locations = await base44.entities.Location.list();
    const eventAlerts = [];

    // Mock event data - in production, integrate with local calendar APIs
    const eventNames = ['Local Festival', 'Concert Series', 'Community Day', 'Marathon', 'Graduation Party', 'School Event'];
    const now = new Date();

    for (const location of locations) {
      // Randomly create events for next 30 days
      if (Math.random() > 0.6) {
        const eventDate = new Date(now.getTime() + (Math.random() * 30 * 24 * 60 * 60 * 1000));
        const estimatedPatrons = Math.floor(100 + Math.random() * 500);
        
        const alert = await base44.entities.EventAlert.create({
          location_id: location.id,
          location_name: location.name,
          event_name: eventNames[Math.floor(Math.random() * eventNames.length)],
          event_date: eventDate.toISOString().split('T')[0],
          event_time: `${Math.floor(9 + Math.random() * 12)}:00`,
          estimated_extra_patrons: estimatedPatrons,
          impact_level: estimatedPatrons > 300 ? 'high' : estimatedPatrons > 150 ? 'moderate' : 'low',
          source: 'local_calendar',
          recommended_staffing_increase: Math.ceil(estimatedPatrons / 75),
          notes: `Expected attendance boost from local event`
        });
        
        eventAlerts.push(alert);
      }
    }

    return Response.json({
      success: true,
      events_synced: eventAlerts.length,
      events: eventAlerts.map(e => ({ name: e.event_name, location: e.location_name, date: e.event_date }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});