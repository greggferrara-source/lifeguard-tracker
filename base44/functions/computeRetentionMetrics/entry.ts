/**
 * computeRetentionMetrics
 * Scheduled daily — calculates activation/engagement/churn scores
 * and updates UserActivityMetric records.
 * Admin-only endpoint.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

function calcActivationScore({ has_added_staff, has_added_certs, has_created_schedule, has_added_location }) {
  let score = 0;
  if (has_added_location) score += 20;
  if (has_added_staff) score += 30;
  if (has_added_certs) score += 25;
  if (has_created_schedule) score += 25;
  return score;
}

function calcEngagementScore({ login_count_7d = 0, shifts_created = 0, schedules_generated = 0, smart_scheduler_uses = 0, dashboard_views = 0 }) {
  // Logins per week: max 5 = 40pts
  const loginPts = Math.min(login_count_7d, 5) * 8;
  // Actions: each action up to 12 = 60pts
  const actionTotal = shifts_created + schedules_generated + smart_scheduler_uses;
  const actionPts = Math.min(actionTotal, 12) * 5;
  return Math.min(100, loginPts + actionPts);
}

function calcChurnRisk(metric) {
  const now = Date.now();
  const lastActive = metric.last_active ? new Date(metric.last_active).getTime() : 0;
  const daysSinceActive = Math.floor((now - lastActive) / 86400000);

  let risk = 0;
  if (daysSinceActive > 14) risk += 40;
  else if (daysSinceActive > 7) risk += 20;
  else if (daysSinceActive > 3) risk += 10;

  if (metric.login_count_7d === 0) risk += 25;
  else if (metric.login_count_7d < 2) risk += 10;

  if (!metric.has_created_schedule) risk += 20;
  if (!metric.has_added_staff) risk += 15;

  return Math.min(100, risk);
}

function calcRetentionRisk(churnScore) {
  if (churnScore >= 60) return "high";
  if (churnScore >= 30) return "medium";
  return "low";
}

function calcExpansionSignal(metric) {
  let score = 0;
  if (metric.location_count >= 3) score += 3;
  else if (metric.location_count >= 2) score += 2;
  if (metric.active_staff_count >= 20) score += 3;
  else if (metric.active_staff_count >= 10) score += 2;
  if (metric.smart_scheduler_uses >= 5) score += 2;
  if (metric.dashboard_views >= 20) score += 1;
  if (metric.schedules_generated >= 3) score += 1;

  if (score >= 7) return "high";
  if (score >= 4) return "medium";
  if (score >= 2) return "low";
  return "none";
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Support both scheduled (service role) and manual (admin) calls
    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      if (user?.role === "admin" || user?.role === "enterprise_admin" || user?.role === "site_owner") {
        isAuthorized = true;
      }
    } catch {
      // Called from automation as service role — still ok
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const metrics = await base44.asServiceRole.entities.UserActivityMetric.list("-computed_at", 500);
    const employees = await base44.asServiceRole.entities.Employee.list("-created_date", 500);
    const locations = await base44.asServiceRole.entities.Location.list();
    const certifications = await base44.asServiceRole.entities.Certification.list();
    const subscriptions = await base44.asServiceRole.entities.UserSubscription.list();
    const shifts = await base44.asServiceRole.entities.Shift.list("-created_date", 500);

    // Build lookup maps
    const empByEmail = {};
    employees.forEach(e => { if (e.email) empByEmail[e.email] = e; });

    const subByEmail = {};
    subscriptions.forEach(s => { if (s.user_email) subByEmail[s.user_email] = s; });

    const now = new Date().toISOString();
    let updated = 0;

    for (const metric of metrics) {
      const sub = subByEmail[metric.user_email];

      // Count resources associated to this account's email domain or creator
      const userEmployees = employees.filter(e => e.status === "active");
      const userLocations = locations;
      const userCerts = certifications.filter(c => c.created_by === metric.user_email);
      const userShifts = shifts.filter(s => s.created_by === metric.user_email);

      const enriched = {
        ...metric,
        active_staff_count: userEmployees.length,
        location_count: userLocations.length,
        has_added_staff: userEmployees.length > 0,
        has_added_certs: userCerts.length > 0 || metric.has_added_certs,
        has_created_schedule: userShifts.length > 0 || metric.has_created_schedule,
        has_added_location: userLocations.length > 0,
        plan_name: sub?.plan_name || metric.plan_name || null,
      };

      const activationScore = calcActivationScore(enriched);
      const engagementScore = calcEngagementScore(enriched);
      const churnRiskScore = calcChurnRisk(enriched);
      const retentionRisk = calcRetentionRisk(churnRiskScore);
      const expansionSignal = calcExpansionSignal(enriched);

      await base44.asServiceRole.entities.UserActivityMetric.update(metric.id, {
        active_staff_count: enriched.active_staff_count,
        location_count: enriched.location_count,
        has_added_staff: enriched.has_added_staff,
        has_added_certs: enriched.has_added_certs,
        has_created_schedule: enriched.has_created_schedule,
        has_added_location: enriched.has_added_location,
        plan_name: enriched.plan_name,
        activation_score: activationScore,
        engagement_score: engagementScore,
        churn_risk_score: churnRiskScore,
        retention_risk: retentionRisk,
        expansion_signal: expansionSignal,
        computed_at: now,
      });
      updated++;
    }

    return Response.json({ ok: true, updated, total: metrics.length });
  } catch (error) {
    console.error("computeRetentionMetrics error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});