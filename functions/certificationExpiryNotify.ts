import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date();
    const in30 = new Date(today); in30.setDate(in30.getDate() + 30);
    const in7 = new Date(today); in7.setDate(in7.getDate() + 7);

    const todayStr = today.toISOString().split('T')[0];
    const in30Str = in30.toISOString().split('T')[0];
    const in7Str = in7.toISOString().split('T')[0];

    const certs = await base44.asServiceRole.entities.Certification.list();
    const employees = await base44.asServiceRole.entities.Employee.list();
    const empMap = Object.fromEntries(employees.map(e => [e.id, e]));

    let notified = 0;

    for (const cert of certs) {
      if (!cert.expiry_date || cert.status === 'expired') continue;

      const emp = empMap[cert.employee_id];
      if (!emp?.email) continue;

      const daysLeft = Math.ceil((new Date(cert.expiry_date) - today) / (1000 * 60 * 60 * 24));

      // Mark expired
      if (cert.expiry_date < todayStr && cert.status !== 'expired') {
        await base44.asServiceRole.entities.Certification.update(cert.id, { status: 'expired' });
      }

      // 30-day warning
      if (!cert.notification_sent_30 && cert.expiry_date <= in30Str && cert.expiry_date >= todayStr) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: emp.email,
          subject: `ShiftGuard: Certification expiring in ${daysLeft} days — ${cert.name}`,
          body: `Hi ${emp.first_name},\n\nYour certification "${cert.name}" will expire on ${cert.expiry_date} (${daysLeft} days from now).\n\nPlease renew it and upload the new certificate in ShiftGuard.\n\nShiftGuard Team`
        });
        // Notify managers too
        const managers = employees.filter(e => e.role === 'manager' || e.role === 'supervisor');
        for (const mgr of managers) {
          if (!mgr.email) continue;
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: mgr.email,
            subject: `ShiftGuard: Staff certification expiring soon`,
            body: `Hi ${mgr.first_name},\n\n${emp.first_name} ${emp.last_name}'s "${cert.name}" certification expires on ${cert.expiry_date} (${daysLeft} days).\n\nShiftGuard Team`
          });
        }
        await base44.asServiceRole.entities.Certification.update(cert.id, { notification_sent_30: true });
        notified++;
      }

      // 7-day warning
      if (!cert.notification_sent_7 && cert.expiry_date <= in7Str && cert.expiry_date >= todayStr) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: emp.email,
          subject: `URGENT: ShiftGuard certification expires in ${daysLeft} days — ${cert.name}`,
          body: `Hi ${emp.first_name},\n\nURGENT: Your "${cert.name}" certification expires in ${daysLeft} days (${cert.expiry_date}). Please renew immediately.\n\nShiftGuard Team`
        });
        await base44.asServiceRole.entities.Certification.update(cert.id, { notification_sent_7: true });
        notified++;
      }
    }

    return Response.json({ success: true, notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});