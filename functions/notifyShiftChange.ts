import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event_type, shift, old_shift } = body;
    // event_type: "assigned" | "unassigned" | "updated" | "cancelled" | "callout" | "reminder"

    if (!shift || !shift.employee_id) {
      return Response.json({ skipped: true, reason: "No employee on shift" });
    }

    const employees = await base44.asServiceRole.entities.Employee.list();
    const employee = employees.find(e => e.id === shift.employee_id);
    if (!employee || !employee.email) {
      return Response.json({ skipped: true, reason: "Employee not found or no email" });
    }

    const name = `${employee.first_name} ${employee.last_name}`;
    let subject = "";
    let emailBody = "";
    let smsMsg = "";

    const shiftInfo = `${shift.date} from ${shift.start_time}–${shift.end_time} at ${shift.location_name}`;

    if (event_type === "assigned") {
      subject = `ShiftGuard: You've been scheduled for a shift`;
      emailBody = `Hi ${employee.first_name},\n\nYou have been scheduled for a shift:\n\n📅 Date: ${shift.date}\n⏰ Time: ${shift.start_time}–${shift.end_time}\n📍 Location: ${shift.location_name}\n\nPlease confirm you received this notice. If you have any conflicts, contact your supervisor immediately.\n\nShiftGuard Team`;
      smsMsg = `ShiftGuard: You're scheduled ${shiftInfo}. Check your schedule for details.`;
    } else if (event_type === "updated") {
      subject = `ShiftGuard: Your shift has been updated`;
      emailBody = `Hi ${employee.first_name},\n\nYour shift has been updated:\n\n📅 Date: ${shift.date}\n⏰ New Time: ${shift.start_time}–${shift.end_time}\n📍 Location: ${shift.location_name}\n\nPlease review the change and contact your supervisor with any questions.\n\nShiftGuard Team`;
      smsMsg = `ShiftGuard: Your shift was updated. New time: ${shiftInfo}.`;
    } else if (event_type === "cancelled") {
      subject = `ShiftGuard: Your shift has been cancelled`;
      emailBody = `Hi ${employee.first_name},\n\nYour shift on ${shift.date} (${shift.start_time}–${shift.end_time}) at ${shift.location_name} has been cancelled.\n\nPlease contact your supervisor if you have questions.\n\nShiftGuard Team`;
      smsMsg = `ShiftGuard: Your shift on ${shift.date} at ${shift.location_name} has been CANCELLED.`;
    } else if (event_type === "reminder") {
      subject = `ShiftGuard: Shift Reminder - Tomorrow`;
      emailBody = `Hi ${employee.first_name},\n\nThis is a reminder that you have a shift tomorrow:\n\n📅 Date: ${shift.date}\n⏰ Time: ${shift.start_time}–${shift.end_time}\n📍 Location: ${shift.location_name}\n\nSee you then!\n\nShiftGuard Team`;
      smsMsg = `ShiftGuard REMINDER: You have a shift tomorrow ${shiftInfo}.`;
    }

    const results = [];

    // Send email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: employee.email,
      subject,
      body: emailBody
    });
    await base44.asServiceRole.entities.Notification.create({
      recipient_email: employee.email,
      recipient_name: name,
      subject,
      body: emailBody,
      type: "email",
      category: "shift_assigned",
      status: "sent"
    });
    results.push({ channel: "email", to: employee.email });

    // Send SMS if phone available
    if (employee.phone) {
      const formattedPhone = employee.phone.replace(/\D/g, '');
      const e164Phone = formattedPhone.startsWith('1') ? `+${formattedPhone}` : `+1${formattedPhone}`;
      
      const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
      const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
      const TWILIO_FROM = Deno.env.get("TWILIO_PHONE_NUMBER");

      if (TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM) {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
        const auth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
        const formData = new URLSearchParams();
        formData.append('To', e164Phone);
        formData.append('From', TWILIO_FROM);
        formData.append('Body', smsMsg);

        const smsResp = await fetch(twilioUrl, {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        });
        const smsResult = await smsResp.json();
        await base44.asServiceRole.entities.Notification.create({
          recipient_phone: employee.phone,
          recipient_name: name,
          subject: "SMS",
          body: smsMsg,
          type: "sms",
          category: "shift_assigned",
          status: smsResp.ok ? "sent" : "failed",
          error: smsResp.ok ? undefined : smsResult.message
        });
        results.push({ channel: "sms", to: employee.phone, ok: smsResp.ok });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});