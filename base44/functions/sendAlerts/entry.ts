import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { alert_type, shift_id, employee_id, location_id, date, message, severity = "warning", custom_emails = [] } = body;

    const employees = await base44.asServiceRole.entities.Employee.list();
    const locations = await base44.asServiceRole.entities.Location.list();
    const shifts = await base44.asServiceRole.entities.Shift.list("-date", 500);

    const results = [];

    // Load existing unresolved alerts for deduplication
    const existingAlerts = await base44.asServiceRole.entities.Alert.list("-created_date", 500);
    const hasAlert = (type, key) => existingAlerts.some(a => !a.resolved && a.type === type && a.dedup_key === key);

    // Build alerts based on type
    if (alert_type === "scan_understaffing") {
      const targetDate = date || new Date().toISOString().split("T")[0];
      const dateShifts = shifts.filter(s => s.date === targetDate && s.status !== "cancelled");
      
      for (const loc of locations.filter(l => l.status === "active")) {
        const locShifts = dateShifts.filter(s => s.location_id === loc.id);
        const staffedCount = locShifts.filter(s => s.employee_id && s.status === "scheduled").length;
        const required = loc.min_guards_required || 1;
        
        if (staffedCount < required) {
          const shortage = required - staffedCount;
          const dedupKey = `understaffing_${loc.id}_${targetDate}`;
          if (!hasAlert("understaffing", dedupKey)) {
            await base44.asServiceRole.entities.Alert.create({
              type: "understaffing",
              severity: staffedCount === 0 ? "critical" : "warning",
              title: `Understaffing at ${loc.name}`,
              message: `${loc.name} needs ${required} guard(s) on ${targetDate} but only ${staffedCount} scheduled. Short by ${shortage}.`,
              date: targetDate,
              location_id: loc.id,
              location_name: loc.name,
              dedup_key: dedupKey,
              resolved: false
            });
            results.push({ type: "understaffing", location: loc.name, shortage });
          }
        }
      }
    }

    if (alert_type === "scan_conflicts") {
      const targetDate = date || new Date().toISOString().split("T")[0];
      const dateShifts = shifts.filter(s => s.date === targetDate && s.employee_id && s.status !== "cancelled");
      
      const byEmployee = {};
      for (const s of dateShifts) {
        if (!byEmployee[s.employee_id]) byEmployee[s.employee_id] = [];
        byEmployee[s.employee_id].push(s);
      }
      
      for (const [empId, empShifts] of Object.entries(byEmployee)) {
        if (empShifts.length > 1) {
          // Check time overlaps
          for (let i = 0; i < empShifts.length; i++) {
            for (let j = i + 1; j < empShifts.length; j++) {
              const a = empShifts[i], b = empShifts[j];
              const aStart = a.start_time, aEnd = a.end_time, bStart = b.start_time, bEnd = b.end_time;
              if (aStart < bEnd && aEnd > bStart) {
                const dedupKey = `conflict_${empId}_${targetDate}`;
                if (!hasAlert("conflict", dedupKey)) {
                  await base44.asServiceRole.entities.Alert.create({
                    type: "conflict",
                    severity: "critical",
                    title: `Shift Conflict: ${a.employee_name}`,
                    message: `${a.employee_name} has overlapping shifts on ${targetDate}: ${a.start_time}-${a.end_time} at ${a.location_name} and ${b.start_time}-${b.end_time} at ${b.location_name}.`,
                    date: targetDate,
                    employee_id: empId,
                    employee_name: a.employee_name,
                    dedup_key: dedupKey,
                    resolved: false
                  });
                  results.push({ type: "conflict", employee: a.employee_name });
                }
              }
            }
          }
        }
      }
    }

    if (alert_type === "scan_cert_expiry") {
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      const thirtyDaysStr = thirtyDays.toISOString().split("T")[0];
      const today = new Date().toISOString().split("T")[0];

      // Use the dedicated Certification entity (not employee-embedded certs)
      const certifications = await base44.asServiceRole.entities.Certification.list();
      const activeCerts = certifications.filter(c => c.status === "approved" && c.expiry_date);
      for (const cert of activeCerts) {
        if (cert.expiry_date <= thirtyDaysStr) {
          const expired = cert.expiry_date < today;
          const dedupKey = `cert_expiry_${cert.id}`;
          if (!hasAlert("cert_expiry", dedupKey)) {
            await base44.asServiceRole.entities.Alert.create({
              type: "cert_expiry",
              severity: expired ? "critical" : "warning",
              title: `Cert ${expired ? "Expired" : "Expiring Soon"}: ${cert.employee_name}`,
              message: `${cert.employee_name}'s ${cert.name} certification ${expired ? "expired on" : "expires on"} ${cert.expiry_date}.`,
              employee_id: cert.employee_id,
              employee_name: cert.employee_name,
              dedup_key: dedupKey,
              resolved: false
            });
            results.push({ type: "cert_expiry", employee: cert.employee_name, cert: cert.name });
          }
        }
      }
    }

    if (alert_type === "callout" && shift_id) {
      const targetShift = shifts.find(s => s.id === shift_id);
      if (targetShift) {
        await base44.asServiceRole.entities.Alert.create({
          type: "callout",
          severity: "critical",
          title: `Call-out: ${targetShift.employee_name}`,
          message: `${targetShift.employee_name} called out for their shift on ${targetShift.date} (${targetShift.start_time}-${targetShift.end_time}) at ${targetShift.location_name}. This shift is now open.`,
          date: targetShift.date,
          location_id: targetShift.location_id,
          location_name: targetShift.location_name,
          employee_id: targetShift.employee_id,
          employee_name: targetShift.employee_name,
          shift_id: shift_id,
          resolved: false
        });
        await base44.asServiceRole.entities.Shift.update(shift_id, { status: "open", employee_id: "", employee_name: "" });
        results.push({ type: "callout", shift: shift_id });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});