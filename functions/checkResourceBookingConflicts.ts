import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { resource_id, start_date, start_time, end_date, end_time, exclude_id } = await req.json();

    if (!resource_id || !start_date || !start_time || !end_date || !end_time) {
      return Response.json({ conflict: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Get all confirmed bookings for this resource
    const bookings = await base44.asServiceRole.entities.ResourceBooking.filter({
      resource_id: resource_id,
      status: 'confirmed'
    });

    // Check for overlaps
    const requestStart = new Date(`${start_date}T${start_time}`);
    const requestEnd = new Date(`${end_date}T${end_time}`);

    const conflicts = bookings.filter(b => {
      if (exclude_id && b.id === exclude_id) return false;
      
      const bookingStart = new Date(`${b.start_date}T${b.start_time}`);
      const bookingEnd = new Date(`${b.end_date}T${b.end_time}`);
      
      return requestStart < bookingEnd && requestEnd > bookingStart;
    });

    return Response.json({
      conflict: conflicts.length > 0,
      conflicts: conflicts.map(b => ({
        id: b.id,
        title: b.booking_title,
        start: `${b.start_date}T${b.start_time}`,
        end: `${b.end_date}T${b.end_time}`,
        booked_by: b.booked_by_name
      }))
    });
  } catch (error) {
    console.error('Conflict check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});