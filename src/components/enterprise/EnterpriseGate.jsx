import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import {
  Shield, Lock, CheckCircle2, BarChart2, Globe,
  FileText, Bell, Users, X, ArrowRight, Zap
} from "lucide-react";

const ENTERPRISE_BENEFITS = [
  { icon: Shield, text: "Full compliance audit logs & certification history" },
  { icon: BarChart2, text: "Advanced reports, payroll exports & compliance scoring" },
  { icon: Globe, text: "Multi-location command center & performance comparisons" },
  { icon: FileText, text: "Incident audit trails with full user action tracking" },
  { icon: Bell, text: "Priority alerts — SMS/email escalation rules" },
  { icon: Users, text: "Granular role-based permissions & access control" },
];

/**
 * EnterpriseModal — shown when a non-enterprise user clicks a gated feature.
 */
export function EnterpriseModal({ open, onClose, featureName }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] px-6 pt-6 pb-5">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Enterprise Feature</p>
              <h2 className="text-lg font-extrabold text-white leading-tight">Upgrade to Enterprise</h2>
            </div>
          </div>
          {featureName && (
            <p className="text-sm text-white/70">
              <span className="font-semibold text-white">{featureName}</span> is available on the Enterprise plan.
            </p>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">What you unlock</p>
          <ul className="space-y-2.5 mb-5">
            {ENTERPRISE_BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-[#f0faf5] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3 h-3 text-[#1a9c5b]" />
                </div>
                <span className="text-sm text-gray-700">{text}</span>
              </li>
            ))}
          </ul>

          <p className="text-xs text-gray-400 italic mb-5 border-t border-gray-100 pt-4">
            "Designed for municipalities and large aquatic operations where compliance and accountability are critical."
          </p>

          <div className="flex flex-col gap-2">
            <Link to={createPageUrl("Pricing")} onClick={onClose}>
              <Button className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] gap-2 font-bold">
                <Zap className="w-4 h-4" /> Upgrade Now
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")} onClick={onClose}>
              <Button variant="outline" className="w-full gap-2 text-gray-700">
                Book a Demo <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * EnterpriseGate — wraps children.
 * If user is not Enterprise, renders a locked placeholder instead.
 *
 * Props:
 *  featureName  — string shown in modal
 *  preview      — if true, shows a blurred preview with overlay instead of full lock
 *  children     — the actual feature UI
 */
export default function EnterpriseGate({ featureName, preview = false, children }) {
  const { isEnterprise, isLoading } = useSubscription();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) return null;
  if (isEnterprise) return <>{children}</>;

  if (preview) {
    return (
      <>
        <EnterpriseModal open={modalOpen} onClose={() => setModalOpen(false)} featureName={featureName} />
        <div className="relative rounded-xl overflow-hidden">
          {/* Blurred preview of the actual content */}
          <div className="pointer-events-none select-none" style={{ filter: "blur(4px)", opacity: 0.5 }}>
            {children}
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-xl">
            <div className="text-center px-6 py-5 max-w-xs">
              <div className="w-12 h-12 rounded-full bg-[#0f172a] flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold text-gray-900 mb-1">Unlock full visibility</p>
              <p className="text-sm text-gray-500 mb-4">
                {featureName ? `${featureName} is` : "This feature is"} available on the Enterprise plan.
              </p>
              <Button
                size="sm"
                className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-1.5 font-bold"
                onClick={() => setModalOpen(true)}
              >
                <Zap className="w-3.5 h-3.5" /> Upgrade to Enterprise
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Full lock — show a locked card
  return (
    <>
      <EnterpriseModal open={modalOpen} onClose={() => setModalOpen(false)} featureName={featureName} />
      <div
        className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-[#1a9c5b] hover:bg-[#f0faf5] transition-all group"
        onClick={() => setModalOpen(true)}
      >
        <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-4 group-hover:border-[#1a9c5b] transition-colors shadow-sm">
          <Lock className="w-6 h-6 text-gray-400 group-hover:text-[#1a9c5b] transition-colors" />
        </div>
        <p className="font-bold text-gray-800 mb-1">{featureName || "Enterprise Feature"}</p>
        <p className="text-sm text-gray-500 mb-4 max-w-xs">
          This feature is available on the Enterprise plan — built for compliance-critical aquatic operations.
        </p>
        <Button size="sm" className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-1.5 font-semibold">
          <Zap className="w-3.5 h-3.5" /> Upgrade to Enterprise
        </Button>
      </div>
    </>
  );
}