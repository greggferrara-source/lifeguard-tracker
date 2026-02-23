import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Users, Shield, TrendingUp, Activity, Clock, MapPin } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

const SEVERITY_COLORS = { minor: "#22c55e", moderate: "#f59e0b", serious: "#ef4444", critical: "#7c3aed" };
const TYPE_COLORS = ["#1a9c5b", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function SafetyDashboard() {
  const [range, setRange] = useState("30");

  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents-dash"],
    queryFn: () => base44.entities.IncidentLog.list("-date", 500),
  });

  const { data: patronCounts = [] } = useQuery({
    queryKey: ["patron-dash"],
    queryFn: () => base44.entities.PatronCount.list("-created_date", 200),
  });

  const { data: clockEntries = [] } = useQuery({
    queryKey: ["clock-dash"],
    queryFn: () => base44.entities.ClockEntry.list("-created_date", 200),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts-dash"],
    queryFn: () => base44.entities.Alert.list("-created_date", 100),
  });

  const days = parseInt(range);
  const cutoff = subDays(new Date(), days);
  const recentIncidents = incidents.filter(i => new Date(i.date) >= cutoff);

  // Incidents per day (last 14 days)
  const incidentsByDay = Array.from({ length: Math.min(days, 14) }, (_, i) => {
    const d = subDays(new Date(), Math.min(days, 14) - 1 - i);
    const dayStr = format(d, "yyyy-MM-dd");
    return {
      date: format(d, "MMM d"),
      count: recentIncidents.filter(inc => inc.date === dayStr).length,
    };
  });

  // By type
  const typeMap = {};
  recentIncidents.forEach(i => { typeMap[i.type] = (typeMap[i.type] || 0) + 1; });
  const byType = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  // By severity
  const sevMap = {};
  recentIncidents.forEach(i => { sevMap[i.severity] = (sevMap[i.severity] || 0) + 1; });

  // Patron count trend (last 7 days)
  const patronByDay = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayStr = format(d, "yyyy-MM-dd");
    const counts = patronCounts.filter(p => p.date === dayStr || (p.created_date && p.created_date.startsWith(dayStr)));
    const avg = counts.length > 0 ? Math.round(counts.reduce((s, p) => s + (p.count || 0), 0) / counts.length) : 0;
    return { date: format(d, "MMM d"), patrons: avg };
  });

  // Guard hours
  const totalHours = Math.round(clockEntries.reduce((s, e) => s + (e.total_minutes || 0), 0) / 60);
  const emsCount = recentIncidents.filter(i => i.ems_called).length;
  const openIncidents = incidents.filter(i => i.status === "open").length;
  const rescues = recentIncidents.filter(i => i.type === "rescue").length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#1a9c5b]" /> Safety Metrics Dashboard
          </h1>
          <p className="text-gray-500 text-sm">Incident trends, patron counts, and guard performance</p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Incidents", value: recentIncidents.length, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
          { label: "Rescues", value: rescues, icon: Shield, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Open Cases", value: openIncidents, icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "EMS Called", value: emsCount, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                  <div className="text-xs text-gray-500">{kpi.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incidents Over Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Incidents Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={incidentsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Patron Count Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Patron Count Trend (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={patronByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="patrons" stroke="#1a9c5b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Incidents by Type & Severity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Incidents by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {byType.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No incidents in this period</p> : (
              <div className="space-y-2">
                {byType.sort((a, b) => b.value - a.value).map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                    <span className="text-sm capitalize flex-1">{item.name.replace(/_/g, " ")}</span>
                    <span className="font-semibold text-sm">{item.value}</span>
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length], width: `${(item.value / recentIncidents.length) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Incidents by Severity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(sevMap).map(([sev, count]) => (
              <div key={sev} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: SEVERITY_COLORS[sev] || "#6b7280" }} />
                <span className="text-sm capitalize flex-1">{sev}</span>
                <Badge style={{ background: SEVERITY_COLORS[sev] + "22", color: SEVERITY_COLORS[sev], border: `1px solid ${SEVERITY_COLORS[sev]}44` }}>{count}</Badge>
              </div>
            ))}
            {Object.keys(sevMap).length === 0 && <p className="text-gray-400 text-sm text-center py-6">No data</p>}
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {incidents.slice(0, 8).map(inc => (
              <div key={inc.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0" style={{ background: SEVERITY_COLORS[inc.severity] || "#6b7280" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{inc.description}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <MapPin className="w-3 h-3" />{inc.location_name}
                    <span>{inc.date} {inc.time}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Badge variant="outline" className="text-xs capitalize">{inc.type}</Badge>
                  <Badge variant="outline" className="text-xs capitalize" style={{ color: SEVERITY_COLORS[inc.severity] }}>{inc.severity}</Badge>
                </div>
              </div>
            ))}
            {incidents.length === 0 && <p className="text-gray-400 text-sm text-center py-6">No incidents logged</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}