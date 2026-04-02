import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle, Activity, Siren, Clock, CheckCircle2, Plus,
  TrendingUp, MapPin, ArrowRight, Eye, Search, FileText, Filter
} from "lucide-react";
import {
  format, subDays, parseISO, isAfter,
  startOfMonth, endOfMonth, eachMonthOfInterval, subMonths
} from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import LogIncidentForm from "@/components/incidents/LogIncidentForm";
import IncidentDetailDrawer from "@/components/incidents/IncidentDetailDrawer";
import TooltipHint from "@/components/onboarding/TooltipHint";

const typeStyle = { rescue: "bg-red-100 text-red-700", incident: "bg-orange-100 text-orange-700", near_miss: "bg-yellow-100 text-yellow-700", first_aid: "bg-blue-100 text-blue-700", injury: "bg-purple-100 text-purple-700", other: "bg-gray-100 text-gray-600" };
const severityStyle = { minor: "bg-green-100 text-green-700", moderate: "bg-yellow-100 text-yellow-700", serious: "bg-orange-100 text-orange-700", critical: "bg-red-100 text-red-700" };
const statusStyle = { open: "bg-red-100 text-red-700", reviewed: "bg-yellow-100 text-yellow-700", closed: "bg-green-100 text-green-700" };
const severityRank = { critical: 4, serious: 3, moderate: 2, minor: 1 };

export default function IncidentDashboard() {
  const [logOpen, setLogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [timeRange, setTimeRange] = useState("90");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("dashboard"); // dashboard | all

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["incident-logs"],
    queryFn: () => base44.entities.IncidentLog.list("-created_date", 500),
    refetchInterval: 30000, // real-time: poll every 30s
  });

  const cutoff = subDays(new Date(), Number(timeRange));
  const inRange = useMemo(() => logs.filter(l => {
    try { return parseISO(l.date) >= cutoff; } catch { return false; }
  }), [logs, timeRange]);

  // KPIs
  const openCount = logs.filter(l => l.status === "open").length;
  const followUpCount = logs.filter(l => l.follow_up_required && l.status !== "closed").length;
  const criticalCount = inRange.filter(l => l.severity === "critical" || l.severity === "serious").length;
  const emsCount = inRange.filter(l => l.ems_called).length;

  // Monthly trend
  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({ start: subMonths(new Date(), 5), end: new Date() });
    return months.map(m => ({
      month: format(m, "MMM"),
      count: logs.filter(l => l.date && parseISO(l.date) >= startOfMonth(m) && parseISO(l.date) <= endOfMonth(m)).length
    }));
  }, [logs]);

  // Location hotspots
  const locationData = useMemo(() => {
    const counts = {};
    inRange.forEach(l => { const n = l.location_name || "Unknown"; counts[n] = (counts[n] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [inRange]);

  // Type breakdown
  const typeData = useMemo(() => {
    const counts = {};
    inRange.forEach(l => { counts[l.type] = (counts[l.type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace("_", " "), value }));
  }, [inRange]);

  // Priority open incidents
  const openIncidents = useMemo(() =>
    logs.filter(l => l.status === "open").sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0)),
    [logs]
  );

  // All incidents filtered
  const allFiltered = useMemo(() => {
    return logs.filter(l => {
      if (typeFilter !== "all" && l.type !== typeFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (l.description || "").toLowerCase().includes(q) ||
          (l.location_name || "").toLowerCase().includes(q) ||
          (l.patron_name || "").toLowerCase().includes(q) ||
          (l.reporting_staff_name || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [logs, typeFilter, statusFilter, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Incident Tracking
          </h1>
          <p className="text-gray-500 text-sm mt-1">Real-time incident & injury reporting — any device</p>
        </div>
        <div className="flex gap-2">
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
            <option value="365">Last year</option>
          </select>
          <Button onClick={() => setLogOpen(true)} className="bg-red-600 hover:bg-red-700 gap-2 font-semibold">
            <Plus className="w-4 h-4" /> Log Incident
          </Button>
        </div>
      </div>

      {/* Onboarding hint */}
      <TooltipHint
        id="incident-mobile"
        message="📱 You can log incidents from any mobile device — just open the app and tap 'Log Incident'. Takes under 60 seconds."
      />

      {/* Alert banner if open incidents */}
      {openCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {openCount} open incident{openCount > 1 ? "s" : ""} require{openCount === 1 ? "s" : ""} attention
          </p>
          <Button size="sm" variant="outline" className="ml-auto border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => { setStatusFilter("open"); setTab("all"); }}>
            View Open <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {[{ id: "dashboard", label: "Dashboard" }, { id: "all", label: `All Incidents (${logs.length})` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? "border-[#1a9c5b] text-[#1a9c5b]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Open Incidents", value: openCount, color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle, pulse: openCount > 0 },
              { label: "Follow-Up Needed", value: followUpCount, color: "text-orange-600", bg: "bg-orange-50", icon: Clock, pulse: followUpCount > 0 },
              { label: "Critical / Serious", value: criticalCount, sub: `Last ${timeRange}d`, color: "text-purple-600", bg: "bg-purple-50", icon: Activity },
              { label: "EMS Dispatched", value: emsCount, sub: `Last ${timeRange}d`, color: "text-blue-600", bg: "bg-blue-50", icon: Siren },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className={`rounded-xl p-5 ${s.bg} ${s.pulse ? "ring-2 ring-red-300" : ""}`}>
                  <div className="flex items-start justify-between mb-2">
                    <Icon className={`w-5 h-5 ${s.color}`} />
                    {s.pulse && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  </div>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-600 font-medium mt-1">{s.label}</p>
                  {s.sub && <p className="text-xs text-gray-400">{s.sub}</p>}
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#1a9c5b]" /> Incident Trend — 6 Months
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={monthlyData} barSize={28}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                    <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} name="Incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-900">By Type</CardTitle>
              </CardHeader>
              <CardContent>
                {typeData.length === 0
                  ? <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
                  : <div className="space-y-2.5 mt-1">
                    {typeData.map((d, i) => (
                      <div key={d.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="capitalize font-medium text-gray-700">{d.name}</span>
                          <span className="text-gray-500 font-bold">{d.value}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full">
                          <div className="h-full rounded-full bg-red-400" style={{ width: `${(d.value / Math.max(...typeData.map(x => x.value))) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </CardContent>
            </Card>
          </div>

          {/* Hotspot locations + Open incidents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1a9c5b]" /> Incident Hotspots
                </CardTitle>
              </CardHeader>
              <CardContent>
                {locationData.length === 0
                  ? <p className="text-sm text-gray-400 text-center py-6">No location data</p>
                  : <div className="space-y-3">
                    {locationData.map(([name, count]) => (
                      <div key={name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-800">{name}</span>
                          <span className="text-gray-500">{count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div className="h-full bg-red-400 rounded-full" style={{ width: `${(count / locationData[0][1]) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </CardContent>
            </Card>

            <Card className={openCount > 0 ? "border-red-200" : ""}>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Open Incidents
                </CardTitle>
                {openCount > 0 && (
                  <button onClick={() => { setStatusFilter("open"); setTab("all"); }}
                    className="text-xs text-[#1a9c5b] font-medium hover:underline flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </CardHeader>
              <CardContent>
                {openIncidents.length === 0
                  ? <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
                    <CheckCircle2 className="w-4 h-4" /> All incidents resolved
                  </div>
                  : <div className="space-y-2 max-h-64 overflow-y-auto">
                    {openIncidents.slice(0, 6).map(log => (
                      <div key={log.id}
                        className="flex items-start justify-between gap-2 p-3 bg-red-50 border border-red-100 rounded-lg cursor-pointer hover:border-red-300 transition-colors"
                        onClick={() => setSelected(log)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex gap-1.5 flex-wrap mb-1">
                            <Badge className={`text-[10px] ${typeStyle[log.type]}`}>{log.type?.replace("_", " ")}</Badge>
                            <Badge className={`text-[10px] ${severityStyle[log.severity]}`}>{log.severity}</Badge>
                          </div>
                          <p className="text-xs text-gray-800 line-clamp-1">{log.description}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{log.location_name} · {log.date} {log.time}</p>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                    ))}
                  </div>
                }
              </CardContent>
            </Card>
          </div>

          {/* Recent incidents table */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" /> Recent Incidents
              </CardTitle>
              <button onClick={() => setTab("all")} className="text-xs text-[#1a9c5b] font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Date", "Type", "Severity", "Location", "Reported By", "Status", "EMS", ""].map(h => (
                        <th key={h} className="text-left py-2 pr-3 text-gray-400 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.slice(0, 10).map(log => (
                      <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(log)}>
                        <td className="py-2.5 pr-3 text-gray-600 whitespace-nowrap">{log.date}</td>
                        <td className="py-2.5 pr-3"><Badge className={`text-[10px] ${typeStyle[log.type]}`}>{log.type?.replace("_", " ")}</Badge></td>
                        <td className="py-2.5 pr-3"><Badge className={`text-[10px] ${severityStyle[log.severity]}`}>{log.severity}</Badge></td>
                        <td className="py-2.5 pr-3 text-gray-600 whitespace-nowrap">{log.location_name || "—"}</td>
                        <td className="py-2.5 pr-3 text-gray-500">{log.reporting_staff_name || "—"}</td>
                        <td className="py-2.5 pr-3"><Badge className={`text-[10px] ${statusStyle[log.status]}`}>{log.status}</Badge></td>
                        <td className="py-2.5 pr-3">{log.ems_called ? <span className="text-red-600 font-bold">Yes</span> : <span className="text-gray-300">—</span>}</td>
                        <td className="py-2.5"><Eye className="w-3.5 h-3.5 text-gray-400" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {logs.length === 0 && !isLoading && (
                  <p className="text-center py-10 text-gray-400 text-sm">No incidents logged yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ALL INCIDENTS TAB */}
      {tab === "all" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search incidents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="rescue">Rescue</SelectItem>
                <SelectItem value="injury">Injury</SelectItem>
                <SelectItem value="incident">Incident</SelectItem>
                <SelectItem value="near_miss">Near Miss</SelectItem>
                <SelectItem value="first_aid">First Aid</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            {(typeFilter !== "all" || statusFilter !== "all" || search) && (
              <Button variant="ghost" size="sm" onClick={() => { setTypeFilter("all"); setStatusFilter("all"); setSearch(""); }}>
                Clear filters
              </Button>
            )}
          </div>

          {/* Incident cards */}
          {allFiltered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No incidents found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allFiltered.map(log => (
                <div key={log.id}
                  className="flex items-start justify-between gap-3 p-4 border border-gray-200 rounded-xl hover:shadow-sm cursor-pointer transition-shadow bg-white"
                  onClick={() => setSelected(log)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <Badge className={typeStyle[log.type]}>{log.type?.replace("_", " ")}</Badge>
                      <Badge className={severityStyle[log.severity]}>{log.severity}</Badge>
                      <Badge className={statusStyle[log.status]}>{log.status}</Badge>
                      {log.ems_called && <Badge className="bg-red-100 text-red-700 text-[10px]"><Siren className="w-3 h-3 mr-0.5" />EMS</Badge>}
                      {log.follow_up_required && log.status !== "closed" && <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">Follow-Up</Badge>}
                    </div>
                    <p className="text-sm text-gray-900 font-medium line-clamp-2">{log.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{log.location_name || "—"} · {log.date}{log.time ? ` ${log.time}` : ""} · {log.reporting_staff_name || "Unknown"}</p>
                  </div>
                  <Eye className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <LogIncidentForm open={logOpen} onOpenChange={setLogOpen} />
      <IncidentDetailDrawer incident={selected} onClose={() => setSelected(null)} />
    </div>
  );
}