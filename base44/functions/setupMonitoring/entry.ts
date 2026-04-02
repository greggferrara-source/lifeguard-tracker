import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Production monitoring and analytics setup
interface MonitoringEvent {
  type: 'error' | 'performance' | 'security' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}

const events: MonitoringEvent[] = [];

export async function logMonitoringEvent(event: MonitoringEvent) {
  events.push({
    ...event,
    timestamp: new Date().toISOString()
  });

  // Keep only last 1000 events in memory
  if (events.length > 1000) {
    events.shift();
  }

  console.log(`[${event.severity.toUpperCase()}] ${event.title}: ${event.message}`);

  // Alert on critical issues
  if (event.severity === 'critical') {
    await sendAlert(event);
  }
}

async function sendAlert(event: MonitoringEvent) {
  // In production, integrate with alerting service (PagerDuty, Slack, etc.)
  console.error('CRITICAL ALERT:', event);
}

Deno.serve(async (req) => {
  if (req.method === 'GET') {
    return Response.json({
      monitoring_active: true,
      events_logged: events.length,
      last_events: events.slice(-10)
    });
  }

  try {
    const { type, severity, title, message, context } = await req.json();

    if (!['error', 'performance', 'security', 'business'].includes(type)) {
      return Response.json({ error: 'Invalid event type' }, { status: 400 });
    }

    if (!['low', 'medium', 'high', 'critical'].includes(severity)) {
      return Response.json({ error: 'Invalid severity' }, { status: 400 });
    }

    await logMonitoringEvent({
      type: type as any,
      severity: severity as any,
      title,
      message,
      context
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Monitoring setup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});