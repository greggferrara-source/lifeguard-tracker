import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { recipient_email, title, body, type, priority, action_url } = await req.json();

    if (!recipient_email || !title || !body || !type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create notification record
    const notification = await base44.entities.PushNotification.create({
      recipient_email,
      title,
      body,
      type,
      priority: priority || 'normal',
      action_url: action_url || '',
      sent_at: new Date().toISOString(),
      read: false
    });

    // In production, would integrate with push notification service
    // e.g., Firebase Cloud Messaging, OneSignal, etc.
    console.log(`Push notification sent to ${recipient_email}: ${title}`);

    return Response.json({ 
      success: true,
      notification_id: notification.id 
    });
  } catch (error) {
    console.error('Push notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});