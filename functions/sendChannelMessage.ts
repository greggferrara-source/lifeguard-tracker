import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel_id, content } = await req.json();

    if (!channel_id || !content) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get channel
    const channels = await base44.entities.MessageChannel.filter({ id: channel_id });
    const channel = channels[0];

    if (!channel) {
      return Response.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Check membership
    if (!channel.members.includes(user.email)) {
      return Response.json({ error: 'Not a member of this channel' }, { status: 403 });
    }

    // Create message
    const message = await base44.entities.ChannelMessage.create({
      channel_id,
      channel_name: channel.name,
      sender_email: user.email,
      sender_name: user.full_name,
      content,
      timestamp: new Date().toISOString(),
      read_by: [{ email: user.email, read_at: new Date().toISOString() }]
    });

    // Send notifications to channel members (except sender)
    const otherMembers = channel.members.filter(email => email !== user.email);
    for (const memberEmail of otherMembers) {
      await base44.functions.invoke('sendPushNotification', {
        recipient_email: memberEmail,
        title: `New message in #${channel.name}`,
        body: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        type: 'message',
        priority: 'normal',
        action_url: `/channels/${channel_id}`
      });
    }

    return Response.json({ 
      success: true,
      message_id: message.id 
    });
  } catch (error) {
    console.error('Send channel message error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});