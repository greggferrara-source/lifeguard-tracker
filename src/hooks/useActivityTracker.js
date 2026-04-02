/**
 * useActivityTracker
 * Invisibly tracks user actions and syncs them to UserActivityMetric.
 * Call trackEvent(eventName) anywhere in the app.
 * Usage: const { trackEvent } = useActivityTracker();
 */
import { useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// Events we recognize
export const TRACK = {
  LOGIN: "login",
  DASHBOARD_VIEW: "dashboard_view",
  SHIFT_CREATED: "shift_created",
  SCHEDULE_GENERATED: "schedule_generated",
  INCIDENT_LOGGED: "incident_logged",
  CERTIFICATION_ADDED: "certification_added",
  ALERT_INTERACTED: "alert_interacted",
  SMART_SCHEDULER_USED: "smart_scheduler_used",
};

// Debounce buffer: collect events and flush every 10s max
const pendingEvents = [];
let flushTimer = null;

async function flushEvents(user) {
  if (!user?.email || pendingEvents.length === 0) return;
  const toFlush = [...pendingEvents];
  pendingEvents.length = 0;

  // Count events
  const counts = {};
  toFlush.forEach(e => { counts[e] = (counts[e] || 0) + 1; });

  // Find or create metric record
  let records = [];
  try {
    records = await base44.entities.UserActivityMetric.filter({ user_email: user.email });
  } catch { return; }

  const existing = records[0];
  const now = new Date().toISOString();

  const updates = {
    last_active: now,
    user_name: user.full_name || existing?.user_name || "",
    user_role: user.role || existing?.user_role || "",
    shifts_created: (existing?.shifts_created || 0) + (counts[TRACK.SHIFT_CREATED] || 0),
    schedules_generated: (existing?.schedules_generated || 0) + (counts[TRACK.SCHEDULE_GENERATED] || 0),
    incidents_logged: (existing?.incidents_logged || 0) + (counts[TRACK.INCIDENT_LOGGED] || 0),
    certifications_added: (existing?.certifications_added || 0) + (counts[TRACK.CERTIFICATION_ADDED] || 0),
    alerts_interacted: (existing?.alerts_interacted || 0) + (counts[TRACK.ALERT_INTERACTED] || 0),
    dashboard_views: (existing?.dashboard_views || 0) + (counts[TRACK.DASHBOARD_VIEW] || 0),
    smart_scheduler_uses: (existing?.smart_scheduler_uses || 0) + (counts[TRACK.SMART_SCHEDULER_USED] || 0),
    computed_at: now,
  };

  if (counts[TRACK.LOGIN]) {
    updates.last_login = now;
    updates.login_count_total = (existing?.login_count_total || 0) + counts[TRACK.LOGIN];
  }

  if (existing) {
    await base44.entities.UserActivityMetric.update(existing.id, updates);
  } else {
    await base44.entities.UserActivityMetric.create({ user_email: user.email, ...updates });
  }
}

export function useActivityTracker() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me().catch(() => null),
  });
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // Track login once per session
  const sessionTracked = useRef(false);
  useEffect(() => {
    if (user && !sessionTracked.current) {
      sessionTracked.current = true;
      pendingEvents.push(TRACK.LOGIN);
      scheduleFlush(userRef);
    }
  }, [user]);

  const trackEvent = useCallback((eventName) => {
    if (!userRef.current) return;
    pendingEvents.push(eventName);
    scheduleFlush(userRef);
  }, []);

  return { trackEvent };
}

function scheduleFlush(userRef) {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushEvents(userRef.current).catch(() => {});
  }, 8000); // flush after 8s idle
}