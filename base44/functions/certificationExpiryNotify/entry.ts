import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all employees
    const employees = await base44.asServiceRole.entities.Employee.list();
    const certifications = await base44.asServiceRole.entities.Certification.list();

    // Calculate expiration dates
    const today = new Date();
    const thirtyDaysOut = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const fourteenDaysOut = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    const alerts = [];

    for (const cert of certifications) {
      const expDate = new Date(cert.expiry_date);
      const employee = employees.find(e => e.id === cert.employee_id);

      // Check for expired certs
      if (expDate <= today) {
        alerts.push({
          type: 'expired',
          employee: employee?.first_name + ' ' + employee?.last_name,
          email: employee?.email,
          certification: cert.name,
          expiry_date: cert.expiry_date
        });
      }
      // Check for certs expiring in 14-30 days
      else if (expDate > fourteenDaysOut && expDate <= thirtyDaysOut) {
        alerts.push({
          type: 'expiring_soon',
          employee: employee?.first_name + ' ' + employee?.last_name,
          email: employee?.email,
          certification: cert.name,
          expiry_date: cert.expiry_date,
          days_until: Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))
        });
      }
      // Check for certs expiring within 14 days (urgent)
      else if (expDate > today && expDate <= fourteenDaysOut) {
        alerts.push({
          type: 'expiring_urgent',
          employee: employee?.first_name + ' ' + employee?.last_name,
          email: employee?.email,
          certification: cert.name,
          expiry_date: cert.expiry_date,
          days_until: Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))
        });
      }
    }

    // Log alerts for review
    console.log(`Generated ${alerts.length} certification alerts`);
    console.log(JSON.stringify(alerts, null, 2));

    // Create urgent alerts in the system
    const urgentAlerts = alerts.filter(a => a.type === 'expired' || a.type === 'expiring_urgent');
    for (const alert of urgentAlerts) {
      try {
        await base44.asServiceRole.entities.UrgentAlert.create({
          title: alert.type === 'expired' ? `URGENT: ${alert.employee} - ${alert.certification} Expired` : `${alert.employee} - ${alert.certification} Expiring in ${alert.days_until} Days`,
          severity: alert.type === 'expired' ? 'critical' : 'high',
          type: 'staffing',
          message: `${alert.employee}'s ${alert.certification} certification ${alert.type === 'expired' ? 'has expired on' : 'will expire on'} ${alert.expiry_date}. Immediate action required.`,
          status: 'active',
          send_email: true,
          send_sms: true,
          target_roles: ['admin', 'manager', 'site_owner']
        });
      } catch (e) {
        console.error(`Error creating alert for ${alert.employee}:`, e.message);
      }
    }

    return Response.json({
      status: 'success',
      total_alerts: alerts.length,
      urgent_count: urgentAlerts.length,
      alerts: alerts
    });
  } catch (error) {
    console.error('Certification expiry notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});