import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    console.log("Step 1a: employees...");
    const employees = await base44.asServiceRole.entities.Employee.list();
    console.log("employees ok:", employees.length);
    console.log("Step 1b: locations...");
    const locations = await base44.asServiceRole.entities.Location.list();
    console.log("locations ok:", locations.length);
    console.log("Step 1c: shifts...");
    const shifts = await base44.asServiceRole.entities.Shift.list("-date", 500);
    console.log("shifts ok:", shifts.length);
    console.log("Step 1d: certifications...");
    const certifications = await base44.asServiceRole.entities.Certification.list();
    console.log("certifications ok:", certifications.length);
    console.log("Step 1e: settings...");
    const allSettings = await base44.asServiceRole.entities.AppSettings.list();
    console.log("settings ok:", allSettings.length);
    const settingRecord = allSettings.find(s => s.key === "alert_settings");
    const settings = settingRecord ? settingRecord.value : {};
    const isEnabled = (key) => settings[key] !== false;

    const results = { alerts_created: 0, reminders_sent: 0, errors: [] };

    console.log("Step 2: loading alerts...");
    const existingAlerts = await base44.asServiceRole.entities.Alert.list("-created_date", 500);
    console.log("existing alerts:", existingAlerts.length);
    const hasAlert = (type, key) => existingAlerts.some(a => !a.resolved && a.type === type && a.dedup_key === key);

    // 1. Scan understaffing for today and tomorrow
    if (isEnabled("understaffing")) {
      console.log("Step 3: understaffing scan...");
      for (const scanDate of [today, tomorrow]) {
        const dateShifts = shifts.filter(s => s.date === scanDate && s.status !== "cancelled");
        for (const loc of locations.filter(l => l.status === "active")) {
          const locShifts = dateShifts.filter(s => s.location_id === loc.id);
          const staffedCount = locShifts.filter(s => s.employee_id && s.status === "scheduled").length;
          const required = loc.min_guards_required || 1;
          const dedupKey = `understaffing_${loc.id}_${scanDate}`;
          if (staffedCount < required && !hasAlert("understaffing", dedupKey)) {
            await base44.asServiceRole.entities.Alert.create({
              type: "understaffing",
              severity: staffedCount === 0 ? "critical" : "warning",
              title: `Understaffing at ${loc.name} on ${scanDate}`,
              message: `${loc.name} needs ${required} guard(s) on ${scanDate} but only ${staffedCount} scheduled.`,
              date: scanDate,
              location_id: loc.id,
              location_name: loc.name,
              dedup_key: dedupKey,
              resolved: false
            });
            results.alerts_created++;
          }
        }
      }
    }

    // 2. Scan shift conflicts for today
    if (isEnabled("conflicts")) {
      console.log("Step 4: conflict scan...");
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
                const dedupKey = `conflict_${empId}_${today}`;
                if (!hasAlert("conflict", dedupKey)) {
                  await base44.asServiceRole.entities.Alert.create({
                    type: "conflict",
                    severity: "critical",
                    title: `Shift Conflict: ${a.employee_name}`,
                    message: `${a.employee_name} has overlapping shifts on ${today}.`,
                    date: today,
                    employee_id: empId,
                    employee_name: a.employee_name,
                    dedup_key: dedupKey,
                    resolved: false
                  });
                  results.alerts_created++;
                }
              }
            }
          }
        }
      }
    }

    // 3. Cert expiry check (uses separate Certification entity)
    if (isEnabled("cert_expiry")) {
      console.log("Step 5: cert expiry scan...");
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      const thirtyDaysStr = thirtyDays.toISOString().split("T")[0];
      const activeCerts = certifications.filter(c => c.status === "approved" && c.expiry_date);
      for (const cert of activeCerts) {
        if (cert.expiry_date <= thirtyDaysStr) {
          const expired = cert.expiry_date < today;
          const dedupKey = `cert_expiry_${cert.id}`;
          if (!hasAlert("cert_expiry", dedupKey)) {
            await base44.asServiceRole.entities.Alert.create({
              type: "cert_expiry",
              severity: expired ? "critical" : "warning",
              title: `Cert ${expired ? "Expired" : "Expiring"}: ${cert.employee_name}`,
              message: `${cert.employee_name}'s ${cert.name} ${expired ? "expired" : "expires"} on ${cert.expiry_date}.`,
              employee_id: cert.employee_id,
              employee_name: cert.employee_name,
              dedup_key: dedupKey,
              resolved: false
            });
            results.alerts_created++;
          }
        }
      }
    }

    // 4. Shift reminders for tomorrow's shifts
    if (!isEnabled("shift_reminders")) {
      return Response.json({ success: true, ...results });
    }
    console.log("Step 6: shift reminders...");
    const tomorrowShifts = shifts.filter(s => s.date === tomorrow && s.employee_id && s.status === "scheduled");
    for (const shift of tomorrowShifts) {
      const emp = employees.find(e => e.id === shift.employee_id);
      if (!emp || !emp.email) continue;

      const subject = `LifeGuard Tracker: Shift Reminder for Tomorrow`;
      const body = `Hi ${emp.first_name},\n\nReminder: You have a shift tomorrow!\n\n📅 Date: ${shift.date}\n⏰ Time: ${shift.start_time}–${shift.end_time}\n📍 Location: ${shift.location_name}\n\nLifeGuard Tracker Team`;

      await base44.asServiceRole.entities.Notification.create({
        recipient_email: emp.email,
        recipient_name: `${emp.first_name} ${emp.last_name}`,
        subject,
        body,
        type: "email",
        category: "shift_reminder",
        status: "sent"
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
          const smsBody = `LifeGuard Tracker REMINDER: Shift tomorrow ${shift.date} ${shift.start_time}-${shift.end_time} at ${shift.location_name}.`;
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

    console.log("Done:", results);
    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error("dailyScan error:", error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});