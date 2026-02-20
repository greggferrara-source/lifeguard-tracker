import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (event.type === 'create') {
      const message = data;

      // Create notification for recipient
      await base44.asServiceRole.entities.Notification.create({
        user_email: message.recipient_email,
        user_name: message.recipient_name,
        type: 'message',
        title: `New message from ${message.sender_name}`,
        content: message.content.substring(0, 100),
        related_entity: 'Message',
        related_entity_id: message.id,
        read: false
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Message notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});