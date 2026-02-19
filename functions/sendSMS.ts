import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM = Deno.env.get("TWILIO_PHONE_NUMBER");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { to, message, employee_id, category } = body;

    if (!to || !message) {
      return Response.json({ error: "Missing required fields: to, message" }, { status: 400 });
    }

    if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
      return Response.json({ error: "Twilio credentials not configured" }, { status: 500 });
    }

    // Format phone number
    const formattedPhone = to.replace(/\D/g, '');
    const e164Phone = formattedPhone.startsWith('1') ? `+${formattedPhone}` : `+1${formattedPhone}`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
    const auth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);

    const formData = new URLSearchParams();
    formData.append('To', e164Phone);
    formData.append('From', TWILIO_FROM);
    formData.append('Body', message);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const result = await response.json();

    if (!response.ok) {
      await base44.asServiceRole.entities.Notification.create({
        recipient_phone: to,
        subject: "SMS",
        body: message,
        type: "sms",
        category: category || "general",
        status: "failed",
        error: result.message || "Twilio error"
      });
      return Response.json({ error: result.message || "Failed to send SMS" }, { status: 400 });
    }

    await base44.asServiceRole.entities.Notification.create({
      recipient_phone: to,
      subject: "SMS",
      body: message,
      type: "sms",
      category: category || "general",
      status: "sent"
    });

    return Response.json({ success: true, sid: result.sid });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});