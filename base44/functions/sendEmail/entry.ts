import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { to, subject, body: emailBody, category, employee_id, log = true } = body;

    if (!to || !subject || !emailBody) {
      return Response.json({ error: "Missing required fields: to, subject, body" }, { status: 400 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      subject,
      body: emailBody
    });

    if (log) {
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: to,
        subject,
        body: emailBody,
        type: "email",
        category: category || "general",
        status: "sent",
        recipient_name: body.recipient_name || ""
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});