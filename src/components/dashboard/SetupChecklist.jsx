import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  CheckCircle2, Circle, MapPin, Users, CalendarDays,
  Shield, ChevronDown, ChevronUp, Sparkles, X
} from "lucide-react";

const ITEMS = [
  {
    key: "location",
    icon: MapPin,
    label: "Add your facility",
    desc: "Set up the pool, aquatic center, or beach you manage",
    page: "Locations",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "staff",
    icon: Users,
    label: "Add 3+ staff members",
    desc: "Add lifeguards so you can assign them to shifts",
    page: "Employees",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    key: "certs",
    icon: Shield,
    label: "Add certifications",
    desc: "Track CPR, First Aid, and Lifeguard certs — get expiry alerts",
    page: "Certifications",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    key: "schedule",
    icon: CalendarDays,
    label: "Create your first schedule",
    desc: "Use Auto Build or create shifts manually",
    page: "Schedule",
    color: "text-[#1a9c5b]",
    bg: "bg-[#f0faf5]",
  },
  {
    key: "incident",
    icon: Shield,
    label: "Log a test incident",
    desc: "Practice logging an incident from any device",
    page: "IncidentDashboard",
    color: "text-red-500",
    bg: "bg-red-50",
  },
];

export default function SetupChecklist({ hasLocations, employeeCount, hasShifts, hasCerts, hasIncidents }) {
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const completed = {
    location: hasLocations,
    staff: employeeCount >= 3,
    certs: hasCerts,
    schedule: hasShifts,
    incident: hasIncidents,
  };

  const doneCount = Object.values(completed).filter(Boolean).length;
  const allDone = doneCount === ITEMS.length;

  if (allDone || dismissed) return null;

  const pct = Math.round((doneCount / ITEMS.length) * 100);

  return (
    <div className="border border-[#1a9c5b]/20 bg-gradient-to-br from-[#f0faf5] to-white rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
        onClick={() => setCollapsed(c => !c)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a9c5b] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Get Set Up</p>
            <p className="text-xs text-gray-500">{doneCount} of {ITEMS.length} steps complete</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini progress */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#1a9c5b] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-[#1a9c5b]">{pct}%</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); setDismissed(true); }}
            className="text-gray-300 hover:text-gray-500 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {collapsed
            ? <ChevronDown className="w-4 h-4 text-gray-400" />
            : <ChevronUp className="w-4 h-4 text-gray-400" />
          }
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Progress bar */}
          <div className="px-5 pb-3">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1a9c5b] to-[#34d399] rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Items */}
          <div className="px-5 pb-5 space-y-2">
            {ITEMS.map(item => {
              const done = completed[item.key];
              return (
                <Link key={item.key} to={createPageUrl(item.page)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    done
                      ? "border-[#1a9c5b]/15 bg-white/50 opacity-60"
                      : "border-gray-100 bg-white hover:border-[#1a9c5b]/30 hover:shadow-sm cursor-pointer"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${done ? "bg-[#1a9c5b]/10" : item.bg} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-4 h-4 ${done ? "text-[#1a9c5b]" : item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? "line-through text-gray-400" : "text-gray-800"}`}>
                      {item.label}
                    </p>
                    {!done && <p className="text-xs text-gray-400 truncate">{item.desc}</p>}
                  </div>
                  {done
                    ? <CheckCircle2 className="w-4 h-4 text-[#1a9c5b] flex-shrink-0" />
                    : <Circle className="w-4 h-4 text-gray-200 flex-shrink-0" />
                  }
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}