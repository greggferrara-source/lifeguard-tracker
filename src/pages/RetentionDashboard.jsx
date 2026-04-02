import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, TrendingUp, AlertTriangle, Zap, Search, RefreshCw,
  CheckCircle2, XCircle, Clock, BarChart2, ArrowUpRight, Mail,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const RISK_COLOR = { low: "bg-green-100 text-green-700 border-green-200", medium: "bg-amber-100 text-amber-700 border-amber-200", high: "bg-red-100 text-red-700 border-red-200" };
const EXPAND_COLOR = { none: "bg-gray-100 text-gray-500", low: "bg-blue-100 text-blue-600", medium: "bg-indigo-100 text-indigo-700", high: "bg-purple-100 text-purple-700" };

function ScoreBar({ value, color = "bg-green-500" }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-7 text-right">{value}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = "text-gray-900", iconColor = "text-gray-500" }) {
  return (
    <Card className="border border-gray-100">
      <CardContent className="py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
          {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function UserRow({ metric }) {
  const daysSince = metric.last_active ? differenceInDays(new Date(), parseISO(metric.last_active)) : null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-[#1a9c5b]/10 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-[#1a9c5b]">
          {(metric.user_name || metric.user_email)?.[0]?.toUpperCase() || "?"}
        </span>
      </div>

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{metric.user_name || "—"}</p>
        <p className="text-xs text-gray-400 truncate">{metric.user_email}</p>
      </div>

      {/* Scores */}
      <div className="hidden md:flex flex-col gap-0.5 w-28">
        <ScoreBar value={metric.activation_score || 0} color="bg-blue-400" />
        <ScoreBar value={metric.engagement_score || 0} color="bg-green-400" />
      </div>

      {/* Last active */}
      <div className="hidden sm:block text-right w-20">
        <p className="text-xs font-medium text-gray-700">
          {daysSince !== null ? (daysSince === 0 ? "Today" : `${daysSince}d ago`) : "—"}
        </p>
        <p className="text-[10px] text-gray-400">{metric.login_count_7d || 0} logins/wk</p>
      </div>

      {/* Badges */}
      <div className="flex gap-1.5 flex-shrink-0">
        <Badge className={`${RISK_COLOR[metric.retention_risk || "medium"]} border text-[10px] px-1.5`}>
          {metric.retention_risk || "—"}
        </Badge>
        {metric.expansion_signal && metric.expansion_signal !== "none" && (
          <Badge className={`${EXPAND_COLOR[metric.expansion_signal]} text-[10px] px-1.5`}>
            ↑ {metric.expansion_signal}
          </Badge>
        )}
      </div>

      {/* Email sent indicators */}
      <div className="flex gap-1 flex-shrink-0">
        {metric.upsell_email_sent && <Mail className="w-3.5 h-3.5 text-purple-400" title="Upsell email sent" />}
        {metric.inactive_email_sent && <Mail className="w-3.5 h-3.5 text-amber-400" title="Inactive email sent" />}
        {metric.onboarding_reminder_sent && <Mail className="w-3.5 h-3.5 text-blue-400" title="Onboarding reminder sent" />}
      </div>
    </div>
  );
}

export default function RetentionDashboard() {
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterExpansion, setFilterExpansion] = useState("all");
  const [running, setRunning] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me().catch(() => null) });
  const { data: metrics = [], isLoading, refetch } = useQuery({
    queryKey: ["retention-metrics"],
    queryFn: () => base44.entities.UserActivityMetric.list("-computed_at", 500),
  });

  const isAdmin = user?.role === "admin" || user?.role === "enterprise_admin" || user?.role === "site_owner" || user?.role === "enterprise_site_owner";

  const filtered = useMemo(() => {
    let list = [...metrics];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m => m.user_email?.toLowerCase().includes(q) || m.user_name?.toLowerCase().includes(q));
    }
    if (filterRisk !== "all") list = list.filter(m => m.retention_risk === filterRisk);
    if (filterExpansion !== "all") list = list.filter(m => m.expansion_signal === filterExpansion);
    return list;
  }, [metrics, search, filterRisk, filterExpansion]);

  // Summary stats
  const stats = useMemo(() => {
    const total = metrics.length;
    const active = metrics.filter(m => {
      const d = m.last_active ? differenceInDays(new Date(), parseISO(m.last_active)) : 999;
      return d <= 7;
    }).length;
    const atRisk = metrics.filter(m => m.retention_risk === "high").length;
    const highValue = metrics.filter(m => m.expansion_signal === "high" || m.expansion_signal === "medium").length;
    const notSetup = metrics.filter(m => !m.has_created_schedule || !m.has_added_staff).length;
    return { total, active, atRisk, highValue, notSetup };
  }, [metrics]);

  // Chart data
  const riskDist = useMemo(() => [
    { name: "Low Risk", value: metrics.filter(m => m.retention_risk === "low").length, color: "#22c55e" },
    { name: "Medium", value: metrics.filter(m => m.retention_risk === "medium").length, color: "#f59e0b" },
    { name: "High Risk", value: metrics.filter(m => m.retention_risk === "high").length, color: "#ef4444" },
  ], [metrics]);

  const engagementBuckets = useMemo(() => [
    { label: "0–20", count: metrics.filter(m => (m.engagement_score || 0) <= 20).length },
    { label: "21–40", count: metrics.filter(m => (m.engagement_score || 0) > 20 && (m.engagement_score || 0) <= 40).length },
    { label: "41–60", count: metrics.filter(m => (m.engagement_score || 0) > 40 && (m.engagement_score || 0) <= 60).length },
    { label: "61–80", count: metrics.filter(m => (m.engagement_score || 0) > 60 && (m.engagement_score || 0) <= 80).length },
    { label: "81–100", count: metrics.filter(m => (m.engagement_score || 0) > 80).length },
  ], [metrics]);

  const runComputeMetrics = async () => {
    setRunning(true);
    try {
      await base44.functions.invoke("computeRetentionMetrics", {});
      await refetch();
    } catch (e) {
      console.error(e);
    }
    setRunning(false);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center text-gray-400">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="font-medium">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Retention Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track user engagement, churn risk, and expansion signals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button
            size="sm"
            className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-1.5"
            onClick={runComputeMetrics}
            disabled={running}
          >
            {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Recompute Scores
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Users Tracked" value={stats.total} iconColor="text-gray-500" />
        <StatCard icon={CheckCircle2} label="Active (Last 7d)" value={stats.active} iconColor="text-green-500" color="text-green-700" />
        <StatCard icon={AlertTriangle} label="At-Risk Users" value={stats.atRisk} iconColor="text-red-500" color="text-red-700" />
        <StatCard icon={TrendingUp} label="Expansion Opportunities" value={stats.highValue} iconColor="text-purple-500" color="text-purple-700" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border border-gray-100">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Retention Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={riskDist} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""} labelLine={false} fontSize={11}>
                  {riskDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Engagement Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={engagementBuckets} barSize={24}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip />
                <Bar dataKey="count" fill="#1a9c5b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Setup completion */}
      <Card className="border border-amber-100 bg-amber-50/40">
        <CardContent className="py-4 flex items-center gap-4">
          <XCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {stats.notSetup} user{stats.notSetup !== 1 ? "s" : ""} haven't completed setup
            </p>
            <p className="text-xs text-amber-600">Missing staff or first schedule — onboarding reminder will fire automatically</p>
          </div>
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">{Math.round((stats.notSetup / Math.max(stats.total, 1)) * 100)}% incomplete</Badge>
        </CardContent>
      </Card>

      {/* User table */}
      <Card className="border border-gray-100">
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-sm font-semibold text-gray-700">
              User Activity <span className="text-gray-400 font-normal">({filtered.length})</span>
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 w-40 text-xs" />
              </div>
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Risk" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterExpansion} onValueChange={setFilterExpansion}>
                <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Expansion" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Signals</SelectItem>
                  <SelectItem value="high">High Expansion</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Legend */}
          <div className="flex gap-3 text-[10px] text-gray-400 mt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-1.5 rounded-sm bg-blue-400 inline-block" /> Activation</span>
            <span className="flex items-center gap-1"><span className="w-2 h-1.5 rounded-sm bg-green-400 inline-block" /> Engagement</span>
            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-amber-400" /> Inactive email</span>
            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-purple-400" /> Upsell email</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="w-5 h-5 animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No users tracked yet</p>
              <p className="text-xs mt-1">Activity data appears automatically as users log in</p>
            </div>
          ) : (
            filtered.map(m => <UserRow key={m.id} metric={m} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}