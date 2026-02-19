import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const [employees, locations, shifts, settingsRecords] = await Promise.all([
      base44.asServiceRole.entities.Employee.list(),
      base44.asServiceRole.entities.Location.list(),
      base44.asServiceRole.entities.Shift.list("-date", 500),
      base44.asServiceRole.entities.AppSettings.filter({ key: "alert_settings" })
    ]);

    const settings = settingsRecords.length > 0 ? settingsRecords[0].value : {};
    const isEnabled = (key) => settings[key] !== false; // default true if not set

    const results = { alerts_created: 0, reminders_sent: 0, errors: [] };

    // 1. Scan understaffing for today and tomorrow
    if (isEnabled("understaffing"))
    for (const scanDate of [today, tomorrow]) {
      const dateShifts = shifts.filter(s => s.date === scanDate && s.status !== "cancelled");
      for (const loc of locations.filter(l => l.status === "active")) {
        const locShifts = dateShifts.filter(s => s.location_id === loc.id);
        const staffedCount = locShifts.filter(s => s.employee_id && s.status === "scheduled").length;
        const required = loc.min_guards_required || 1;
        if (staffedCount < required) {
          await base44.asServiceRole.entities.Alert.create({
            type: "understaffing",
            severity: staffedCount === 0 ? "critical" : "warning",
            title: `Understaffing at ${loc.name} on ${scanDate}`,
            message: `${loc.name} needs ${required} guard(s) on ${scanDate} but only ${staffedCount} scheduled.`,
            date: scanDate,
            location_id: loc.id,
            location_name: loc.name,
            resolved: false
          });
          results.alerts_created++;
        }
      }
    }

    // 2. Scan shift conflicts for today
    if (isEnabled("conflicts")) {
      const todayShifts = shifts.filter(s => s.date === today && s.employee_id && s.status !== "cancelled");
      const byEmployee = {};
      for (const s of todayShifts) {
        if (!byEmployee[s.employee_id]) byEmployee[s.employee_id] = [];
        byEmployee[s.employee_id].push(s);
      }
      for (const [empId, empShifts] of Object.entries(byEmployee)) {
        if (empShifts.length > 1) {
          for (let i = 0; i < empShifts.length; i++) {
            for (let j = i + 1; j < empShifts.length; j++) {
              const a = empShifts[i], b = empShifts[j];
              if (a.start_time < b.end_time && a.end_time > b.start_time) {
                await base44.asServiceRole.entities.Alert.create({
                  type: "conflict",
                  severity: "critical",
                  title: `Shift Conflict: ${a.employee_name}`,
                  message: `${a.employee_name} has overlapping shifts on ${today}.`,
                  date: today,
                  employee_id: empId,
                  employee_name: a.employee_name,
                  resolved: false
                });
                results.alerts_created++;
              }
            }
          }
        }
      }
    }

    // 3. Cert expiry check
    if (isEnabled("cert_expiry")) {
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      const thirtyDaysStr = thirtyDays.toISOString().split("T")[0];
      for (const emp of employees.filter(e => e.status === "active")) {
        for (const cert of (emp.certifications || [])) {
          if (cert.expiry_date && cert.expiry_date <= thirtyDaysStr) {
            const expired = cert.expiry_date < today;
            await base44.asServiceRole.entities.Alert.create({
              type: "cert_expiry",
              severity: expired ? "critical" : "warning",
              title: `Cert ${expired ? "Expired" : "Expiring"}: ${emp.first_name} ${emp.last_name}`,
              message: `${emp.first_name} ${emp.last_name}'s ${cert.name} ${expired ? "expired" : "expires"} on ${cert.expiry_date}.`,
              employee_id: emp.id,
              employee_name: `${emp.first_name} ${emp.last_name}`,
              resolved: false
            });
            results.alerts_created++;
          }
        }
      }
    }

    // 4. Log shift reminders for tomorrow's shifts (skips actual email for employees outside app)
    const tomorrowShifts = shifts.filter(s => s.date === tomorrow && s.employee_id && s.status === "scheduled");
    for (const shift of tomorrowShifts) {
      const emp = employees.find(e => e.id === shift.employee_id);
      if (!emp || !emp.email) continue;
      
      const subject = `ShiftGuard: Shift Reminder for Tomorrow`;
      const body = `Hi ${emp.first_name},\n\nReminder: You have a shift tomorrow!\n\n📅 Date: ${shift.date}\n⏰ Time: ${shift.start_time}–${shift.end_time}\n📍 Location: ${shift.location_name}\n\nShiftGuard Team`;
      
      // Log reminder in notification history
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: emp.email,
        recipient_name: `${emp.first_name} ${emp.last_name}`,
        subject, body, type: "email", category: "shift_reminder", status: "sent"
      });
      results.reminders_sent++;

      // SMS reminder via Twilio
      if (emp.phone) {
        const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
        const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
        const TWILIO_FROM = Deno.env.get("TWILIO_PHONE_NUMBER");
        if (TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM) {
          const phone = emp.phone.replace(/\D/g, '');
          const e164 = phone.startsWith('1') ? `+${phone}` : `+1${phone}`;
          const smsBody = `ShiftGuard REMINDER: Shift tomorrow ${shift.date} ${shift.start_time}-${shift.end_time} at ${shift.location_name}.`;
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
          const auth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
          const fd = new URLSearchParams();
          fd.append('To', e164); fd.append('From', TWILIO_FROM); fd.append('Body', smsBody);
          await fetch(twilioUrl, {
            method: 'POST',
            headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: fd.toString()
          }).catch(() => {});
        }
      }
    }

    // 5. Log scan results as a notification (no email to avoid "outside app" errors for demo data)
    await base44.asServiceRole.entities.Notification.create({
      recipient_email: "system@shiftguard.internal",
      recipient_name: "System",
      subject: `Daily Scan Complete: ${results.alerts_created} alert(s)`,
      body: `Daily scan for ${today}: ${results.alerts_created} alerts created, ${results.reminders_sent} reminders sent.`,
      type: "email",
      category: "general",
      status: "sent"
    }).catch(() => {});

    return Response.json({ success: true, ...results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});