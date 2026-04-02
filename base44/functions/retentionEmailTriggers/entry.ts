/**
 * retentionEmailTriggers
 * Scheduled daily — sends targeted retention emails based on user state.
 * 1. Inactive 5+ days → "Need help setting up?"
 * 2. Highly active → "Upgrade to Enterprise"
 * 3. Incomplete setup → Onboarding reminder
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

const APP_NAME = "LifeGuard Tracker";
const SUPPORT_EMAIL = "support@lifeguardtracker.com";

function daysSince(isoDate) {
  if (!isoDate) return 9999;
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const metrics = await base44.asServiceRole.entities.UserActivityMetric.list("-computed_at", 500);
    const now = new Date().toISOString();
    const results = { inactive: 0, upsell: 0, onboarding: 0, skipped: 0 };

    for (const metric of metrics) {
      const email = metric.user_email;
      if (!email) continue;

      const daysSinceActive = daysSince(metric.last_active);
      const isEnterprise = metric.plan_name?.toLowerCase().includes("enterprise") ||
        metric.user_role === "enterprise_admin" || metric.user_role === "enterprise_site_owner";

      // ── 1. Inactive for 5+ days ──
      if (
        daysSinceActive >= 5 &&
        !metric.inactive_email_sent &&
        metric.login_count_total > 0 // only users who logged in before
      ) {
        const setupTip = !metric.has_created_schedule
          ? "You haven't published your first schedule yet — our Smart Scheduler can do it in under 2 minutes."
          : "Your team is waiting for you. Jump back in to review this week's shifts.";

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          from_name: APP_NAME,
          subject: `${metric.user_name || "Hey"}, need help setting up your schedule?`,
          body: `Hi ${metric.user_name || "there"},

We noticed you haven't logged into ${APP_NAME} in a few days.

${setupTip}

Here's what you can do right now:
• Build your weekly schedule in 2 minutes with Smart Scheduler
• Add your team's certifications to avoid compliance gaps
• Set up alerts so you never miss a staffing issue

Log back in and pick up where you left off:
https://app.lifeguardtracker.com

Need help? Just reply to this email.

— The ${APP_NAME} Team`,
        });

        await base44.asServiceRole.entities.UserActivityMetric.update(metric.id, {
          inactive_email_sent: true,
          inactive_email_sent_at: now,
        });
        results.inactive++;
        continue;
      }

      // ── 2. Highly active + not enterprise → upsell ──
      if (
        metric.engagement_score >= 70 &&
        metric.expansion_signal === "high" &&
        !isEnterprise &&
        !metric.upsell_email_sent
      ) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          from_name: APP_NAME,
          subject: `You're getting the most out of ${APP_NAME} — unlock even more`,
          body: `Hi ${metric.user_name || "there"},

Your team is seriously active on ${APP_NAME} — and it shows.

You've been:
• Running ${metric.schedules_generated || 0} schedule${metric.schedules_generated !== 1 ? "s" : ""}
• Managing ${metric.active_staff_count || 0} active staff across ${metric.location_count || 0} location${metric.location_count !== 1 ? "s" : ""}
• Using Smart Scheduler to keep shifts covered

Teams your size typically unlock even more value with Enterprise:
✓ Multi-location compliance dashboard
✓ Advanced audit logs & reporting
✓ Performance reviews & AI safety predictions
✓ Priority support

Upgrade to Enterprise and get full operational control:
https://app.lifeguardtracker.com/Billing

— The ${APP_NAME} Team`,
        });

        await base44.asServiceRole.entities.UserActivityMetric.update(metric.id, {
          upsell_email_sent: true,
          upsell_email_sent_at: now,
        });
        results.upsell++;
        continue;
      }

      // ── 3. Incomplete setup → onboarding reminder ──
      const setupComplete = metric.has_added_staff && metric.has_added_location && metric.has_created_schedule;
      if (
        !setupComplete &&
        metric.login_count_total > 0 &&
        !metric.onboarding_reminder_sent &&
        daysSinceActive <= 14 // only prompt recent users
      ) {
        const missing = [];
        if (!metric.has_added_location) missing.push("Add your facility location");
        if (!metric.has_added_staff) missing.push("Add your lifeguard team");
        if (!metric.has_created_schedule) missing.push("Publish your first schedule");

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          from_name: APP_NAME,
          subject: `You're almost set up on ${APP_NAME} — finish in 5 minutes`,
          body: `Hi ${metric.user_name || "there"},

You're close! Here's what's left to complete your ${APP_NAME} setup:

${missing.map((m, i) => `${i + 1}. ${m}`).join("\n")}

Once these are done, you'll have full visibility into your schedule, certifications, and staffing gaps — automatically.

Finish setup now:
https://app.lifeguardtracker.com/SetupWizard

Takes less than 5 minutes. We promise.

— The ${APP_NAME} Team`,
        });

        await base44.asServiceRole.entities.UserActivityMetric.update(metric.id, {
          onboarding_reminder_sent: true,
        });
        results.onboarding++;
      } else {
        results.skipped++;
      }
    }

    console.log("retentionEmailTriggers results:", results);
    return Response.json({ ok: true, ...results });
  } catch (error) {
    console.error("retentionEmailTriggers error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});