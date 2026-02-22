import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, notification_type } = await req.json();

    if (!booking_id || !notification_type) {
      return Response.json({ error: 'Missing booking_id or notification_type' }, { status: 400 });
    }

    const booking = await base44.asServiceRole.entities.ResourceBooking.read(booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get user preferences
    const userPrefs = await base44.asServiceRole.entities.NotificationPreference.filter({
      user_email: booking.booked_by_email
    }, '', 1);

    const prefs = userPrefs?.[0];

    let emailSubject = '';
    let emailBody = '';
    let inAppTitle = '';
    let inAppMessage = '';

    if (notification_type === 'confirmed') {
      emailSubject = `Booking Confirmed: ${booking.resource_name}`;
      emailBody = `
Your booking has been confirmed!

Resource: ${booking.resource_name}
Date: ${booking.start_date} from ${booking.start_time} to ${booking.end_time}
Title: ${booking.booking_title}

${booking.booking_description ? `Details: ${booking.booking_description}` : ''}

The resource is now reserved for your event.
      `;
      inAppTitle = 'Booking Confirmed';
      inAppMessage = `Your booking for ${booking.resource_name} on ${booking.start_date} is confirmed.`;
    } else if (notification_type === 'upcoming') {
      emailSubject = `Reminder: Upcoming Booking - ${booking.resource_name}`;
      emailBody = `
This is a reminder about your upcoming booking:

Resource: ${booking.resource_name}
Date: ${booking.start_date} from ${booking.start_time} to ${booking.end_time}
Title: ${booking.booking_title}

Please ensure you're prepared for this event.
      `;
      inAppTitle = 'Upcoming Booking';
      inAppMessage = `Your booking for ${booking.resource_name} is coming up on ${booking.start_date}.`;
    } else if (notification_type === 'conflict') {
      emailSubject = `Alert: Booking Conflict - ${booking.resource_name}`;
      emailBody = `
There is a scheduling conflict with your booking:

Resource: ${booking.resource_name}
Your Booking: ${booking.start_date} from ${booking.start_time} to ${booking.end_time}

Please contact support to resolve this conflict.
      `;
      inAppTitle = 'Booking Conflict';
      inAppMessage = `There is a conflict with your booking for ${booking.resource_name} on ${booking.start_date}.`;
    }

    // Send email if preference enabled
    if (prefs?.email_enabled !== false) {
      await base44.integrations.Core.SendEmail({
        to: booking.booked_by_email,
        subject: emailSubject,
        body: emailBody
      });
    }

    // Create in-app notification
    if (prefs?.in_app_enabled !== false) {
      await base44.asServiceRole.entities.UserNotification.create({
        recipient_email: booking.booked_by_email,
        recipient_name: booking.booked_by_name,
        title: inAppTitle,
        message: inAppMessage,
        notification_type: 'resource_booking',
        severity: notification_type === 'conflict' ? 'warning' : 'info',
        related_entity_type: 'ResourceBooking',
        related_entity_id: booking.id,
        related_entity_name: booking.resource_name,
        action_url: `/ResourceBooking?id=${booking.id}`
      });
    }

    console.log(`Booking notification sent for ${booking_id} (type: ${notification_type})`);

    return Response.json({
      success: true,
      message: `${notification_type} notification sent`
    });
  } catch (error) {
    console.error('Send booking notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});