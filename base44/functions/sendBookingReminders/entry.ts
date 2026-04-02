import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all confirmed bookings for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const bookings = await base44.asServiceRole.entities.ResourceBooking.filter({
      start_date: tomorrowStr,
      status: 'confirmed'
    });

    for (const booking of bookings) {
      // Only send if reminder hasn't been sent
      if (!booking.reminder_sent) {
        await base44.functions.invoke('sendBookingNotifications', {
          booking_id: booking.id,
          notification_type: 'reminder'
        });
      }
    }

    return Response.json({
      success: true,
      reminders_sent: bookings.filter(b => !b.reminder_sent).length
    });
  } catch (error) {
    console.error('Booking reminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});