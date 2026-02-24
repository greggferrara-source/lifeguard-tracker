import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipient_email, content } = await req.json();

    if (!recipient_email || !content) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get or create conversation
    const conversations = await base44.entities.DirectMessage.filter({});
    const conversationId = `dm_${[user.email, recipient_email].sort().join('_')}`;

    // Create message
    const message = await base44.entities.DirectMessage.create({
      sender_email: user.email,
      sender_name: user.full_name,
      recipient_email,
      content,
      conversation_id: conversationId,
      timestamp: new Date().toISOString(),
      read: false
    });

    // Send push notification to recipient
    await base44.functions.invoke('sendPushNotification', {
      recipient_email,
      title: `Message from ${user.full_name}`,
      body: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      type: 'message',
      action_url: `/messages?conversation=${conversationId}`
    });

    return Response.json({ 
      success: true,
      message_id: message.id 
    });
  } catch (error) {
    console.error('Send message error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});