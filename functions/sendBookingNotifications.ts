import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, notification_type = 'confirmation' } = await req.json();

    // Fetch booking
    const booking = await base44.asServiceRole.entities.ResourceBooking.read(booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const resource = await base44.asServiceRole.entities.Resource.read(booking.resource_id);
    const subject = notification_type === 'confirmation' 
      ? `Booking Confirmation: ${booking.resource_name}`
      : `Reminder: ${booking.resource_name} booked for ${booking.start_date}`;

    const emailBody = notification_type === 'confirmation'
      ? `Hello ${booking.booked_by_name},\n\nYour booking has been confirmed:\n\nResource: ${booking.resource_name}\nTitle: ${booking.booking_title}\nDate: ${booking.start_date}\nTime: ${booking.start_time} - ${booking.end_time}\nLocation: ${booking.location_id}\n\nAttendees: ${booking.attendees?.map(a => a.name).join(', ') || 'None'}\n\nIf you need to cancel or modify this booking, please do so in the Resource Booking module.\n\nBest regards,\nLifeGuard Tracker`
      : `Hello ${booking.booked_by_name},\n\nThis is a reminder about your upcoming booking:\n\nResource: ${booking.resource_name}\nTitle: ${booking.booking_title}\nDate: ${booking.start_date}\nTime: ${booking.start_time} - ${booking.end_time}\n\nPlease ensure all attendees are aware and arrive on time.\n\nBest regards,\nLifeGuard Tracker`;

    // Send email to booker
    await base44.integrations.Core.SendEmail({
      to: booking.booked_by_email,
      subject: subject,
      body: emailBody
    });

    // Send emails to attendees
    if (booking.attendees && booking.attendees.length > 0) {
      for (const attendee of booking.attendees) {
        await base44.integrations.Core.SendEmail({
          to: attendee.email,
          subject: subject,
          body: `Hello ${attendee.name},\n\nYou have been invited to a resource booking:\n\nResource: ${booking.resource_name}\nTitle: ${booking.booking_title}\nDate: ${booking.start_date}\nTime: ${booking.start_time} - ${booking.end_time}\nOrganizer: ${booking.booked_by_name}\n\nBest regards,\nLifeGuard Tracker`
        });
      }
    }

    // Create in-app notification
    await base44.asServiceRole.entities.UserNotification.create({
      recipient_email: booking.booked_by_email,
      recipient_name: booking.booked_by_name,
      title: notification_type === 'confirmation' ? 'Booking Confirmed' : 'Booking Reminder',
      message: `Your booking for ${booking.resource_name} on ${booking.start_date} at ${booking.start_time} has been ${notification_type === 'confirmation' ? 'confirmed' : 'scheduled for today'}`,
      notification_type: 'task_assignment',
      severity: 'info',
      related_entity_type: 'ResourceBooking',
      related_entity_id: booking_id,
      related_entity_name: booking.resource_name,
      action_url: '/resource-booking',
      created_at: new Date().toISOString()
    });

    // Update booking status
    const updateData = {};
    if (notification_type === 'confirmation') {
      updateData.confirmation_sent = true;
    } else {
      updateData.reminder_sent = true;
    }
    await base44.asServiceRole.entities.ResourceBooking.update(booking_id, updateData);

    return Response.json({ 
      success: true,
      message: `${notification_type} notification sent`,
      booking_id: booking_id
    });
  } catch (error) {
    console.error('Booking notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});