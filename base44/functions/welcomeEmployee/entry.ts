import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { employee_id } = body;

    const employees = await base44.asServiceRole.entities.Employee.list();
    const emp = employees.find(e => e.id === employee_id);

    if (!emp || !emp.email) {
      return Response.json({ error: "Employee not found or no email" }, { status: 404 });
    }

    const name = `${emp.first_name} ${emp.last_name}`;
    const roleLabels = { lifeguard: "Lifeguard", head_lifeguard: "Head Lifeguard", supervisor: "Supervisor", manager: "Manager" };
    const roleLabel = roleLabels[emp.role] || emp.role;

    const subject = `Welcome to ShiftGuard, ${emp.first_name}!`;
    const emailBody = `Hi ${emp.first_name},\n\nWelcome to ShiftGuard! You've been added to the team as a ${roleLabel}.\n\nHere's what you need to know:\n\n✅ Your schedule will be managed through ShiftGuard\n📧 You'll receive email notifications for shift assignments, updates, and reminders\n📱 SMS alerts will be sent to ${emp.phone || "your phone"} for urgent updates\n⏰ Shift reminders are sent the evening before\n\nIf you have any questions about your schedule, contact your supervisor.\n\nWelcome aboard!\nShiftGuard Team`;

    await base44.asServiceRole.integrations.Core.SendEmail({ to: emp.email, subject, body: emailBody });
    
    await base44.asServiceRole.entities.Notification.create({
      recipient_email: emp.email,
      recipient_name: name,
      subject,
      body: emailBody,
      type: "email",
      category: "welcome",
      status: "sent"
    });

    // SMS welcome if phone available
    if (emp.phone) {
      const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
      const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
      const TWILIO_FROM = Deno.env.get("TWILIO_PHONE_NUMBER");
      if (TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM) {
        const phone = emp.phone.replace(/\D/g, '');
        const e164 = phone.startsWith('1') ? `+${phone}` : `+1${phone}`;
        const smsMsg = `Welcome to ShiftGuard, ${emp.first_name}! You'll receive shift notifications here. Check your email for full details.`;
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
        const auth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
        const fd = new URLSearchParams();
        fd.append('To', e164); fd.append('From', TWILIO_FROM); fd.append('Body', smsMsg);
        await fetch(twilioUrl, {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: fd.toString()
        });
      }
    }

    return Response.json({ success: true, employee: name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});