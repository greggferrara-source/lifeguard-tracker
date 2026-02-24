import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message_id, message_type } = await req.json();

    if (!message_id || !message_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (message_type === 'direct') {
      // Update direct message
      const messages = await base44.entities.DirectMessage.filter({ id: message_id });
      if (messages[0]) {
        await base44.entities.DirectMessage.update(message_id, {
          read: true,
          read_at: now
        });
      }
    } else if (message_type === 'channel') {
      // Update channel message read receipts
      const messages = await base44.entities.ChannelMessage.filter({ id: message_id });
      if (messages[0]) {
        const message = messages[0];
        const readBy = message.read_by || [];
        
        // Add current user if not already there
        if (!readBy.find(r => r.email === user.email)) {
          readBy.push({ email: user.email, read_at: now });
          await base44.entities.ChannelMessage.update(message_id, {
            read_by: readBy
          });
        }
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});