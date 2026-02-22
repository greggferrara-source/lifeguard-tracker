import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  AlertTriangle,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingUp,
  FileText,
  Eye,
  Thermometer,
  Wind,
  Waves,
  Info,
  ChevronRight,
  Share2,
  Megaphone,
  LifeBuoy,
} from "lucide-react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const RISK_CONFIG = {
  low: { label: "Low Risk", color: "bg-green-500", text: "text-green-700", bg: "bg-green-50", border: "border-green-200", dot: "bg-green-500" },
  moderate: { label: "Moderate Risk", color: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-500" },
  high: { label: "High Risk", color: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  critical: { label: "Hazardous", color: "bg-red-600", text: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-600" },
  closed: { label: "Closed", color: "bg-gray-500", text: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", dot: "bg-gray-500" },
};

// Determine risk level from incidents at a location today
function getLocationRisk(locationId, todayIncidents) {
  const locationIncidents = todayIncidents.filter(i => i.location_id === locationId);
  if (locationIncidents.some(i => i.severity === "critical")) return "critical";
  if (locationIncidents.some(i => i.severity === "serious")) return "high";
  if (locationIncidents.some(i => i.severity === "moderate")) return "moderate";
  if (locationIncidents.length > 0) return "moderate";
  return "low";
}

const INCIDENT_TYPE_COLORS = {
  rescue: "#ef4444",
  incident: "#f97316",
  near_miss: "#eab308",
  first_aid: "#3b82f6",
  injury: "#8b5cf6",
  other: "#6b7280",
};

export default function PublicSafetyDashboard() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const today = format(new Date(), "yyyy-MM-dd");
  const currentMonth = format(new Date(), "yyyy-MM");

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list(),
    refetchInterval: 60000,
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents-public"],
    queryFn: () => base44.entities.IncidentLog.list("-date", 500),
    refetchInterval: 60000,
  });

  const { data: patronCounts = [] } = useQuery({
    queryKey: ["patron-counts-public"],
    queryFn: () => base44.entities.PatronCount.list("-created_date", 300),
    refetchInterval: 60000,
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements-public"],
    queryFn: () => base44.entities.Announcement.filter({ status: "published" }, "-published_at", 10),
  });

  const activeLocations = locations.filter(l => l.status === "active");
  const todayIncidents = incidents.filter(i => i.date === today);
  const monthIncidents = incidents.filter(i => i.date?.startsWith(currentMonth));
  const todayPatrons = patronCounts.filter(c => c.date === today).reduce((sum, c) => sum + (c.count || 0), 0);
  const openIncidents = incidents.filter(i => i.status === "open" && i.date === today);

  // Overall site risk
  const overallRisk = useMemo(() => {
    if (todayIncidents.some(i => i.severity === "critical" && i.status === "open")) return "critical";
    if (todayIncidents.some(i => i.severity === "serious" && i.status === "open")) return "high";
    if (openIncidents.length > 3) return "high";
    if (openIncidents.length > 0) return "moderate";
    return "low";
  }, [todayIncidents, openIncidents]);

  // Last 7 days incident trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = format(d, "yyyy-MM-dd");
    return {
      day: format(d, "EEE"),
      incidents: incidents.filter(x => x.date === key).length,
      rescues: incidents.filter(x => x.date === key && x.type === "rescue").length,
    };
  });

  // Incident type breakdown (this month)
  const typeBreakdown = Object.entries(
    monthIncidents.reduce((acc, i) => { acc[i.type] = (acc[i.type] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Selected location data
  const selectedLoc = locations.find(l => l.id === selectedLocation);
  const locationIncidents = selectedLocation
    ? incidents.filter(i => i.location_id === selectedLocation).slice(0, 5)
    : [];
  const locationTodayCount = selectedLocation
    ? patronCounts.filter(c => c.location_id === selectedLocation && c.date === today).reduce((s, c) => s + (c.count || 0), 0)
    : 0;

  const overallConfig = RISK_CONFIG[overallRisk];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#0f4c2a] to-[#1a9c5b] text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <LifeBuoy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Public Safety Dashboard</h1>
                <p className="text-green-100 mt-1">Real-time safety conditions · Updated {format(new Date(), "h:mm a")}</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/15 border border-white/30`}>
              <div className={`w-3 h-3 rounded-full ${overallConfig.dot} animate-pulse`} style={{ background: "white" }} />
              <div>
                <p className="text-xs text-green-100 font-medium uppercase tracking-wide">Overall Site Status</p>
                <p className="text-lg font-bold">{overallConfig.label}</p>
              </div>
            </div>
          </div>

          {/* Quick stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Active Locations", value: activeLocations.length, icon: MapPin },
              { label: "Today's Patrons", value: todayPatrons.toLocaleString(), icon: Users },
              { label: "Today's Incidents", value: todayIncidents.length, icon: AlertTriangle },
              { label: "Open Right Now", value: openIncidents.length, icon: Eye },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center">
                <Icon className="w-5 h-5 text-green-200 mx-auto mb-1" />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-green-100">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="locations">
          <TabsList className="mb-6 bg-white border border-gray-200">
            <TabsTrigger value="locations">Location Status</TabsTrigger>
            <TabsTrigger value="analytics">Safety Analytics</TabsTrigger>
            <TabsTrigger value="incidents">Recent Activity</TabsTrigger>
            <TabsTrigger value="info">Info Center</TabsTrigger>
          </TabsList>

          {/* ── TAB: LOCATION STATUS ── */}
          <TabsContent value="locations">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Location Cards */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">All Locations</h2>
                {activeLocations.length === 0 && (
                  <div className="text-center py-16 text-gray-400">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No active locations configured</p>
                  </div>
                )}
                {activeLocations.map(loc => {
                  const risk = getLocationRisk(loc.id, todayIncidents);
                  const cfg = RISK_CONFIG[risk];
                  const locIncToday = todayIncidents.filter(i => i.location_id === loc.id);
                  const locPatrons = patronCounts.filter(c => c.location_id === loc.id && c.date === today).reduce((s, c) => s + (c.count || 0), 0);
                  const isSelected = selectedLocation === loc.id;

                  return (
                    <Card
                      key={loc.id}
                      onClick={() => setSelectedLocation(isSelected ? null : loc.id)}
                      className={`cursor-pointer transition-all hover:shadow-md border-2 ${isSelected ? `${cfg.border} shadow-md` : "border-transparent"}`}
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            {/* Risk indicator */}
                            <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${cfg.color}`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-gray-900 text-base">{loc.name}</h3>
                                <Badge className={`${cfg.bg} ${cfg.text} border ${cfg.border} text-xs`}>{cfg.label}</Badge>
                                <Badge variant="outline" className="text-xs capitalize">{loc.type}</Badge>
                              </div>
                              {loc.address && <p className="text-xs text-gray-500 mt-0.5">{loc.address}</p>}
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Users className="w-3 h-3" /> {locPatrons} patrons today
                                </span>
                                {locIncToday.length > 0 && (
                                  <span className="text-xs text-orange-600 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> {locIncToday.length} incident{locIncToday.length > 1 ? "s" : ""} today
                                  </span>
                                )}
                                {locIncToday.length === 0 && (
                                  <span className="text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> No incidents today
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-gray-400 mt-1 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                        </div>

                        {/* Expanded Detail */}
                        {isSelected && (
                          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                            {loc.notes && (
                              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1"><Info className="w-3 h-3" /> Location Notes</p>
                                <p className="text-sm text-blue-800">{loc.notes}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-xl font-bold text-gray-900">{locPatrons}</p>
                                <p className="text-xs text-gray-500">Today's Patrons</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-xl font-bold text-gray-900">{loc.min_guards_required || 1}</p>
                                <p className="text-xs text-gray-500">Min Guards Required</p>
                              </div>
                            </div>
                            {locIncToday.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-2">Today's Incidents</p>
                                <div className="space-y-1.5">
                                  {locIncToday.map(inc => (
                                    <div key={inc.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                      <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                                        <span className="text-xs text-gray-700 capitalize">{inc.type?.replace("_", " ")}</span>
                                        <span className="text-xs text-gray-400">· {inc.severity}</span>
                                      </div>
                                      <span className="text-xs text-gray-400">{inc.time || inc.date}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Right Panel */}
              <div className="space-y-4">
                {/* Risk Legend */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#1a9c5b]" /> Risk Level Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {Object.entries(RISK_CONFIG).map(([key, cfg]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.color}`} />
                        <span className="text-xs font-medium text-gray-700">{cfg.label}</span>
                        <span className="text-xs text-gray-400 ml-auto capitalize">{key}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Latest Announcements */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#1a9c5b]" /> Announcements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {announcements.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">No announcements</p>
                    )}
                    {announcements.slice(0, 4).map(a => (
                      <div key={a.id} className="border-l-2 border-[#1a9c5b] pl-3 py-1">
                        <p className="text-xs font-semibold text-gray-800">{a.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.content}</p>
                        {a.priority === "urgent" && <Badge className="mt-1 bg-red-100 text-red-700 text-xs border border-red-200">Urgent</Badge>}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Safety Tips */}
                <Card className="bg-[#f0faf5] border-[#1a9c5b]/20">
                  <CardContent className="pt-4">
                    <p className="text-xs font-bold text-[#1a9c5b] uppercase tracking-wide mb-3 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" /> Safety Reminders
                    </p>
                    <ul className="space-y-2">
                      {[
                        "Always swim near a lifeguard",
                        "Never swim alone",
                        "Obey all posted signs",
                        "Children must be supervised",
                        "Know your swimming ability",
                      ].map(tip => (
                        <li key={tip} className="text-xs text-green-800 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1a9c5b] mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB: ANALYTICS ── */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 7-day incident trend */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#1a9c5b]" /> 7-Day Incident Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={last7Days}>
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="incidents" name="Incidents" fill="#f97316" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="rescues" name="Rescues" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Incident type breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#1a9c5b]" /> This Month by Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {typeBreakdown.length === 0 ? (
                    <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">No incidents this month</div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={typeBreakdown} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`} labelLine={false}>
                            {typeBreakdown.map((entry, idx) => (
                              <Cell key={idx} fill={INCIDENT_TYPE_COLORS[entry.name] || "#6b7280"} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location hotspots */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#1a9c5b]" /> Incident Hotspots (This Month)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeLocations
                    .map(loc => ({
                      ...loc,
                      count: monthIncidents.filter(i => i.location_id === loc.id).length,
                    }))
                    .sort((a, b) => b.count - a.count)
                    .map((loc, idx) => (
                      <div key={loc.id} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-4">#{idx + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700">{loc.name}</span>
                            <span className="text-gray-500">{loc.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1a9c5b] rounded-full"
                              style={{ width: `${monthIncidents.length > 0 ? (loc.count / Math.max(...activeLocations.map(l => monthIncidents.filter(i => i.location_id === l.id).length), 1)) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* Summary stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#1a9c5b]" /> Monthly Safety Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Total Incidents", value: monthIncidents.length, color: "text-orange-600" },
                    { label: "Rescues", value: monthIncidents.filter(i => i.type === "rescue").length, color: "text-red-600" },
                    { label: "First Aid", value: monthIncidents.filter(i => i.type === "first_aid").length, color: "text-blue-600" },
                    { label: "EMS Dispatched", value: monthIncidents.filter(i => i.ems_called).length, color: "text-purple-600" },
                    { label: "Near Misses", value: monthIncidents.filter(i => i.type === "near_miss").length, color: "text-yellow-600" },
                    { label: "Resolved", value: monthIncidents.filter(i => i.status === "closed").length, color: "text-green-600" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── TAB: RECENT ACTIVITY ── */}
          <TabsContent value="incidents">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Recent Safety Activity</h2>
                <Badge variant="outline" className="text-xs">{incidents.slice(0, 50).length} records shown</Badge>
              </div>
              {incidents.slice(0, 30).length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No incidents on record</p>
                </div>
              )}
              <div className="space-y-3">
                {incidents.slice(0, 30).map(inc => {
                  const isToday = inc.date === today;
                  return (
                    <Card key={inc.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="pt-3 pb-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            inc.severity === "critical" ? "bg-red-600" :
                            inc.severity === "serious" ? "bg-orange-500" :
                            inc.severity === "moderate" ? "bg-yellow-500" : "bg-green-500"
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs capitalize">{inc.type?.replace("_", " ")}</Badge>
                              <Badge className={`text-xs capitalize ${
                                inc.severity === "critical" ? "bg-red-100 text-red-700" :
                                inc.severity === "serious" ? "bg-orange-100 text-orange-700" :
                                inc.severity === "moderate" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                              }`}>{inc.severity}</Badge>
                              {inc.ems_called && <Badge className="bg-red-100 text-red-700 text-xs">EMS Called</Badge>}
                              {isToday && <Badge className="bg-blue-100 text-blue-700 text-xs">Today</Badge>}
                            </div>
                            <p className="text-sm text-gray-700 mt-1 line-clamp-1">{inc.description}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {inc.location_name} · {inc.date}{inc.time ? ` · ${inc.time}` : ""}
                            </p>
                          </div>
                          <Badge className={`text-xs ${
                            inc.status === "closed" ? "bg-gray-100 text-gray-500" :
                            inc.status === "reviewed" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-700"
                          }`}>{inc.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ── TAB: INFO CENTER ── */}
          <TabsContent value="info">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Rules & Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-5 h-5 text-[#1a9c5b]" /> Rules & Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: "General Pool Rules", items: ["No running on pool deck", "Shower before entering", "No diving in shallow end", "Children under 12 must have adult supervision"] },
                    { title: "Beach Safety Rules", items: ["Swim between the flags only", "Check conditions before entering", "No alcohol on beach", "Rip currents — swim parallel to shore to escape"] },
                    { title: "Emergency Procedures", items: ["Signal to lifeguard immediately", "Call 911 for emergencies", "AED stations at all entry points", "First aid kits at lifeguard stands"] },
                  ].map(section => (
                    <div key={section.title} className="border border-gray-100 rounded-xl p-4">
                      <p className="text-sm font-bold text-gray-800 mb-2">{section.title}</p>
                      <ul className="space-y-1.5">
                        {section.items.map(item => (
                          <li key={item} className="text-xs text-gray-600 flex items-start gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-[#1a9c5b] mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Announcements full view */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Megaphone className="w-5 h-5 text-[#1a9c5b]" /> Current Announcements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    {announcements.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-6">No active announcements</p>
                    )}
                    {announcements.map(a => (
                      <div key={a.id} className={`rounded-xl p-4 border ${
                        a.priority === "urgent" ? "bg-red-50 border-red-200" :
                        a.priority === "high" ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-gray-800">{a.title}</p>
                          <Badge className={`text-xs capitalize flex-shrink-0 ${
                            a.priority === "urgent" ? "bg-red-100 text-red-700" :
                            a.priority === "high" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
                          }`}>{a.priority}</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">{a.content}</p>
                        {a.location_name && (
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {a.location_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Contact / Emergency */}
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-5">
                    <p className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Emergency Contacts
                    </p>
                    <div className="space-y-2">
                      {[
                        { label: "Emergency", number: "911" },
                        { label: "Lifeguard Station", number: "Contact Facility" },
                        { label: "Poison Control", number: "1-800-222-1222" },
                      ].map(({ label, number }) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-red-700">{label}</span>
                          <span className="font-bold text-red-900">{number}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}