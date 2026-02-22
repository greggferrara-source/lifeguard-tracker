import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { alert_id } = await req.json();

    // Fetch alert
    const alert = await base44.entities.UrgentAlert.get(alert_id);
    if (!alert) {
      return Response.json({ error: 'Alert not found' }, { status: 404 });
    }

    // Get employees to notify
    let employees = await base44.entities.Employee.list();
    if (alert.location_id) {
      employees = employees.filter(e => e.location_id === alert.location_id);
    }
    if (alert.target_roles.length > 0) {
      employees = employees.filter(e => alert.target_roles.includes(e.role));
    }

    const results = {
      sms_sent: 0,
      email_sent: 0,
      push_sent: 0,
      announcement_created: false,
      errors: []
    };

    // Send SMS
    if (alert.send_sms && employees.length > 0) {
      for (const emp of employees) {
        if (emp.phone) {
          try {
            await base44.functions.invoke('sendSMS', {
              phone: emp.phone,
              message: `[${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`
            });
            results.sms_sent++;
          } catch (e) {
            results.errors.push(`SMS to ${emp.email}: ${e.message}`);
          }
        }
      }
    }

    // Send Email
    if (alert.send_email && employees.length > 0) {
      for (const emp of employees) {
        if (emp.email) {
          try {
            await base44.functions.invoke('sendEmail', {
              to: emp.email,
              subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
              body: `<h2>${alert.title}</h2><p>${alert.message}</p><p><strong>Location:</strong> ${alert.location_name || 'All locations'}</p>`
            });
            results.email_sent++;
          } catch (e) {
            results.errors.push(`Email to ${emp.email}: ${e.message}`);
          }
        }
      }
    }

    // Create Announcement
    if (alert.send_announcement) {
      try {
        await base44.entities.Announcement.create({
          title: alert.title,
          content: alert.message,
          priority: alert.severity,
          location_id: alert.location_id || null,
          author_name: user.full_name || user.email
        });
        results.announcement_created = true;
      } catch (e) {
        results.errors.push(`Announcement: ${e.message}`);
      }
    }

    return Response.json(results);
  } catch (error) {
    console.error('Error sending urgent alert:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});