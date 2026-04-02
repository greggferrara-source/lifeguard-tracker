import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { EnterpriseModal } from "./EnterpriseGate";
import { Zap, X, ArrowRight } from "lucide-react";

/**
 * Contextual upsell banner — shown inline when a Pro user hits a growth trigger.
 *
 * Props:
 *  variant: "large-operation" | "compliance" | "multi-location" | "generic"
 *  dismissible: boolean (default true)
 */
const COPY = {
  "large-operation": {
    headline: "You're managing a large operation",
    body: "Upgrade to Enterprise for full control — multi-location oversight, audit trails, and advanced compliance tools built for large aquatic facilities.",
    cta: "Upgrade for Full Control",
  },
  "compliance": {
    headline: "Unlock advanced reporting & audit tools",
    body: "Access compliance scoring, exportable reports, incident audit logs, and certification histories — everything an inspector wants to see.",
    cta: "Unlock Advanced Compliance",
  },
  "multi-location": {
    headline: "Managing multiple locations?",
    body: "Enterprise gives you a single command center to compare performance, track compliance, and manage staff across all your facilities.",
    cta: "See Multi-Location Features",
  },
  "generic": {
    headline: "Take your operations to the next level",
    body: "Enterprise is designed for municipalities and large aquatic operations where compliance, accountability, and control are critical.",
    cta: "Explore Enterprise",
  },
};

export default function EnterpriseUpsellBanner({ variant = "generic", dismissible = true, className = "" }) {
  const [dismissed, setDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  if (dismissed) return null;

  const copy = COPY[variant] || COPY.generic;

  return (
    <>
      <EnterpriseModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <div className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 px-4 sm:px-5 py-4 rounded-xl bg-gradient-to-r from-[#0f172a] to-[#1e3a5f] text-white shadow-sm ${className}`}>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="sm:hidden">
            <p className="font-bold text-sm">{copy.headline}</p>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm hidden sm:block">{copy.headline}</p>
          <p className="text-xs text-white/70 mt-0.5 leading-relaxed">{copy.body}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white font-bold text-xs h-8 px-4 gap-1.5"
            onClick={() => setModalOpen(true)}
          >
            <Zap className="w-3 h-3" /> {copy.cta}
          </Button>
          <Link to={createPageUrl("Contact")}>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 text-xs h-8 px-3 gap-1">
              Book Demo <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 text-white/40 hover:text-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </>
  );
}