import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle, Shield, CheckCircle2, Clock, Users, MapPin,
  TrendingUp, TrendingDown, ArrowRight, Plus, Filter, Calendar,
  FileText, Siren, Activity, Eye
} from "lucide-react";
import { format, subDays, parseISO, isAfter, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const typeStyle = {
  rescue: "bg-red-100 text-red-700",
  incident: "bg-orange-100 text-orange-700",
  near_miss: "bg-yellow-100 text-yellow-700",
  first_aid: "bg-blue-100 text-blue-700",
  injury: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-600",
};
const severityStyle = {
  minor: "bg-green-100 text-green-700",
  moderate: "bg-yellow-100 text-yellow-700",
  serious: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};
const statusStyle = {
  open: "bg-red-100 text-red-700",
  reviewed: "bg-yellow-100 text-yellow-700",
  closed: "bg-green-100 text-green-700",
};

const PIE_COLORS = ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#a855f7", "#6b7280"];

export default function IncidentDashboard() {
  const queryClient = useQueryClient();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [timeRange, setTimeRange] = useState("90"); // days

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["incident-logs"],
    queryFn: () => base44.entities.IncidentLog.list("-date", 500),
  });
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list(),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.IncidentLog.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident-logs"] });
      setSelectedIncident(s => s ? { ...s, status: updateStatus.variables?.status } : s);
    },
  });

  const cutoff = subDays(new Date(), Number(timeRange));
  const filtered = useMemo(() => logs.filter(l => l.date && isAfter(parseISO(l.date), cutoff)), [logs, timeRange]);

  // Stats
  const openCount = logs.filter(l => l.status === "open").length;
  const followUpCount = logs.filter(l => l.follow_up_required && l.status !== "closed").length;
  const criticalCount = filtered.filter(l => l.severity === "critical" || l.severity === "serious").length;
  const emsCount = filtered.filter(l => l.ems_called).length;

  // Monthly trend (last 6 months)
  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({ start: subMonths(new Date(), 5), end: new Date() });
    return months.map(m => {
      const start = startOfMonth(m);
      const end = endOfMonth(m);
      const count = logs.filter(l => l.date && isAfter(parseISO(l.date), start) && !isAfter(parseISO(l.date), end)).length;
      return { month: format(m, "MMM"), count };
    });
  }, [logs]);

  // Type breakdown
  const typeData = useMemo(() => {
    const counts = {};
    filtered.forEach(l => { counts[l.type] = (counts[l.type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace("_", " "), value }));
  }, [filtered]);

  // By location
  const locationData = useMemo(() => {
    const counts = {};
    filtered.forEach(l => {
      const name = l.location_name || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filtered]);

  // Open / follow-up incidents
  const openIncidents = logs.filter(l => l.status === "open").sort((a, b) => {
    const sev = { critical: 4, serious: 3, moderate: 2, minor: 1 };
    return (sev[b.severity] || 0) - (sev[a.severity] || 0);
  });
  const followUpIncidents = logs.filter(l => l.follow_up_required && l.status !== "closed");

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incident Management</h1>
          <p className="text-gray-500 mt-1">Monitor, track, and resolve all facility incidents</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
            <option value="365">Last year</option>
          </select>
          <Link to={createPageUrl("IncidentLogs")}>
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2">
              <Plus className="w-4 h-4" /> Log Incident
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Open Incidents", value: openCount, color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle, urgent: openCount > 0 },
          { label: "Require Follow-Up", value: followUpCount, color: "text-orange-600", bg: "bg-orange-50", icon: Clock, urgent: followUpCount > 0 },
          { label: "Critical / Serious", value: criticalCount, sub: `in last ${timeRange}d`, color: "text-purple-600", bg: "bg-purple-50", icon: Activity },
          { label: "EMS Dispatched", value: emsCount, sub: `in last ${timeRange}d`, color: "text-blue-600", bg: "bg-blue-50", icon: Siren },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`rounded-xl p-5 ${s.bg} ${s.urgent ? "ring-2 ring-red-300" : ""}`}>
              <div className="flex items-start justify-between mb-2">
                <Icon className={`w-5 h-5 ${s.color}`} />
                {s.urgent && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              </div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-600 mt-1 font-medium">{s.label}</p>
              {s.sub && <p className="text-xs text-gray-400">{s.sub}</p>}
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1a9c5b]" /> Incident Trend (6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} barSize={28}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="count" fill="#1a9c5b" radius={[4, 4, 0, 0]} name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Type breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">By Type</CardTitle>
          </CardHeader>
          <CardContent>
            {typeData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data</div>
            ) : (
              <div className="flex flex-col gap-2 mt-1">
                {typeData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-gray-600 flex-1 capitalize">{d.name}</span>
                    <span className="text-xs font-bold text-gray-900">{d.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hot Locations + Open Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotspot locations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1a9c5b]" /> Top Incident Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {locationData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No location data</p>
            ) : (
              <div className="space-y-3">
                {locationData.map(([name, count], i) => {
                  const max = locationData[0][1];
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-800">{name}</span>
                        <span className="text-gray-500">{count} incident{count > 1 ? "s" : ""}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1a9c5b] rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open incidents */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Open Incidents
            </CardTitle>
            <Link to={createPageUrl("IncidentLogs")} className="text-xs text-[#1a9c5b] font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {openIncidents.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
                <CheckCircle2 className="w-4 h-4" /> All incidents resolved
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {openIncidents.map(log => (
                  <div key={log.id}
                    className="flex items-start justify-between gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setSelectedIncident(log)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-1.5 flex-wrap mb-1">
                        <Badge className={`text-[10px] ${typeStyle[log.type]}`}>{log.type?.replace("_", " ")}</Badge>
                        <Badge className={`text-[10px] ${severityStyle[log.severity]}`}>{log.severity}</Badge>
                      </div>
                      <p className="text-xs text-gray-700 truncate">{log.description}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{log.location_name} · {log.date}</p>
                    </div>
                    <Eye className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Follow-Up Required */}
      {followUpIncidents.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-orange-700 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Follow-Up Required ({followUpIncidents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {followUpIncidents.map(log => (
                <div key={log.id}
                  className="p-3 bg-orange-50 rounded-xl border border-orange-100 cursor-pointer hover:border-orange-300 transition-colors"
                  onClick={() => setSelectedIncident(log)}
                >
                  <div className="flex gap-1.5 mb-1.5 flex-wrap">
                    <Badge className={`text-[10px] ${typeStyle[log.type]}`}>{log.type?.replace("_", " ")}</Badge>
                    <Badge className={`text-[10px] ${statusStyle[log.status]}`}>{log.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-800 font-medium line-clamp-2">{log.description}</p>
                  {log.follow_up_notes && <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">Note: {log.follow_up_notes}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{log.location_name} · {log.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Incidents Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" /> Recent Incidents
          </CardTitle>
          <Link to={createPageUrl("IncidentLogs")} className="text-xs text-[#1a9c5b] font-medium hover:underline flex items-center gap-1">
            Manage all <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Date", "Type", "Severity", "Location", "Status", "EMS", "Action"].map(h => (
                    <th key={h} className="text-left py-2 pr-4 text-gray-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 10).map(log => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedIncident(log)}>
                    <td className="py-2.5 pr-4 text-gray-600">{log.date}</td>
                    <td className="py-2.5 pr-4"><Badge className={`text-[10px] ${typeStyle[log.type]}`}>{log.type?.replace("_", " ")}</Badge></td>
                    <td className="py-2.5 pr-4"><Badge className={`text-[10px] ${severityStyle[log.severity]}`}>{log.severity}</Badge></td>
                    <td className="py-2.5 pr-4 text-gray-600">{log.location_name || "—"}</td>
                    <td className="py-2.5 pr-4"><Badge className={`text-[10px] ${statusStyle[log.status]}`}>{log.status}</Badge></td>
                    <td className="py-2.5 pr-4">{log.ems_called ? <span className="text-red-600 font-semibold">Yes</span> : <span className="text-gray-300">—</span>}</td>
                    <td className="py-2.5"><Eye className="w-3.5 h-3.5 text-gray-400" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No incidents logged yet.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Incident Report</DialogTitle></DialogHeader>
          {selectedIncident && (
            <div className="space-y-4 text-sm">
              <div className="flex gap-2 flex-wrap">
                <Badge className={typeStyle[selectedIncident.type]}>{selectedIncident.type?.replace("_", " ")}</Badge>
                <Badge className={severityStyle[selectedIncident.severity]}>{selectedIncident.severity}</Badge>
                <Badge className={statusStyle[selectedIncident.status]}>{selectedIncident.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-xl p-4 text-xs">
                {[
                  ["Location", selectedIncident.location_name],
                  ["Date / Time", `${selectedIncident.date}${selectedIncident.time ? " · " + selectedIncident.time : ""}`],
                  ["Reported By", selectedIncident.reporting_staff_name],
                  ["Patron", selectedIncident.patron_name ? `${selectedIncident.patron_name}${selectedIncident.patron_age ? `, age ${selectedIncident.patron_age}` : ""}` : null],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}><p className="text-gray-400">{k}</p><p className="font-medium text-gray-900">{v}</p></div>
                ))}
              </div>
              <div><p className="text-xs text-gray-400 mb-1">Description</p><p className="text-gray-800 leading-relaxed">{selectedIncident.description}</p></div>
              {selectedIncident.action_taken && <div><p className="text-xs text-gray-400 mb-1">Action Taken</p><p className="text-gray-800">{selectedIncident.action_taken}</p></div>}
              {selectedIncident.witnesses && <div><p className="text-xs text-gray-400 mb-1">Witnesses</p><p className="text-gray-800">{selectedIncident.witnesses}</p></div>}
              {selectedIncident.follow_up_notes && <div><p className="text-xs text-gray-400 mb-1">Follow-Up Notes</p><p className="text-gray-800">{selectedIncident.follow_up_notes}</p></div>}
              <div className="flex gap-2 flex-wrap border-t pt-3">
                {selectedIncident.ems_called && <Badge className="bg-red-100 text-red-700">EMS Called</Badge>}
                {selectedIncident.patron_transported && <Badge className="bg-purple-100 text-purple-700">Patron Transported</Badge>}
                {selectedIncident.follow_up_required && <Badge className="bg-yellow-100 text-yellow-700">Follow-Up Required</Badge>}
              </div>
              {selectedIncident.status !== "closed" && (
                <div className="flex gap-2 pt-2 border-t">
                  {selectedIncident.status === "open" && (
                    <Button variant="outline" size="sm" className="flex-1"
                      onClick={() => updateStatus.mutate({ id: selectedIncident.id, status: "reviewed" })}>
                      Mark Reviewed
                    </Button>
                  )}
                  <Button size="sm" className="flex-1 bg-[#1a9c5b] hover:bg-[#158a4e]"
                    onClick={() => updateStatus.mutate({ id: selectedIncident.id, status: "closed" })}>
                    Close Incident
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}