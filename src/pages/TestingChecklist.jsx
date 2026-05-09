import React, { useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, ClipboardList } from "lucide-react";

const CHECKLIST = [
  {
    category: "Authentication & Access",
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    items: [
      { id: "auth-1", text: "Log in with an admin account and verify redirect to OperationsCommandDashboard" },
      { id: "auth-2", text: "Log in with a regular (guard) account and verify redirect to Dashboard / guard view" },
      { id: "auth-3", text: "Log out and verify redirect to Home / login page" },
      { id: "auth-4", text: "Access an admin-only page (e.g. /Alerts) as a non-admin and verify Access Denied message" },
    ],
  },
  {
    category: "Scheduling",
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    items: [
      { id: "sched-1", text: "Open Schedule page — verify weekly/daily views load without errors" },
      { id: "sched-2", text: "Create a new shift — select employee, location, time, save" },
      { id: "sched-3", text: "Edit an existing shift — change time, verify update persists" },
      { id: "sched-4", text: "Delete a shift — confirm it disappears from the calendar" },
      { id: "sched-5", text: "Open AutoShiftPlanner — add slots, click Auto-Assign, verify result banner" },
      { id: "sched-6", text: "Open AI Shift Recommendations page — select location, generate recommendations, drag employee onto a slot, publish" },
      { id: "sched-7", text: "Open ShiftSwaps — create a swap request as guard, approve as manager" },
    ],
  },
  {
    category: "Compliance",
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
    items: [
      { id: "comp-1", text: "Open ComplianceDashboard — verify scores and module cards load" },
      { id: "comp-2", text: "Open Chemical Logs — add a new reading, verify it appears in list" },
      { id: "comp-3", text: "Open Inspections — create an inspection report" },
      { id: "comp-4", text: "Open Certifications — verify expiring certs are highlighted correctly" },
      { id: "comp-5", text: "Open Maintenance Reports — create a maintenance item, change status" },
    ],
  },
  {
    category: "Incidents",
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-600",
    items: [
      { id: "inc-1", text: "Open IncidentLogs — verify list loads and stats are correct" },
      { id: "inc-2", text: "Click 'Log Incident' — fill out form, submit, verify it appears in list" },
      { id: "inc-3", text: "Filter incidents by type (rescue, injury, etc.) — verify filter works" },
      { id: "inc-4", text: "Click an incident to open detail drawer — verify all fields visible" },
      { id: "inc-5", text: "Change an incident status to 'reviewed' or 'closed'" },
    ],
  },
  {
    category: "Employees & Onboarding",
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    items: [
      { id: "emp-1", text: "Open Employees — verify grid loads with skeletons during load, then data appears" },
      { id: "emp-2", text: "Search for an employee by name" },
      { id: "emp-3", text: "Add a new employee — fill required fields, save" },
      { id: "emp-4", text: "Open OnboardingProgressTracker — verify employees list with progress bars" },
      { id: "emp-5", text: "For an employee with no tasks, click 'Generate Tasks' — verify tasks are created" },
      { id: "emp-6", text: "Expand an employee — verify Tasks, Training, Certifications tabs" },
      { id: "emp-7", text: "Mark an onboarding task as complete — verify progress bar updates" },
    ],
  },
  {
    category: "Global Search",
    color: "bg-indigo-50 border-indigo-200",
    iconColor: "text-indigo-600",
    items: [
      { id: "srch-1", text: "Press '/' key from any page — verify search bar focuses automatically" },
      { id: "srch-2", text: "Type an employee name — verify result appears under Employees" },
      { id: "srch-3", text: "Type a location name — verify result appears under Locations" },
      { id: "srch-4", text: "Click a result — verify navigation to correct page" },
      { id: "srch-5", text: "Press Escape — verify search closes and query clears" },
      { id: "srch-6", text: "Filter results by category (e.g. Shifts only) using category pills" },
    ],
  },
  {
    category: "Mobile Experience",
    color: "bg-teal-50 border-teal-200",
    iconColor: "text-teal-600",
    items: [
      { id: "mob-1", text: "Open app on mobile (or dev tools responsive mode, width < 768px)" },
      { id: "mob-2", text: "Open MobileGuardDashboard — verify layout, clock-in/out tabs" },
      { id: "mob-3", text: "Disable network in DevTools — verify yellow offline banner appears" },
      { id: "mob-4", text: "Re-enable network — verify 'Back online!' banner appears, queued items sync" },
      { id: "mob-5", text: "Pull down on MobileSchedule — verify pull-to-refresh spinner and data reloads" },
      { id: "mob-6", text: "Log an incident from mobile log tab while offline — verify it queues" },
      { id: "mob-7", text: "Reconnect — verify queued incident syncs automatically" },
      { id: "mob-8", text: "Open MobileCertifications — verify cert list and expiry badges load" },
    ],
  },
  {
    category: "Loading Skeletons",
    color: "bg-gray-50 border-gray-200",
    iconColor: "text-gray-600",
    items: [
      { id: "skel-1", text: "Throttle network in DevTools (Slow 3G) — open Employees and verify skeleton grid appears" },
      { id: "skel-2", text: "Throttle network — open ComplianceDashboard and verify skeleton cards appear" },
      { id: "skel-3", text: "Throttle network — open IncidentLogs and verify skeleton rows appear" },
      { id: "skel-4", text: "Throttle network — open AdminMetricsDashboard and verify skeleton appears" },
      { id: "skel-5", text: "Verify no layout shift (CLS) once data loads — content should slot in cleanly" },
    ],
  },
  {
    category: "Alerts & Notifications",
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-600",
    items: [
      { id: "alert-1", text: "Open Alerts page — verify unresolved alerts list loads" },
      { id: "alert-2", text: "Click 'Run Scan' — verify scan runs and new alerts appear" },
      { id: "alert-3", text: "Resolve an alert — verify it moves to Resolved tab" },
      { id: "alert-4", text: "Click 'Resolve All' — verify all unresolved alerts are cleared" },
    ],
  },
  {
    category: "Billing & Subscription",
    color: "bg-pink-50 border-pink-200",
    iconColor: "text-pink-600",
    items: [
      { id: "bill-1", text: "Open Pricing page — verify all 3 plan cards and pricing load" },
      { id: "bill-2", text: "Test annual/monthly toggle — prices should update" },
      { id: "bill-3", text: "Click 'Start Free Trial' outside of iframe — verify Stripe checkout opens" },
      { id: "bill-4", text: "Test inside iframe (preview mode) — verify checkout is blocked with clear message" },
    ],
  },
];

export default function TestingChecklist() {
  const [checked, setChecked] = useState({});
  const [expanded, setExpanded] = useState(() => CHECKLIST.reduce((a, c) => ({ ...a, [c.category]: true }), {}));

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSection = (cat) => setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));

  const total = CHECKLIST.flatMap(c => c.items).length;
  const done = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-[#1a9c5b]" />
              Testing Checklist
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Verify all key features after deploying updates. Check off each item as you test.
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-extrabold text-gray-900">{done}/{total}</div>
            <div className="text-xs text-gray-400">{pct}% complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1a9c5b] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Reset */}
        {done > 0 && (
          <div className="flex justify-end">
            <button
              onClick={() => setChecked({})}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Categories */}
        {CHECKLIST.map((section) => {
          const sectionDone = section.items.filter(i => checked[i.id]).length;
          const isExpanded = expanded[section.category];
          return (
            <div key={section.category} className={`rounded-xl border ${section.color} overflow-hidden`}>
              <button
                onClick={() => toggleSection(section.category)}
                className="w-full flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className={`w-4 h-4 ${section.iconColor}`} /> : <ChevronRight className={`w-4 h-4 ${section.iconColor}`} />}
                  <span className="font-bold text-gray-900">{section.category}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sectionDone === section.items.length ? "bg-green-100 text-green-700" : "bg-white/60 text-gray-600"}`}>
                  {sectionDone}/{section.items.length}
                </span>
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 space-y-2.5 bg-white/50">
                  {section.items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <button
                        onClick={() => toggle(item.id)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {checked[item.id] ? (
                          <CheckCircle2 className={`w-5 h-5 ${section.iconColor}`} />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                        )}
                      </button>
                      <span
                        className={`text-sm leading-relaxed ${checked[item.id] ? "line-through text-gray-400" : "text-gray-700"}`}
                      >
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {pct === 100 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-xl font-bold text-gray-900">All checks passed!</p>
            <p className="text-gray-500 text-sm">Your app is production-ready.</p>
          </div>
        )}
      </div>
    </div>
  );
}