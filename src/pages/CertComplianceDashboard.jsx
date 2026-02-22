import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Award, AlertTriangle, CheckCircle2, Clock, Users,
  Search, MapPin, TrendingUp, TrendingDown, Filter
} from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return differenceInDays(parseISO(dateStr), new Date());
}

function statusForDays(d) {
  if (d === null) return "unknown";
  if (d < 0) return "expired";
  if (d <= 30) return "expiring_soon";
  if (d <= 60) return "expiring";
  return "valid";
}

const statusConfig = {
  valid: { label: "Valid", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  expiring: { label: "Expiring 60d", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  expiring_soon: { label: "Expiring 30d", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  expired: { label: "Expired", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
  unknown: { label: "No Expiry", color: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
};

export default function CertComplianceDashboard() {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [certFilter, setCertFilter] = useState("all");

  const { data: certs = [], isLoading } = useQuery({
    queryKey: ["certifications"],
    queryFn: () => base44.entities.Certification.list("-created_date", 1000),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list(),
  });

  // Enrich certs with days until expiry + status
  const enriched = useMemo(() => certs.map(c => {
    const d = daysUntil(c.expiry_date);
    return { ...c, daysUntil: d, expiryStatus: statusForDays(d) };
  }), [certs]);

  // Unique cert types
  const certTypes = useMemo(() => [...new Set(enriched.map(c => c.name).filter(Boolean))].sort(), [enriched]);

  // KPIs
  const total = enriched.length;
  const expired = enriched.filter(c => c.expiryStatus === "expired").length;
  const expiringSoon = enriched.filter(c => c.expiryStatus === "expiring_soon").length;
  const expiring60 = enriched.filter(c => c.expiryStatus === "expiring").length;
  const valid = enriched.filter(c => c.expiryStatus === "valid").length;
  const complianceRate = total > 0 ? Math.round((valid / total) * 100) : 100;

  // Per-location compliance
  const locationStats = useMemo(() => {
    const map = {};
    enriched.forEach(c => {
      const locName = c.location_name || "Unassigned";
      if (!map[locName]) map[locName] = { name: locName, total: 0, expired: 0, expiringSoon: 0, valid: 0 };
      map[locName].total++;
      if (c.expiryStatus === "expired") map[locName].expired++;
      else if (c.expiryStatus === "expiring_soon") map[locName].expiringSoon++;
      else if (c.expiryStatus === "valid") map[locName].valid++;
    });
    return Object.values(map).map(l => ({
      ...l,
      score: l.total > 0 ? Math.round((l.valid / l.total) * 100) : 100,
    })).sort((a, b) => a.score - b.score);
  }, [enriched]);

  // Cert type breakdown for chart
  const certTypeData = useMemo(() => {
    const map = {};
    enriched.forEach(c => {
      const n = c.name || "Other";
      if (!map[n]) map[n] = { name: n, valid: 0, expiring: 0, expired: 0 };
      if (c.expiryStatus === "expired") map[n].expired++;
      else if (c.expiryStatus === "expiring_soon" || c.expiryStatus === "expiring") map[n].expiring++;
      else map[n].valid++;
    });
    return Object.values(map).sort((a, b) => (b.expired + b.expiring) - (a.expired + a.expiring));
  }, [enriched]);

  // Filtered list
  const filtered = useMemo(() => enriched.filter(c => {
    if (locationFilter !== "all" && c.location_name !== locationFilter) return false;
    if (statusFilter !== "all" && c.expiryStatus !== statusFilter) return false;
    if (certFilter !== "all" && c.name !== certFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (c.employee_name || "").toLowerCase().includes(q) ||
        (c.name || "").toLowerCase().includes(q) ||
        (c.location_name || "").toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => (a.daysUntil ?? 9999) - (b.daysUntil ?? 9999)), [enriched, locationFilter, statusFilter, certFilter, search]);

  const scoreColor = complianceRate >= 85 ? "text-green-600" : complianceRate >= 65 ? "text-yellow-600" : "text-red-600";
  const scoreBg = complianceRate >= 85 ? "bg-green-50 border-green-200" : complianceRate >= 65 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-[#1a9c5b]" />
          Certification Compliance
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track certification status across all staff and locations</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`rounded-xl border p-5 ${scoreBg} col-span-2 lg:col-span-1`}>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Compliance Rate</p>
          <p className={`text-4xl font-extrabold ${scoreColor}`}>{complianceRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{valid} of {total} valid</p>
        </div>
        {[
          { label: "Total Certs", value: total, icon: Award, color: "text-gray-700", bg: "bg-gray-50" },
          { label: "Expired", value: expired, icon: AlertTriangle, color: "text-red-600", bg: expired > 0 ? "bg-red-50" : "bg-gray-50" },
          { label: "Expiring 30d", value: expiringSoon, icon: Clock, color: "text-orange-600", bg: expiringSoon > 0 ? "bg-orange-50" : "bg-gray-50" },
          { label: "Expiring 60d", value: expiring60, icon: Clock, color: "text-yellow-600", bg: "bg-gray-50" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`rounded-xl border p-5 ${s.bg}`}>
              <Icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts + Location breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cert type chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Certification Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {certTypeData.length === 0
              ? <p className="text-sm text-gray-400 text-center py-8">No certification data yet</p>
              : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={certTypeData} layout="vertical" barSize={14}>
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="valid" stackId="a" fill="#22c55e" name="Valid" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="expiring" stackId="a" fill="#f59e0b" name="Expiring" />
                  <Bar dataKey="expired" stackId="a" fill="#ef4444" name="Expired" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            }
          </CardContent>
        </Card>

        {/* Location scores */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1a9c5b]" /> By Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {locationStats.length === 0
              ? <p className="text-sm text-gray-400 text-center py-8">No location data</p>
              : <div className="space-y-3">
                {locationStats.map(loc => (
                  <div key={loc.name}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-medium text-gray-800 truncate flex-1">{loc.name}</span>
                      <span className={`ml-2 font-bold ${loc.score >= 85 ? "text-green-600" : loc.score >= 65 ? "text-yellow-600" : "text-red-600"}`}>
                        {loc.score}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${loc.score >= 85 ? "bg-green-500" : loc.score >= 65 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${loc.score}%` }}
                      />
                    </div>
                    {(loc.expired > 0 || loc.expiringSoon > 0) && (
                      <p className="text-[10px] text-red-500 mt-0.5">
                        {loc.expired > 0 ? `${loc.expired} expired` : ""}
                        {loc.expired > 0 && loc.expiringSoon > 0 ? " · " : ""}
                        {loc.expiringSoon > 0 ? `${loc.expiringSoon} expiring soon` : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            }
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search staff, cert, location..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="expiring_soon">Expiring 30d</SelectItem>
            <SelectItem value="expiring">Expiring 60d</SelectItem>
            <SelectItem value="valid">Valid</SelectItem>
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Locations" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locationStats.map(l => <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={certFilter} onValueChange={setCertFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Cert Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {certTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all" || locationFilter !== "all" || certFilter !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setStatusFilter("all"); setLocationFilter("all"); setCertFilter("all"); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Cert list */}
      <Card>
        <CardContent className="p-0">
          {isLoading
            ? <p className="text-sm text-gray-400 text-center py-10">Loading...</p>
            : filtered.length === 0
            ? <div className="text-center py-14 text-gray-400">
                <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No certifications match your filters.</p>
              </div>
            : <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Staff Member", "Certification", "Location", "Expiry Date", "Days Left", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const cfg = statusConfig[c.expiryStatus];
                    return (
                      <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50 ${c.expiryStatus === "expired" ? "bg-red-50/30" : c.expiryStatus === "expiring_soon" ? "bg-orange-50/20" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0`} />
                            <span className="font-medium text-gray-900">{c.employee_name || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{c.name || "—"}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{c.location_name || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                          {c.expiry_date ? format(parseISO(c.expiry_date), "MMM d, yyyy") : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {c.daysUntil === null ? "—"
                            : c.daysUntil < 0
                            ? <span className="text-red-600 font-bold">{Math.abs(c.daysUntil)}d overdue</span>
                            : <span className={c.daysUntil <= 30 ? "text-orange-600 font-bold" : "text-gray-600"}>{c.daysUntil}d</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
                Showing {filtered.length} of {total} certifications
              </div>
            </div>
          }
        </CardContent>
      </Card>
    </div>
  );
}