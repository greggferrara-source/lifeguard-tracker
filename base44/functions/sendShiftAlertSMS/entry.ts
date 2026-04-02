import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data } = body;

    if (!event?.type || event.type !== 'update') {
      return Response.json({ message: 'Not a shift update event' });
    }

    const shift = data;
    if (!shift?.id || !shift?.employee_id) {
      return Response.json({ error: 'Invalid shift data' }, { status: 400 });
    }

    // Get employee contact info
    const employee = await base44.asServiceRole.entities.Employee.filter({ id: shift.employee_id }, '-created_date', 1);
    if (!employee?.[0]?.phone) {
      return Response.json({ message: 'Employee phone not found' });
    }

    const emp = employee[0];
    const location = shift.location_name || 'Your assigned location';
    const shiftTime = `${shift.start_time} - ${shift.end_time}`;

    // Determine if this is a new assignment or a change
    const oldData = body.old_data;
    let message = '';

    if (!oldData?.employee_id || oldData.employee_id !== shift.employee_id) {
      // New assignment
      message = `You have been assigned a new shift on ${shift.date} from ${shiftTime} at ${location}. Please confirm in the app.`;
    } else if (oldData?.date !== shift.date || oldData?.start_time !== shift.start_time || oldData?.end_time !== shift.end_time) {
      // Shift change
      message = `Your shift has been updated to ${shift.date} from ${shiftTime} at ${location}. Please review in the app.`;
    } else {
      // Other update, skip SMS
      return Response.json({ message: 'No shift details changed' });
    }

    // Send SMS via Twilio
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Twilio credentials not configured');
      return Response.json({ error: 'SMS service not configured' }, { status: 500 });
    }

    const smsRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'From': TWILIO_PHONE_NUMBER,
        'To': emp.phone,
        'Body': message,
      }).toString(),
    });

    if (!smsRes.ok) {
      const err = await smsRes.text();
      console.error('Twilio SMS error:', err);
      return Response.json({ error: `SMS failed: ${err}` }, { status: 500 });
    }

    return Response.json({ success: true, message: 'SMS sent', employee: emp.name, phone: emp.phone });
  } catch (error) {
    console.error('sendShiftAlertSMS error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});