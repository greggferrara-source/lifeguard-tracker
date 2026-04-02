import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, isToday, parseISO, differenceInDays, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from "date-fns";
import { useSubscription } from "@/hooks/useSubscription";
import EnterpriseUpsellBanner from "@/components/enterprise/EnterpriseUpsellBanner";
import {
  CalendarDays, Users, Shield, AlertTriangle, BarChart2,
  TrendingUp, TrendingDown, Zap, Plus, FileText, UserPlus,
  ArrowRight, CheckCircle2, Clock, ChevronRight, Activity,
  Lightbulb, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return differenceInDays(parseISO(dateStr), new Date());
}

function getShiftHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ title, value, sub, color, icon: Icon, to, trend }) {
  const colors = {
    green: "border-l-4 border-l-emerald-500 bg-white",
    yellow: "border-l-4 border-l-amber-400 bg-white",
    red: "border-l-4 border-l-red-500 bg-white",
    blue: "border-l-4 border-l-blue-500 bg-white",
    gray: "border-l-4 border-l-gray-300 bg-white",
  };
  const iconColors = {
    green: "bg-emerald-50 text-emerald-600",
    yellow: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    gray: "bg-gray-50 text-gray-500",
  };

  const card = (
    <div className={`${colors[color] || colors.gray} rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 leading-none">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1.5 leading-snug">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3 ${iconColors[color] || iconColors.gray}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50">
          {trend >= 0
            ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
          <span className={`text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {Math.abs(trend)}% vs last week
          </span>
        </div>
      )}
      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 group-hover:text-[#1a9c5b] transition-colors">
        View details <ChevronRight className="w-3 h-3" />
      </div>
    </div>
  );

  return to ? <Link to={to}>{card}</Link> : card;
}

function AlertItem({ severity, message, to }) {
  const cfg = {
    critical: { bg: "bg-red-50 border-red-200", dot: "bg-red-500", text: "text-red-800", badge: "bg-red-100 text-red-700" },
    warning: { bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500", text: "text-amber-800", badge: "bg-amber-100 text-amber-700" },
    info: { bg: "bg-blue-50 border-blue-200", dot: "bg-blue-400", text: "text-blue-800", badge: "bg-blue-100 text-blue-700" },
  }[severity] || { bg: "bg-gray-50 border-gray-200", dot: "bg-gray-400", text: "text-gray-700", badge: "bg-gray-100 text-gray-600" };

  return (
    <Link to={to} className={`flex items-center gap-3 p-3 rounded-lg border ${cfg.bg} hover:opacity-90 transition-opacity group`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <span className={`flex-1 text-sm font-medium ${cfg.text}`}>{message}</span>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
    </Link>
  );
}

function WeeklyCoverageChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barCategoryGap="30%">
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.03)" }}
          contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          formatter={(v, name) => [v, name.charAt(0).toUpperCase() + name.slice(1)]}
        />
        <Bar dataKey="staffed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="staffed" />
        <Bar dataKey="understaffed" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} name="understaffed" />
        <Bar dataKey="open" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="open" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function InsightItem({ text, type }) {
  const icons = { warning: "⚠️", info: "ℹ️", tip: "💡", good: "✅" };
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-base flex-shrink-0 mt-0.5">{icons[type] || "💡"}</span>
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function OperationsCommandDashboard() {
  const { isEnterprise } = useSubscription();
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: shifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ["cmd-shifts"], queryFn: () => base44.entities.Shift.list("-date", 500), refetchInterval: 60000,
  });
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"], queryFn: () => base44.entities.Employee.list(), refetchInterval: 120000,
  });
  const { data: certifications = [] } = useQuery({
    queryKey: ["certifications"], queryFn: () => base44.entities.Certification.list(), refetchInterval: 120000,
  });
  const { data: clockEntries = [] } = useQuery({
    queryKey: ["clock-entries"], queryFn: () => base44.entities.ClockEntry.list("-created_date", 200), refetchInterval: 60000,
  });
  const { data: incidentReports = [] } = useQuery({
    queryKey: ["incident-reports"], queryFn: () => base44.entities.IncidentReport.list("-created_date", 100), refetchInterval: 120000,
  });
  const { data: incidentLogs = [] } = useQuery({
    queryKey: ["incident-logs"], queryFn: () => base44.entities.IncidentLog.list("-created_date", 100), refetchInterval: 120000,
  });
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"], queryFn: () => base44.entities.Location.list(),
  });

  // ── Derived metrics ────────────────────────────────────────────────────────

  const todayShifts = useMemo(() => shifts.filter(s => s.date === todayStr), [shifts, todayStr]);
  const scheduledToday = todayShifts.filter(s => s.status === "scheduled" || s.status === "completed");
  const understaffedToday = todayShifts.filter(s => s.status === "open");

  const activeEmployees = employees.filter(e => e.status === "active").length;

  // Clocked in now: clocked_in without clocked_out for today
  const clockedInNow = clockEntries.filter(ce => {
    if (!ce.clock_in) return false;
    const d = ce.clock_in.split("T")[0];
    return d === todayStr && !ce.clock_out;
  }).length;

  // Cert risks: expiring in 7 days
  const certRisks = certifications.filter(c => {
    const d = daysUntil(c.expiry_date);
    return d !== null && d >= 0 && d <= 7 && c.status === "approved";
  });
  const certExpiring30 = certifications.filter(c => {
    const d = daysUntil(c.expiry_date);
    return d !== null && d >= 0 && d <= 30 && c.status === "approved";
  });

  // Open incidents
  const allIncidents = useMemo(() => {
    const fromReports = incidentReports.map(i => ({ ...i, _source: "report" }));
    const fromLogs = incidentLogs.map(i => ({ ...i, _source: "log" }));
    return [...fromReports, ...fromLogs];
  }, [incidentReports, incidentLogs]);
  const openIncidents = allIncidents.filter(i => i.status && i.status !== "closed" && i.status !== "resolved");

  // This week's incidents
  const thisWeekIncidents = allIncidents.filter(i => {
    const dt = i.date_time || i.created_date;
    if (!dt) return false;
    const d = parseISO(dt);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });
  const lastWeekIncidents = allIncidents.filter(i => {
    const dt = i.date_time || i.created_date;
    if (!dt) return false;
    const d = parseISO(dt);
    return isWithinInterval(d, { start: lastWeekStart, end: lastWeekEnd });
  });
  const incidentTrend = lastWeekIncidents.length > 0
    ? Math.round(((thisWeekIncidents.length - lastWeekIncidents.length) / lastWeekIncidents.length) * 100)
    : 0;

  const incidentsByType = useMemo(() => {
    const counts = {};
    thisWeekIncidents.forEach(i => {
      const type = i.incident_type || i.type || "other";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [thisWeekIncidents]);

  // Weekly coverage
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekShifts = shifts.filter(s => {
    if (!s.date) return false;
    const d = parseISO(s.date);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });
  const weekCoverageData = weekDays.map((day, idx) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + idx);
    const dayStr = format(dayDate, "yyyy-MM-dd");
    const dayShifts = weekShifts.filter(s => s.date === dayStr);
    return {
      day,
      staffed: dayShifts.filter(s => s.status === "scheduled" || s.status === "completed").length,
      understaffed: dayShifts.filter(s => s.status === "no_show").length,
      open: dayShifts.filter(s => s.status === "open").length,
    };
  });

  // Coverage % this week
  const totalWeekShifts = weekShifts.length;
  const staffedWeekShifts = weekShifts.filter(s => s.status === "scheduled" || s.status === "completed").length;
  const coveragePct = totalWeekShifts > 0 ? Math.round((staffedWeekShifts / totalWeekShifts) * 100) : 100;
  const coverageColor = coveragePct >= 90 ? "green" : coveragePct >= 70 ? "yellow" : "red";

  // Cert compliance %
  const approvedCerts = certifications.filter(c => c.status === "approved" && daysUntil(c.expiry_date) >= 0);
  const certCompliance = activeEmployees > 0
    ? Math.round((new Set(approvedCerts.map(c => c.employee_id)).size / activeEmployees) * 100)
    : 100;

  // ── Urgent alerts ──────────────────────────────────────────────────────────

  const urgentAlerts = useMemo(() => {
    const list = [];
    if (understaffedToday.length > 0) list.push({ severity: "critical", message: `${understaffedToday.length} open shift${understaffedToday.length > 1 ? "s" : ""} not covered today`, to: createPageUrl("Schedule") });
    if (certRisks.length > 0) list.push({ severity: "critical", message: `${certRisks.length} certification${certRisks.length > 1 ? "s" : ""} expire within 7 days`, to: createPageUrl("Certifications") });
    if (openIncidents.length > 0) list.push({ severity: "warning", message: `${openIncidents.length} open incident${openIncidents.length > 1 ? "s" : ""} require${openIncidents.length === 1 ? "s" : ""} review`, to: createPageUrl("IncidentDashboard") });
    if (certExpiring30.length > certRisks.length) list.push({ severity: "warning", message: `${certExpiring30.length - certRisks.length} more certification${certExpiring30.length - certRisks.length > 1 ? "s" : ""} expire within 30 days`, to: createPageUrl("Certifications") });
    const pendingCerts = certifications.filter(c => c.status === "pending_review");
    if (pendingCerts.length > 0) list.push({ severity: "info", message: `${pendingCerts.length} certification${pendingCerts.length > 1 ? "s" : ""} pending your review`, to: createPageUrl("Certifications") });
    if (coveragePct < 80) list.push({ severity: "warning", message: `Weekly coverage is at ${coveragePct}% — below target`, to: createPageUrl("Schedule") });
    return list.slice(0, 6);
  }, [understaffedToday, certRisks, openIncidents, certExpiring30, certifications, coveragePct]);

  // ── AI insights ────────────────────────────────────────────────────────────

  const insights = useMemo(() => {
    const list = [];

    // Understaffing
    const openToday = understaffedToday.length;
    if (openToday > 0) list.push({ text: `${openToday} open shift${openToday > 1 ? "s" : ""} today — consider reassigning or calling in staff`, type: "warning" });

    // Coverage trend
    if (coveragePct >= 95) list.push({ text: `Great job — weekly coverage is at ${coveragePct}%. Your team is well-staffed this week.`, type: "good" });
    else if (coveragePct < 70) list.push({ text: `Coverage is critically low at ${coveragePct}%. Use Auto Build to fill gaps quickly.`, type: "warning" });

    // Cert risks
    if (certRisks.length > 0) {
      const names = certRisks.slice(0, 2).map(c => c.employee_name).filter(Boolean).join(", ");
      list.push({ text: `${names ? names + " — cert" : "Certifications"} expire this week. Remind staff to renew immediately.`, type: "warning" });
    }

    // Incident trend
    if (incidentTrend > 20) list.push({ text: `Incidents are up ${incidentTrend}% compared to last week. Review recent logs for patterns.`, type: "warning" });
    else if (incidentTrend < -10) list.push({ text: `Incidents down ${Math.abs(incidentTrend)}% vs last week. Safety protocols are working.`, type: "good" });

    // Cert compliance
    if (certCompliance < 80) list.push({ text: `Only ${certCompliance}% of active staff have valid certifications. Address compliance gaps now.`, type: "warning" });
    else if (certCompliance === 100) list.push({ text: `100% of staff are fully certified — your facility is compliance-ready for inspections.`, type: "good" });

    // Staff vs shifts
    if (activeEmployees > 0 && scheduledToday.length === 0) list.push({ text: "No shifts scheduled for today. Add shifts or run Auto Build to generate today's schedule.", type: "tip" });

    if (list.length === 0) list.push({ text: "All operational metrics look healthy. Keep monitoring for any changes.", type: "good" });

    return list.slice(0, 5);
  }, [understaffedToday, coveragePct, certRisks, incidentTrend, certCompliance, activeEmployees, scheduledToday]);

  // ── Quick actions ──────────────────────────────────────────────────────────

  const quickActions = [
    { label: "Auto Build Schedule", icon: Zap, to: createPageUrl("Schedule"), highlight: true },
    { label: "Add Shift", icon: Plus, to: createPageUrl("Schedule") },
    { label: "Log Incident", icon: FileText, to: createPageUrl("CreateIncidentReport") },
    { label: "Add Staff", icon: UserPlus, to: createPageUrl("Employees") },
  ];

  const firstName = user?.full_name?.split(" ")[0] || "there";
  const hourNow = today.getHours();
  const greeting = hourNow < 12 ? "Good morning" : hourNow < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Operations Command · {format(today, "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700">
              <Activity className="w-3.5 h-3.5" />
              Live
            </div>
            <Link to={createPageUrl("Schedule")}>
              <Button size="sm" className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-1.5 text-xs h-8">
                <Zap className="w-3.5 h-3.5" /> Auto Build Schedule
              </Button>
            </Link>
          </div>
        </div>

        {/* Enterprise upsell — triggers for large operations or multi-location */}
        {!isEnterprise && (locations.length >= 2 || activeEmployees >= 15) && (
          <EnterpriseUpsellBanner variant="large-operation" />
        )}

        {/* ── Section 1: Key Metrics ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            title="Shifts Today"
            value={scheduledToday.length}
            sub={understaffedToday.length > 0 ? `${understaffedToday.length} open / unfilled` : "All shifts covered"}
            color={understaffedToday.length > 0 ? "red" : "green"}
            icon={CalendarDays}
            to={createPageUrl("Schedule")}
          />
          <StatCard
            title="On Duty Now"
            value={clockedInNow}
            sub={`of ${activeEmployees} active staff`}
            color={clockedInNow === 0 ? "gray" : "blue"}
            icon={Users}
            to={createPageUrl("Employees")}
          />
          <StatCard
            title="Cert Risks"
            value={certRisks.length}
            sub={certRisks.length > 0 ? "expire in 7 days" : "No urgent expirations"}
            color={certRisks.length > 0 ? "red" : "green"}
            icon={Shield}
            to={createPageUrl("Certifications")}
          />
          <StatCard
            title="Open Incidents"
            value={openIncidents.length}
            sub={openIncidents.length > 0 ? "require review" : "All incidents resolved"}
            color={openIncidents.length > 0 ? "yellow" : "green"}
            icon={AlertTriangle}
            to={createPageUrl("IncidentDashboard")}
          />
          <StatCard
            title="Coverage"
            value={`${coveragePct}%`}
            sub="of shifts staffed this week"
            color={coverageColor}
            icon={BarChart2}
            to={createPageUrl("Schedule")}
          />
        </div>

        {/* ── Main content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT COLUMN — 2/3 */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── Section 2: Urgent Alerts ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h2 className="text-sm font-bold text-gray-900">Urgent Alerts</h2>
                  {urgentAlerts.length > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{urgentAlerts.length}</span>
                  )}
                </div>
                <Link to={createPageUrl("Alerts")} className="text-xs text-[#1a9c5b] hover:underline font-medium">View all →</Link>
              </div>
              {urgentAlerts.length === 0 ? (
                <div className="flex items-center gap-3 py-4 px-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-sm font-medium text-emerald-700">No urgent alerts — operations look healthy!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {urgentAlerts.map((a, i) => (
                    <AlertItem key={i} severity={a.severity} message={a.message} to={a.to} />
                  ))}
                </div>
              )}
            </div>

            {/* ── Section 3: Weekly Coverage ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900">Weekly Coverage Overview</h2>
                </div>
                <Link to={createPageUrl("Schedule")} className="text-xs text-[#1a9c5b] hover:underline font-medium">Open Schedule →</Link>
              </div>
              <p className="text-xs text-gray-400 mb-4">Shift staffing status for {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")}</p>
              <WeeklyCoverageChart data={weekCoverageData} />
              <div className="flex items-center gap-5 mt-3 pt-3 border-t border-gray-50">
                {[
                  { color: "bg-emerald-500", label: "Staffed" },
                  { color: "bg-amber-400", label: "No Show" },
                  { color: "bg-red-500", label: "Open" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                    <span className="text-xs text-gray-500">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Section 5: Incident Insights ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900">Incident Insights</h2>
                </div>
                <Link to={createPageUrl("IncidentDashboard")} className="text-xs text-[#1a9c5b] hover:underline font-medium">View all →</Link>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-extrabold text-gray-900">{thisWeekIncidents.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">This week</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-extrabold text-gray-900">{openIncidents.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Open</p>
                </div>
                <div className={`rounded-lg p-3 text-center ${incidentTrend > 0 ? "bg-red-50" : incidentTrend < 0 ? "bg-emerald-50" : "bg-gray-50"}`}>
                  <div className="flex items-center justify-center gap-1">
                    {incidentTrend > 0
                      ? <TrendingUp className="w-4 h-4 text-red-500" />
                      : incidentTrend < 0
                      ? <TrendingDown className="w-4 h-4 text-emerald-500" />
                      : <Activity className="w-4 h-4 text-gray-400" />}
                    <p className={`text-2xl font-extrabold ${incidentTrend > 0 ? "text-red-600" : incidentTrend < 0 ? "text-emerald-600" : "text-gray-900"}`}>
                      {incidentTrend > 0 ? "+" : ""}{incidentTrend}%
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">vs last week</p>
                </div>
              </div>

              {incidentsByType.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">By Type This Week</p>
                  {incidentsByType.map(({ type, count }) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className="w-28 text-xs text-gray-600 capitalize font-medium truncate">{type.replace("_", " ")}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-[#1a9c5b] h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (count / Math.max(thisWeekIncidents.length, 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-4">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">No incidents logged this week</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — 1/3 */}
          <div className="space-y-5">

            {/* ── Section 6: Quick Actions ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-[#1a9c5b]" />
                <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map(({ label, icon: Icon, to, highlight }) => (
                  <Link key={label} to={to}>
                    <button className={`w-full flex flex-col items-center gap-2 p-3 rounded-lg border text-xs font-semibold transition-all hover:shadow-sm ${
                      highlight
                        ? "bg-[#1a9c5b] border-[#1a9c5b] text-white hover:bg-[#158a4e]"
                        : "bg-white border-gray-200 text-gray-700 hover:border-[#1a9c5b] hover:text-[#1a9c5b]"
                    }`}>
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Section 4: Cert Compliance ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900">Cert Compliance</h2>
                </div>
                <Link to={createPageUrl("Certifications")} className="text-xs text-[#1a9c5b] hover:underline font-medium">Manage →</Link>
              </div>

              {/* Compliance ring */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <circle
                      cx="32" cy="32" r="26" fill="none"
                      stroke={certCompliance >= 90 ? "#10b981" : certCompliance >= 70 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8"
                      strokeDasharray={`${(certCompliance / 100) * 163.4} 163.4`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-extrabold text-gray-900">{certCompliance}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {certCompliance >= 90 ? "Compliant" : certCompliance >= 70 ? "Needs Attention" : "At Risk"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Set(approvedCerts.map(c => c.employee_id)).size} of {activeEmployees} staff certified
                  </p>
                </div>
              </div>

              {certExpiring30.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Expiring Soon</p>
                  {certExpiring30.slice(0, 4).map(cert => {
                    const d = daysUntil(cert.expiry_date);
                    return (
                      <div key={cert.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-800 truncate">{cert.employee_name}</p>
                          <p className="text-xs text-gray-400 truncate">{cert.name}</p>
                        </div>
                        <Badge className={`ml-2 text-[10px] flex-shrink-0 ${d <= 7 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                          {d}d
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
              {certExpiring30.length === 0 && (
                <div className="flex items-center gap-2 py-2 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> No expirations in next 30 days
                </div>
              )}
            </div>

            {/* ── Section 7: AI Insights ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-gray-900">Operational Insights</h2>
              </div>
              <div className="space-y-0">
                {insights.map((insight, i) => (
                  <InsightItem key={i} text={insight.text} type={insight.type} />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Footer nav ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { label: "Full Schedule", icon: CalendarDays, to: createPageUrl("Schedule") },
            { label: "Team Management", icon: Users, to: createPageUrl("Employees") },
            { label: "Compliance", icon: Shield, to: createPageUrl("ComplianceDashboard") },
            { label: "Analytics", icon: BarChart2, to: createPageUrl("Reports") },
          { label: "Enterprise", icon: TrendingUp, to: createPageUrl("EnterprisePreview") },
          ].map(({ label, icon: Icon, to }) => (
            <Link key={label} to={to}>
              <div className="flex items-center gap-2.5 p-3.5 bg-white rounded-xl border border-gray-100 hover:border-[#1a9c5b] hover:shadow-sm transition-all group">
                <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#1a9c5b] transition-colors" />
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900">{label}</span>
                <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#1a9c5b] ml-auto transition-colors" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}