import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle2, Circle, MapPin, Users, CalendarDays, UserPlus, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  { key: "location", icon: MapPin, label: "Add your first location", desc: "Set up the pool, beach, or facility you manage", page: "Locations", color: "text-blue-600", bg: "bg-blue-50" },
  { key: "employee", icon: Users, label: "Add your first employee", desc: "Add team members so you can assign them shifts", page: "Employees", color: "text-purple-600", bg: "bg-purple-50" },
  { key: "invite", icon: UserPlus, label: "Invite your team to log in", desc: "Send email invites so staff can access their schedules", page: "Settings", color: "text-orange-600", bg: "bg-orange-50" },
  { key: "schedule", icon: CalendarDays, label: "Create your first shift", desc: "Build a schedule and assign guards", page: "Schedule", color: "text-[#1a9c5b]", bg: "bg-[#f0faf5]" },
];

export default function QuickStartChecklist({ hasLocations, hasEmployees }) {
  const [collapsed, setCollapsed] = useState(false);

  const completed = {
    location: hasLocations,
    employee: hasEmployees,
    invite: false,
    schedule: false,
  };

  const doneCount = Object.values(completed).filter(Boolean).length;
  const allDone = doneCount === steps.length;

  if (allDone) return null;

  return (
    <Card className="border border-[#1a9c5b]/20 bg-gradient-to-br from-[#f0faf5] to-white overflow-hidden">
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a9c5b] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Get started checklist</p>
            <p className="text-xs text-gray-500">{doneCount} of {steps.length} steps complete</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {steps.map((s, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${completed[s.key] ? "bg-[#1a9c5b]" : "bg-gray-200"}`} />
            ))}
          </div>
          {collapsed ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {!collapsed && (
        <div className="px-5 pb-5 space-y-2">
          {steps.map((step) => {
            const done = completed[step.key];
            return (
              <Link key={step.key} to={createPageUrl(step.page)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${done ? "border-[#1a9c5b]/20 bg-white/60 opacity-60" : "border-gray-100 bg-white hover:border-[#1a9c5b]/30 hover:shadow-sm"}`}
              >
                <div className={`w-8 h-8 rounded-lg ${done ? "bg-[#1a9c5b]/10" : step.bg} flex items-center justify-center flex-shrink-0`}>
                  <step.icon className={`w-4 h-4 ${done ? "text-[#1a9c5b]" : step.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${done ? "line-through text-gray-400" : "text-gray-800"}`}>{step.label}</p>
                  {!done && <p className="text-xs text-gray-400 truncate">{step.desc}</p>}
                </div>
                {done
                  ? <CheckCircle2 className="w-4 h-4 text-[#1a9c5b] flex-shrink-0" />
                  : <Circle className="w-4 h-4 text-gray-200 flex-shrink-0" />
                }
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}