import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/hooks/useSubscription";
import EnterpriseUpsellBanner from "@/components/enterprise/EnterpriseUpsellBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield, FlaskConical, ClipboardList, Wrench, AlertTriangle,
  Award, CheckCircle2, XCircle, ArrowRight, Clock, TrendingUp
} from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return differenceInDays(parseISO(dateStr), new Date());
}

export default function ComplianceDashboard() {
  const { isEnterprise } = useSubscription();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { data: certs = [] } = useQuery({ queryKey: ["certifications"], queryFn: () => base44.entities.Certification.list("-created_date", 500) });
  const { data: chemLogs = [] } = useQuery({ queryKey: ["chemical-logs"], queryFn: () => base44.entities.ChemicalLog.list("-created_date", 100) });
  const { data: inspections = [] } = useQuery({ queryKey: ["inspections"], queryFn: () => base44.entities.InspectionReport.list("-created_date", 100) });
  const { data: maintenance = [] } = useQuery({ queryKey: ["maintenance-reports"], queryFn: () => base44.entities.MaintenanceReport.list("-created_date", 100) });
  const { data: incidents = [] } = useQuery({ queryKey: ["incident-logs"], queryFn: () => base44.entities.IncidentLog.list("-created_date", 100) });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });

  // Computed stats
  const expiringSoon = certs.filter(c => { const d = daysUntil(c.expiry_date); return d !== null && d <= 30 && d >= 0; });
  const expiredCerts = certs.filter(c => { const d = daysUntil(c.expiry_date); return d !== null && d < 0; });
  const failedInspections = inspections.filter(i => i.overall_result === "fail");
  const openMaintenance = maintenance.filter(m => m.status === "open");
  const criticalMaintenance = maintenance.filter(m => m.status === "open" && m.priority === "critical");
  const openIncidents = incidents.filter(i => i.status === "open");
  const recentChemFails = chemLogs.filter(l => l.status === "critical" || l.status === "requires_action").slice(0, 5);

  // Compliance score per area (simple 0-100)
  const certScore = certs.length === 0 ? 100 : Math.round(((certs.length - expiredCerts.length - expiringSoon.length) / certs.length) * 100);
  const inspScore = inspections.length === 0 ? 100 : Math.round(((inspections.length - failedInspections.length) / inspections.length) * 100);
  const maintScore = maintenance.length === 0 ? 100 : Math.round(((maintenance.length - openMaintenance.length) / maintenance.length) * 100);
  const incidentScore = incidents.length === 0 ? 100 : Math.round(((incidents.length - openIncidents.length) / incidents.length) * 100);
  const overallScore = Math.round((certScore + inspScore + maintScore + incidentScore) / 4);

  const scoreColor = overallScore >= 80 ? "text-green-600" : overallScore >= 60 ? "text-yellow-600" : "text-red-600";
  const scoreBg = overallScore >= 80 ? "bg-green-50 border-green-200" : overallScore >= 60 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";

  const modules = [
    {
      title: "Certifications",
      icon: Award,
      page: "Certifications",
      stats: [
        { label: "Total", value: certs.length },
        { label: "Expiring (30d)", value: expiringSoon.length, alert: expiringSoon.length > 0 },
        { label: "Expired", value: expiredCerts.length, alert: expiredCerts.length > 0 },
        { label: "Pending Review", value: certs.filter(c => c.status === "pending_review").length, alert: certs.filter(c => c.status === "pending_review").length > 0 },
      ],
      score: certScore,
      recent: expiringSoon.slice(0, 3).map(c => ({ label: `${c.employee_name} — ${c.name}`, sub: `Expires in ${daysUntil(c.expiry_date)} days`, type: "warning" })),
    },
    {
      title: "Chemical Logs",
      icon: FlaskConical,
      page: "ChemicalLogs",
      stats: [
        { label: "Total Logs", value: chemLogs.length },
        { label: "Critical", value: chemLogs.filter(l => l.status === "critical").length, alert: chemLogs.filter(l => l.status === "critical").length > 0 },
        { label: "Requires Action", value: chemLogs.filter(l => l.status === "requires_action").length, alert: chemLogs.filter(l => l.status === "requires_action").length > 0 },
        { label: "Pass Rate", value: chemLogs.length > 0 ? `${Math.round((chemLogs.filter(l => l.status === "pass").length / chemLogs.length) * 100)}%` : "—" },
      ],
      score: chemLogs.length === 0 ? 100 : Math.round((chemLogs.filter(l => l.status === "pass").length / chemLogs.length) * 100),
      recent: recentChemFails.slice(0, 3).map(l => ({ label: `${l.location_name} — ${l.status?.replace("_", " ")}`, sub: l.date, type: "alert" })),
    },
    {
      title: "Inspections",
      icon: ClipboardList,
      page: "Inspections",
      stats: [
        { label: "Total", value: inspections.length },
        { label: "Failed", value: failedInspections.length, alert: failedInspections.length > 0 },
        { label: "Conditional", value: inspections.filter(i => i.overall_result === "conditional").length, alert: inspections.filter(i => i.overall_result === "conditional").length > 0 },
        { label: "Pass Rate", value: inspections.length > 0 ? `${inspScore}%` : "—" },
      ],
      score: inspScore,
      recent: failedInspections.slice(0, 3).map(i => ({ label: `${i.location_name} — Failed`, sub: i.date, type: "alert" })),
    },
    {
      title: "Maintenance",
      icon: Wrench,
      page: "MaintenanceReports",
      stats: [
        { label: "Total", value: maintenance.length },
        { label: "Open", value: openMaintenance.length, alert: openMaintenance.length > 0 },
        { label: "Critical", value: criticalMaintenance.length, alert: criticalMaintenance.length > 0 },
        { label: "Resolved", value: maintenance.filter(m => m.status === "resolved").length },
      ],
      score: maintScore,
      recent: criticalMaintenance.slice(0, 3).map(m => ({ label: m.title, sub: `${m.location_name} · ${m.priority}`, type: "alert" })),
    },
    {
      title: "Incidents & Rescues",
      icon: AlertTriangle,
      page: "IncidentLogs",
      stats: [
        { label: "Total", value: incidents.length },
        { label: "Open", value: openIncidents.length, alert: openIncidents.length > 0 },
        { label: "Rescues", value: incidents.filter(i => i.type === "rescue").length },
        { label: "EMS Called", value: incidents.filter(i => i.ems_called).length, alert: incidents.filter(i => i.ems_called).length > 0 },
      ],
      score: incidentScore,
      recent: openIncidents.slice(0, 3).map(i => ({ label: `${i.type?.replace("_", " ")} — ${i.severity}`, sub: `${i.location_name} · ${i.date}`, type: "warning" })),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of all compliance areas across your facilities</p>
      </div>

      {/* Enterprise upsell — shown to non-enterprise users viewing compliance */}
      {!isEnterprise && (
        <EnterpriseUpsellBanner variant="compliance" />
      )}

      {/* Overall Score + Top Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score */}
        <div className={`rounded-2xl border p-6 ${scoreBg}`}>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Overall Compliance Score</p>
          <div className="flex items-end gap-2 mb-4">
            <span className={`text-6xl font-extrabold ${scoreColor}`}>{overallScore}</span>
            <span className="text-2xl text-gray-400 mb-1">/100</span>
          </div>
          <div className="space-y-2">
            {modules.map(m => (
              <div key={m.title} className="flex items-center gap-2">
                <m.icon className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-600 flex-1">{m.title}</span>
                <span className={`text-xs font-bold ${m.score >= 80 ? "text-green-600" : m.score >= 60 ? "text-yellow-600" : "text-red-600"}`}>{m.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 p-6">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Active Issues Requiring Attention</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[
              ...expiredCerts.map(c => ({ text: `Expired cert: ${c.employee_name} — ${c.name}`, link: "Certifications", severity: "high" })),
              ...expiringSoon.slice(0, 3).map(c => ({ text: `Cert expiring in ${daysUntil(c.expiry_date)}d: ${c.employee_name} — ${c.name}`, link: "Certifications", severity: "medium" })),
              ...failedInspections.slice(0, 3).map(i => ({ text: `Failed inspection: ${i.location_name} on ${i.date}`, link: "Inspections", severity: "high" })),
              ...criticalMaintenance.slice(0, 3).map(m => ({ text: `Critical maintenance: ${m.title}`, link: "MaintenanceReports", severity: "high" })),
              ...openIncidents.slice(0, 3).map(i => ({ text: `Open incident: ${i.type?.replace("_", " ")} at ${i.location_name}`, link: "IncidentLogs", severity: "medium" })),
            ].slice(0, 12).map((a, i) => (
              <Link key={i} to={createPageUrl(a.link)} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.severity === "high" ? "bg-red-500" : "bg-yellow-500"}`} />
                <span className="text-sm text-gray-700 flex-1 group-hover:text-gray-900">{a.text}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
              </Link>
            ))}
            {[...expiredCerts, ...expiringSoon, ...failedInspections, ...criticalMaintenance, ...openIncidents].length === 0 && (
              <div className="flex items-center gap-3 p-4 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">No active compliance issues — you're all clear!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {modules.map(module => {
          const Icon = module.icon;
          const hasAlerts = module.stats.some(s => s.alert);
          return (
            <Card key={module.title} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-5">
                {/* Module Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${hasAlerts ? "bg-red-50" : "bg-[#f0faf5]"}`}>
                      <Icon className={`w-5 h-5 ${hasAlerts ? "text-red-500" : "text-[#1a9c5b]"}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                  </div>
                  <div className={`text-sm font-bold px-2 py-0.5 rounded-full ${module.score >= 80 ? "bg-green-100 text-green-700" : module.score >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                    {module.score}%
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {module.stats.map((stat, i) => (
                    <div key={i} className={`rounded-lg p-2.5 ${stat.alert ? "bg-red-50" : "bg-gray-50"}`}>
                      <p className={`text-lg font-bold ${stat.alert ? "text-red-600" : "text-gray-900"}`}>{stat.value}</p>
                      <p className="text-[11px] text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent alerts for this module */}
                {module.recent.length > 0 && (
                  <div className="space-y-1.5 mb-4 border-t pt-3">
                    {module.recent.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${item.type === "alert" ? "bg-red-400" : "bg-yellow-400"}`} />
                        <div>
                          <p className="text-xs font-medium text-gray-800 leading-tight">{item.label}</p>
                          <p className="text-[11px] text-gray-400">{item.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link to={createPageUrl(module.page)}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Open {module.title} <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="border-t border-gray-100 pt-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Access</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Log Chemical Reading", page: "ChemicalLogs" },
            { label: "Run Inspection", page: "Inspections" },
            { label: "Log Incident", page: "IncidentLogs" },
            { label: "Report Maintenance", page: "MaintenanceReports" },
            { label: "View Certifications", page: "Certifications" },
          ].map(link => (
            <Link key={link.page} to={createPageUrl(link.page)}>
              <Button variant="outline" size="sm" className="text-xs">{link.label}</Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}