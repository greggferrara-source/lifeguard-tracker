import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || !["admin", "site_owner"].includes(user.role)) {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { message, subject, send_email = true, send_sms = false, roles = ["lifeguard","head_lifeguard","supervisor","manager"], location_id } = body;

    if (!message) return Response.json({ error: "message required" }, { status: 400 });

    const employees = await base44.asServiceRole.entities.Employee.list();
    let targets = employees.filter(e => e.status === "active" && roles.includes(e.role));

    const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_FROM = Deno.env.get("TWILIO_PHONE_NUMBER");

    const results = [];

    for (const emp of targets) {
      if (send_email && emp.email) {
        const emailSubject = subject || "ShiftGuard: Important Update";
        const emailBody = `Hi ${emp.first_name},\n\n${message}\n\nShiftGuard Team`;
        await base44.asServiceRole.integrations.Core.SendEmail({ to: emp.email, subject: emailSubject, body: emailBody });
        await base44.asServiceRole.entities.Notification.create({
          recipient_email: emp.email,
          recipient_name: `${emp.first_name} ${emp.last_name}`,
          subject: emailSubject, body: emailBody, type: "email", category: "general", status: "sent"
        });
        results.push({ emp: emp.first_name, channel: "email" });
      }

      if (send_sms && emp.phone && TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM) {
        const phone = emp.phone.replace(/\D/g, '');
        const e164 = phone.startsWith('1') ? `+${phone}` : `+1${phone}`;
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
        const auth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
        const fd = new URLSearchParams();
        fd.append('To', e164); fd.append('From', TWILIO_FROM); fd.append('Body', `ShiftGuard: ${message}`);
        const resp = await fetch(twilioUrl, {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: fd.toString()
        });
        results.push({ emp: emp.first_name, channel: "sms", ok: resp.ok });
      }
    }

    return Response.json({ success: true, sent: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});