import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all notification preferences
    const allPrefs = await base44.asServiceRole.entities.NotificationPreference.list('-created_date', 1000);

    // Fetch relevant data
    const certifications = await base44.asServiceRole.entities.Certification.list('-expiry_date', 500);
    const assessments = await base44.asServiceRole.entities.ComplianceAssessment.list('-created_date', 200);
    const gaps = await base44.asServiceRole.entities.ComplianceGap.list('-created_date', 200);

    const notifications = [];
    const today = new Date();

    // Process each user's preferences
    for (const pref of allPrefs) {
      // Certification expiry alerts
      if (pref.notification_type === 'certification_expiry' && pref.email_enabled) {
        const expiringCerts = certifications.filter(c => {
          if (!c.expiry_date) return false;
          const expDate = new Date(c.expiry_date);
          const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
        });

        if (expiringCerts.length > 0) {
          const notification = await base44.asServiceRole.entities.UserNotification.create({
            recipient_email: pref.user_email,
            recipient_name: pref.user_name,
            title: `${expiringCerts.length} Certification${expiringCerts.length !== 1 ? 's' : ''} Expiring Soon`,
            message: `The following certifications are expiring within 30 days: ${expiringCerts.map(c => c.title).join(', ')}`,
            notification_type: 'certification_expiry',
            severity: expiringCerts.some(c => {
              const daysUntil = Math.ceil((new Date(c.expiry_date) - today) / (1000 * 60 * 60 * 24));
              return daysUntil <= 7;
            }) ? 'critical' : 'warning',
            created_at: new Date().toISOString()
          });

          // Send email
          await base44.integrations.Core.SendEmail({
            to: pref.user_email,
            subject: `Certification Expiry Alert: ${expiringCerts.length} Expiring Soon`,
            body: `Hello ${pref.user_name},\n\nThe following certifications are expiring within 30 days:\n\n${expiringCerts.map(c => `• ${c.title} - Expires: ${c.expiry_date}`).join('\n')}\n\nPlease renew them as soon as possible.\n\nBest regards,\nLifeGuard Tracker`
          });

          notifications.push(notification);
        }
      }

      // Pending assessment alerts
      if (pref.notification_type === 'compliance_gap' && pref.email_enabled) {
        const pendingAssessments = assessments.filter(a => a.status === 'in_progress' || a.status === 'not_started');

        if (pendingAssessments.length > 0) {
          const notification = await base44.asServiceRole.entities.UserNotification.create({
            recipient_email: pref.user_email,
            recipient_name: pref.user_name,
            title: `${pendingAssessments.length} Pending Compliance Assessment${pendingAssessments.length !== 1 ? 's' : ''}`,
            message: `You have ${pendingAssessments.length} pending compliance assessment(s) that need attention.`,
            notification_type: 'compliance_gap',
            severity: 'warning',
            created_at: new Date().toISOString()
          });

          await base44.integrations.Core.SendEmail({
            to: pref.user_email,
            subject: `Action Required: ${pendingAssessments.length} Pending Compliance Assessment${pendingAssessments.length !== 1 ? 's' : ''}`,
            body: `Hello ${pref.user_name},\n\nYou have ${pendingAssessments.length} pending compliance assessment(s):\n\n${pendingAssessments.map(a => `• ${a.title} (${a.assessment_type})`).join('\n')}\n\nPlease review and complete them at your earliest convenience.\n\nBest regards,\nLifeGuard Tracker`
          });

          notifications.push(notification);
        }
      }

      // Overdue task alerts
      if (pref.notification_type === 'task_assignment' && pref.email_enabled) {
        const overdueTasks = gaps.filter(g => {
          if (!g.due_date) return false;
          return new Date(g.due_date) < today && g.status !== 'completed' && g.status !== 'verified';
        });

        if (overdueTasks.length > 0) {
          const notification = await base44.asServiceRole.entities.UserNotification.create({
            recipient_email: pref.user_email,
            recipient_name: pref.user_name,
            title: `${overdueTasks.length} Overdue Task${overdueTasks.length !== 1 ? 's' : ''}`,
            message: `You have ${overdueTasks.length} overdue compliance task(s) that need immediate attention.`,
            notification_type: 'task_assignment',
            severity: 'critical',
            created_at: new Date().toISOString()
          });

          await base44.integrations.Core.SendEmail({
            to: pref.user_email,
            subject: `URGENT: ${overdueTasks.length} Overdue Compliance Task${overdueTasks.length !== 1 ? 's' : ''}`,
            body: `Hello ${pref.user_name},\n\nYou have ${overdueTasks.length} overdue compliance task(s):\n\n${overdueTasks.map(t => `• ${t.gap_description} (Due: ${t.due_date})`).join('\n')}\n\nPlease complete these immediately.\n\nBest regards,\nLifeGuard Tracker`
          });

          notifications.push(notification);
        }
      }
    }

    return Response.json({ 
      notifications_sent: notifications.length,
      details: notifications 
    });
  } catch (error) {
    console.error('Compliance notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});