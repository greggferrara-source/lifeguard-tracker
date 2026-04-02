import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all certifications
    const certifications = await base44.asServiceRole.entities.Certification.list('-created_date', 1000);
    
    const now = new Date();
    const alerts = [];
    
    for (const cert of certifications) {
      if (!cert.expiry_date) continue;
      
      const expiryDate = new Date(cert.expiry_date);
      const daysUntil = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      // Check if cert expired or expiring
      if (daysUntil < 0) {
        // Expired
        alerts.push({
          type: 'certification_expired',
          severity: 'critical',
          employee_id: cert.employee_id,
          employee_name: cert.employee_name,
          certification_name: cert.name,
          expiry_date: cert.expiry_date,
          days_overdue: Math.abs(daysUntil),
          message: `${cert.name} certification expired ${Math.abs(daysUntil)} days ago for ${cert.employee_name}`
        });
      } else if (daysUntil <= 7) {
        // Expiring within 7 days
        alerts.push({
          type: 'certification_expiring_soon',
          severity: 'high',
          employee_id: cert.employee_id,
          employee_name: cert.employee_name,
          certification_name: cert.name,
          expiry_date: cert.expiry_date,
          days_remaining: daysUntil,
          message: `${cert.name} certification expires in ${daysUntil} days for ${cert.employee_name}`
        });
      } else if (daysUntil <= 30) {
        // Expiring within 30 days
        alerts.push({
          type: 'certification_expiring',
          severity: 'medium',
          employee_id: cert.employee_id,
          employee_name: cert.employee_name,
          certification_name: cert.name,
          expiry_date: cert.expiry_date,
          days_remaining: daysUntil,
          message: `${cert.name} certification expires in ${daysUntil} days for ${cert.employee_name}`
        });
      }
    }
    
    // Check for OSHA/MAHC compliance gaps
    const allEmployees = await base44.asServiceRole.entities.Employee.list();
    const employees = allEmployees.filter(e => e.status === 'active');
    const requiredCerts = ['CPR', 'First Aid', 'Lifeguard'];
    
    for (const emp of employees) {
      const empCerts = certifications.filter(c => c.employee_id === emp.id);
      
      for (const reqCert of requiredCerts) {
        const hasCert = empCerts.some(c => c.name && c.name.toLowerCase().includes(reqCert.toLowerCase()));
        
        if (!hasCert) {
          alerts.push({
            type: 'compliance_gap',
            severity: 'high',
            employee_id: emp.id,
            employee_name: `${emp.first_name} ${emp.last_name}`,
            certification_name: reqCert,
            message: `${emp.first_name} ${emp.last_name} is missing required ${reqCert} certification (OSHA/MAHC compliance)`
          });
        }
      }
    }
    
    // Create in-app notifications
    // Find all managers/admins to notify
    const adminEmails = employees.filter(e => e.role === 'manager' || e.role === 'supervisor').map(e => e.email).filter(Boolean);
    if (adminEmails.length === 0) adminEmails.push('admin');

    for (const alert of alerts) {
      const notifType = (alert.type === 'certification_expired' || alert.type === 'certification_expiring_soon' || alert.type === 'certification_expiring')
        ? 'certification_expiry' : 'compliance_gap';
      const severity = alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'warning' : 'info';
      for (const email of adminEmails) {
        await base44.asServiceRole.entities.UserNotification.create({
          recipient_email: email,
          title: alert.severity === 'critical' ? '🚨 Critical Alert' : alert.severity === 'high' ? '⚠️ Urgent Alert' : '📋 Compliance Notice',
          message: alert.message,
          notification_type: notifType,
          severity,
          read: false,
          action_url: alert.employee_id ? `/employee/${alert.employee_id}` : '/certifications'
        });
      }
    }
    
    // Send email alerts for critical/high severity
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');
    
    if (criticalAlerts.length > 0) {
      const emailBody = `
        <h2>Compliance Alerts</h2>
        <p>The following compliance issues require immediate attention:</p>
        <ul>
          ${criticalAlerts.map(a => `<li><strong>${a.certification_name}</strong>: ${a.message}</li>`).join('')}
        </ul>
        <p>Please take action immediately to maintain OSHA/MAHC compliance.</p>
      `;
      
      // Send to facility managers
      const managers = employees.filter(e => e.role === 'manager' || e.role === 'supervisor');
      for (const mgr of managers) {
        if (mgr.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: mgr.email,
            subject: `🚨 ${criticalAlerts.length} Compliance Alert(s) Require Attention`,
            body: emailBody
          });
        }
      }
    }
    
    return Response.json({
      success: true,
      alerts_generated: alerts.length,
      critical_alerts: alerts.filter(a => a.severity === 'critical').length,
      high_alerts: alerts.filter(a => a.severity === 'high').length,
      alerts: alerts
    });
    
  } catch (error) {
    console.error('Compliance alerts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});