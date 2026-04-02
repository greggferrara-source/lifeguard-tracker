import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useSubscription } from "@/hooks/useSubscription";
import EnterpriseGate from "@/components/enterprise/EnterpriseGate";
import EnterpriseUpsellBanner from "@/components/enterprise/EnterpriseUpsellBanner";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { differenceInDays, parseISO, format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Shield, BarChart2, Globe, FileText, Bell, Users,
  CheckCircle2, ArrowRight, Lock, TrendingUp, Award
} from "lucide-react";

function daysUntil(d) {
  if (!d) return null;
  return differenceInDays(parseISO(d), new Date());
}

// ── Fake audit trail data for preview ─────────────────────────────────────────
const SAMPLE_AUDIT = [
  { user: "Sarah M.", action: "Updated certification status → Approved", time: "2 hours ago", icon: Award },
  { user: "Jason R.", action: "Closed incident report #142 — Rescue", time: "5 hours ago", icon: FileText },
  { user: "Admin", action: "Exported compliance report (PDF)", time: "Yesterday 3:14pm", icon: BarChart2 },
  { user: "Tina L.", action: "Triggered SMS alert: Understaffing at Pool A", time: "Yesterday 9:02am", icon: Bell },
  { user: "Sarah M.", action: "Added new employee — Certification pending", time: "2 days ago", icon: Users },
];

// ── Compliance score breakdown (preview data) ─────────────────────────────────
const SAMPLE_SCORES = [
  { area: "Certifications", score: 88, color: "bg-emerald-500" },
  { area: "Inspections", score: 74, color: "bg-amber-400" },
  { area: "Incident Closure", score: 91, color: "bg-emerald-500" },
  { area: "Chemical Compliance", score: 66, color: "bg-amber-400" },
  { area: "Maintenance", score: 55, color: "bg-red-500" },
];

function ScoreBar({ area, score, color }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-700 font-medium">{area}</span>
        <span className={`text-sm font-bold ${score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-red-600"}`}>{score}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ── Real compliance data for enterprise users ─────────────────────────────────
function RealComplianceAudit() {
  const { data: certs = [] } = useQuery({ queryKey: ["certifications"], queryFn: () => base44.entities.Certification.list("-created_date", 200) });
  const { data: incidents = [] } = useQuery({ queryKey: ["incident-reports"], queryFn: () => base44.entities.IncidentReport.list("-created_date", 100) });
  const { data: auditTrails = [] } = useQuery({ queryKey: ["audit-trails"], queryFn: () => base44.entities.IncidentAuditTrail.list("-timestamp", 20) });

  const expiredCerts = certs.filter(c => { const d = daysUntil(c.expiry_date); return d !== null && d < 0; });
  const expiringSoon = certs.filter(c => { const d = daysUntil(c.expiry_date); return d !== null && d >= 0 && d <= 30; });
  const approvedCerts = certs.filter(c => c.status === "approved" && daysUntil(c.expiry_date) > 0);
  const certScore = certs.length > 0 ? Math.round(approvedCerts.length / certs.length * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Compliance Score Breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#1a9c5b]" /> Compliance Score Breakdown
        </h3>
        <div className="space-y-3">
          <ScoreBar area="Certification Compliance" score={certScore} color={certScore >= 80 ? "bg-emerald-500" : certScore >= 60 ? "bg-amber-400" : "bg-red-500"} />
          <ScoreBar area="Incident Closure Rate" score={incidents.length > 0 ? Math.round(incidents.filter(i => i.status === "closed").length / incidents.length * 100) : 100} color="bg-emerald-500" />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: "Total Certs", value: certs.length },
            { label: "Expired", value: expiredCerts.length, alert: expiredCerts.length > 0 },
            { label: "Expiring Soon", value: expiringSoon.length, alert: expiringSoon.length > 0 },
          ].map(s => (
            <div key={s.label} className={`rounded-lg p-3 text-center ${s.alert ? "bg-red-50" : "bg-gray-50"}`}>
              <p className={`text-2xl font-extrabold ${s.alert ? "text-red-600" : "text-gray-900"}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Trail */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" /> Incident Audit Trail
          </h3>
          <Link to={createPageUrl("IncidentDashboard")} className="text-xs text-[#1a9c5b] hover:underline">View all →</Link>
        </div>
        {auditTrails.length > 0 ? (
          <div className="space-y-3">
            {auditTrails.slice(0, 8).map((trail, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-7 h-7 rounded-full bg-[#f0faf5] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-[#1a9c5b]">{(trail.performed_by_name || trail.performed_by_email || "?")[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">{trail.performed_by_name || trail.performed_by_email}</p>
                  <p className="text-xs text-gray-500">{trail.description || `${trail.action} on incident`}</p>
                </div>
                <p className="text-[10px] text-gray-400 flex-shrink-0">{trail.timestamp ? format(parseISO(trail.timestamp), "MMM d, h:mma") : ""}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No audit trail entries yet</p>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EnterprisePreview() {
  const { isEnterprise, isLoading } = useSubscription();
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.list() });

  const activeEmployees = employees.filter(e => e.status === "active").length;
  const isLargeOperation = locations.length >= 2 || activeEmployees >= 15;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Enterprise Features</h1>
          <p className="text-gray-500 mt-1 text-sm">Advanced compliance, audit, and multi-location control tools</p>
        </div>
        {!isEnterprise && (
          <Link to={createPageUrl("Pricing")}>
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-1.5 font-bold text-sm hidden sm:flex">
              Upgrade Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Contextual banner */}
      {!isEnterprise && isLargeOperation && (
        <EnterpriseUpsellBanner variant="large-operation" />
      )}
      {!isEnterprise && !isLargeOperation && (
        <EnterpriseUpsellBanner variant="compliance" />
      )}

      {/* Section 1: Compliance Score (preview for non-enterprise) */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Compliance Intelligence</h2>
        <EnterpriseGate featureName="Compliance Score & Audit Logs" preview={!isEnterprise}>
          <RealComplianceAudit />
        </EnterpriseGate>

        {/* Preview for non-enterprise */}
        {!isEnterprise && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fake score preview */}
            <div className="relative bg-white rounded-xl border border-gray-100 p-5 shadow-sm overflow-hidden">
              <div className="pointer-events-none select-none" style={{ filter: "blur(3px)", opacity: 0.6 }}>
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Compliance Breakdown</h3>
                <div className="space-y-2.5">
                  {SAMPLE_SCORES.map(s => <ScoreBar key={s.area} {...s} />)}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                <div className="text-center px-4">
                  <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-600">Compliance breakdown — Enterprise only</p>
                </div>
              </div>
            </div>

            {/* Fake audit trail preview */}
            <div className="relative bg-white rounded-xl border border-gray-100 p-5 shadow-sm overflow-hidden">
              <div className="pointer-events-none select-none" style={{ filter: "blur(3px)", opacity: 0.6 }}>
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Recent Audit Events</h3>
                <div className="space-y-2">
                  {SAMPLE_AUDIT.map((a, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span className="font-semibold text-gray-700 w-20 truncate flex-shrink-0">{a.user}</span>
                      <span className="text-gray-500 flex-1 truncate">{a.action}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                <div className="text-center px-4">
                  <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-600">Audit trail — Enterprise only</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Multi-Location Command */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Multi-Location Command</h2>
        <EnterpriseGate featureName="Multi-Location Dashboard">
          <Link to={createPageUrl("MultiLocationDashboard")}>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#1a9c5b] transition-colors group">
              <Globe className="w-5 h-5 text-[#1a9c5b]" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">Multi-Location Dashboard</p>
                <p className="text-xs text-gray-500">Compare performance across all {locations.length} locations</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1a9c5b] transition-colors" />
            </div>
          </Link>
        </EnterpriseGate>
      </div>

      {/* Section 3: Advanced Exports */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Custom Reports & Exports</h2>
        <EnterpriseGate featureName="Custom Reports & Exports">
          <Link to={createPageUrl("AdvancedReporting")}>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#1a9c5b] transition-colors group">
              <BarChart2 className="w-5 h-5 text-[#1a9c5b]" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">Advanced Reports</p>
                <p className="text-xs text-gray-500">Payroll exports, compliance PDFs, and incident reports</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1a9c5b] transition-colors" />
            </div>
          </Link>
        </EnterpriseGate>
      </div>

      {/* Section 4: Role-Based Permissions */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Access Control</h2>
        <EnterpriseGate featureName="Role-Based Permissions">
          <Link to={createPageUrl("Settings")}>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#1a9c5b] transition-colors group">
              <Users className="w-5 h-5 text-[#1a9c5b]" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">Role-Based Permissions</p>
                <p className="text-xs text-gray-500">Granular access control per location and role</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1a9c5b] transition-colors" />
            </div>
          </Link>
        </EnterpriseGate>
      </div>

      {/* Value prop footer */}
      {!isEnterprise && (
        <div className="bg-[#0f172a] rounded-2xl px-6 py-6 text-center">
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Enterprise Plan</p>
          <h3 className="text-xl font-extrabold text-white mb-2">Safety. Compliance. Control.</h3>
          <p className="text-sm text-white/60 max-w-md mx-auto mb-5">
            Designed for municipalities and large aquatic operations where compliance and accountability are critical.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl("Pricing")}>
              <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] font-bold gap-1.5">
                Upgrade to Enterprise <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold">
                Book a Demo
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}