import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  MapPin, Users, AlertTriangle, Shield, CheckCircle2, Clock,
  TrendingUp, Activity, Search, ChevronRight, BarChart2, Eye
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const STATUS_COLORS = {
  safe: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

export default function MultiLocationDashboard() {
  const [search, setSearch] = useState("");

  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });
  const { data: shifts = [] } = useQuery({ queryKey: ["shifts"], queryFn: () => base44.entities.Shift.list("-date", 500) });
  const { data: incidents = [] } = useQuery({ queryKey: ["incident-logs"], queryFn: () => base44.entities.IncidentLog.list("-created_date", 200) });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.list() });
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: () => base44.entities.Alert.list("-created_date", 100) });
  const { data: chemLogs = [] } = useQuery({ queryKey: ["chemical-logs"], queryFn: () => base44.entities.ChemicalLog.list("-date", 100) });
  const { data: patronCounts = [] } = useQuery({ queryKey: ["patron-counts"], queryFn: () => base44.entities.PatronCount.list("-created_date", 200) });

  const today = format(new Date(), "yyyy-MM-dd");

  const locationStats = useMemo(() => {
    return locations.map(loc => {
      const todayShifts = shifts.filter(s => s.location_id === loc.id && s.date === today);
      const staffed = todayShifts.filter(s => s.employee_id && s.status !== "cancelled").length;
      const open = todayShifts.filter(s => s.status === "open").length;
      const locIncidents = incidents.filter(i => i.location_id === loc.id);
      const openIncidents = locIncidents.filter(i => i.status === "open").length;
      const locAlerts = alerts.filter(a => a.location_id === loc.id && !a.resolved).length;
      const locEmployees = employees.filter(e => e.status === "active");
      const lastChemLog = chemLogs.filter(c => c.location_id === loc.id).sort((a, b) => b.date?.localeCompare(a.date))[0];
      const currentCount = patronCounts.filter(p => p.location_id === loc.id).sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

      // Determine status
      let status = "safe";
      if (openIncidents > 0 || locAlerts > 0) status = "warning";
      if (locIncidents.filter(i => i.status === "open" && i.severity === "critical").length > 0) status = "critical";

      return { ...loc, staffed, open, openIncidents, locAlerts, locEmployees: locEmployees.length, lastChemLog, currentCount, totalIncidents: locIncidents.length, status };
    });
  }, [locations, shifts, incidents, employees, alerts, chemLogs, patronCounts, today]);

  const filtered = locationStats.filter(l => l.name?.toLowerCase().includes(search.toLowerCase()));

  // Rollup stats
  const totalStaff = locationStats.reduce((sum, l) => sum + l.staffed, 0);
  const totalOpenIncidents = locationStats.reduce((sum, l) => sum + l.openIncidents, 0);
  const totalAlerts = locationStats.reduce((sum, l) => sum + l.locAlerts, 0);
  const criticalLocations = locationStats.filter(l => l.status === "critical").length;

  const incidentsByLocation = locationStats.map(l => ({ name: l.name?.length > 12 ? l.name.substring(0, 12) + "…" : l.name, incidents: l.totalIncidents })).sort((a, b) => b.incidents - a.incidents).slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Multi-Location Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time overview across all {locations.length} locations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search locations..." className="pl-9 w-56" />
          </div>
        </div>
      </div>

      {/* Rollup KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Locations", value: locations.length, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Staff On Today", value: totalStaff, icon: Users, color: "text-green-600", bg: "bg-green-50" },
          { label: "Open Incidents", value: totalOpenIncidents, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Unresolved Alerts", value: totalAlerts, icon: Activity, color: totalAlerts > 0 ? "text-red-600" : "text-gray-500", bg: totalAlerts > 0 ? "bg-red-50" : "bg-gray-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-5`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Location Cards */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Locations Status</h2>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No locations found</p>
            </div>
          )}
          {filtered.map(loc => (
            <Card key={loc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{loc.name}</h3>
                      <Badge className={`text-xs border ${STATUS_COLORS[loc.status]}`}>
                        {loc.status.charAt(0).toUpperCase() + loc.status.slice(1)}
                      </Badge>
                      {loc.locAlerts > 0 && <Badge className="bg-red-100 text-red-700 text-xs">{loc.locAlerts} alert{loc.locAlerts > 1 ? "s" : ""}</Badge>}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs">Staff Today</p>
                        <p className="font-semibold text-gray-900">{loc.staffed} <span className="text-xs font-normal text-gray-400">on shift</span></p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Open Shifts</p>
                        <p className={`font-semibold ${loc.open > 0 ? "text-orange-600" : "text-gray-900"}`}>{loc.open}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Open Incidents</p>
                        <p className={`font-semibold ${loc.openIncidents > 0 ? "text-red-600" : "text-gray-900"}`}>{loc.openIncidents}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Current Patrons</p>
                        <p className="font-semibold text-gray-900">{loc.currentCount?.count ?? "—"}</p>
                      </div>
                    </div>
                    {loc.lastChemLog && (
                      <p className="text-xs text-gray-400 mt-2">Last chemical log: {loc.lastChemLog.date}</p>
                    )}
                  </div>
                  <Link to={createPageUrl("Schedule")} className="flex-shrink-0">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-700">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right Panel */}
        <div className="space-y-5">
          <Card className="border border-gray-100 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Incidents by Location</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={incidentsByLocation} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="incidents" radius={[0, 3, 3, 0]}>
                    {incidentsByLocation.map((_, i) => <Cell key={i} fill={i === 0 ? "#ef4444" : "#1a9c5b"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Status Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Safe", count: locationStats.filter(l => l.status === "safe").length, color: "bg-green-500" },
                { label: "Warning", count: locationStats.filter(l => l.status === "warning").length, color: "bg-yellow-500" },
                { label: "Critical", count: criticalLocations, color: "bg-red-500" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  <span className="text-sm text-gray-700 flex-1">{s.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{s.count} location{s.count !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { label: "Incident Logs", page: "IncidentLogs", icon: AlertTriangle },
                { label: "Compliance Dashboard", page: "ComplianceDashboard", icon: Shield },
                { label: "Reports", page: "Reports", icon: BarChart2 },
                { label: "Public Safety Dashboard", page: "PublicSafetyDashboard", icon: Eye },
              ].map(l => (
                <Link key={l.page} to={createPageUrl(l.page)}>
                  <div className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <l.icon className="w-4 h-4 text-gray-400" />
                    {l.label}
                    <ChevronRight className="w-3 h-3 ml-auto text-gray-300" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}