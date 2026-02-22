import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { request_id } = await req.json();

    if (!request_id) {
      return Response.json({ error: 'Missing request_id' }, { status: 400 });
    }

    const request = await base44.asServiceRole.entities.ResourceRequest.read(request_id);
    if (!request) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check for conflicts
    const conflictRes = await base44.functions.invoke('checkResourceBookingConflicts', {
      resource_id: request.resource_id,
      start_date: request.start_date,
      start_time: request.start_time,
      end_date: request.end_date,
      end_time: request.end_time
    });

    if (conflictRes.conflict) {
      // Update request as conflicted
      await base44.asServiceRole.entities.ResourceRequest.update(request_id, {
        status: 'pending',
        conflict_detected: true,
        conflict_details: conflictRes.conflicts.map(c => `${c.title} (${c.start})`).join(', ')
      });

      return Response.json({
        approved: false,
        reason: 'Conflict detected',
        conflicts: conflictRes.conflicts
      });
    }

    // No conflicts - create booking and mark request as auto-approved
    const now = new Date().toISOString();
    const booking = await base44.asServiceRole.entities.ResourceBooking.create({
      resource_id: request.resource_id,
      resource_name: request.resource_name,
      booked_by_email: request.requested_by_email,
      booked_by_name: request.requested_by_name,
      booking_title: request.purpose,
      start_date: request.start_date,
      start_time: request.start_time,
      end_date: request.end_date,
      end_time: request.end_time,
      status: 'approved',
      confirmation_sent: false
    });

    // Update request as auto-approved
    await base44.asServiceRole.entities.ResourceRequest.update(request_id, {
      status: 'approved',
      auto_approved: true,
      approved_at: now
    });

    console.log(`Resource request ${request_id} auto-approved. Booking created: ${booking.id}`);

    return Response.json({
      approved: true,
      auto_approved: true,
      booking_id: booking.id
    });
  } catch (error) {
    console.error('Auto-approval error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});