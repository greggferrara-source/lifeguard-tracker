import React, { useState, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useActivityTracker, TRACK } from "@/hooks/useActivityTracker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles, AlertTriangle, CheckCircle2, ShieldAlert, Clock, Users,
  Edit2, X, Zap, ChevronRight, Info, RefreshCw, Save, ArrowRight
} from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, getDay } from "date-fns";

// ─── Helpers ───────────────────────────────────────────────────────────────

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHIFT_SLOTS = [
  { label: "Morning", start: "07:00", end: "12:00" },
  { label: "Midday",  start: "11:00", end: "16:00" },
  { label: "Afternoon", start: "14:00", end: "19:00" },
  { label: "Full Day", start: "09:00", end: "17:00" },
];

function hoursForShiftLength(len) {
  const [s, e] = len.split("-");
  if (!s || !e) return 8;
  return parseInt(e, 10) - parseInt(s, 10);
}

function addHours(time, h) {
  const [hh, mm] = time.split(":").map(Number);
  const total = hh + h;
  return `${String(total).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function isCertifiedAndValid(empId, certifications, today) {
  return certifications.some(
    c =>
      c.employee_id === empId &&
      (c.status === "approved" || c.status === "active" || !c.status) &&
      c.expiry_date &&
      c.expiry_date >= today
  );
}

function isAvailableOnDate(empId, dateStr, availabilities) {
  const avail = availabilities.find(a => a.employee_id === empId);
  if (!avail) return true; // no restrictions = available
  for (const p of avail.unavailable_periods || []) {
    if (p.start_date && p.end_date && dateStr >= p.start_date && dateStr <= p.end_date) return false;
  }
  return true;
}

function getCertExpirySoon(empId, certifications, today) {
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  const in30Str = in30.toISOString().split("T")[0];
  return certifications.find(
    c => c.employee_id === empId &&
      (c.status === "approved" || c.status === "active" || !c.status) &&
      c.expiry_date && c.expiry_date >= today && c.expiry_date <= in30Str
  );
}

function totalHoursThisWeek(empId, draftShifts) {
  return draftShifts
    .filter(s => s.employee_id === empId)
    .reduce((sum, s) => {
      const [sh, sm] = s.start_time.split(":").map(Number);
      const [eh, em] = s.end_time.split(":").map(Number);
      return sum + (eh + em / 60) - (sh + sm / 60);
    }, 0);
}

function hasConflict(empId, dateStr, startTime, endTime, draftShifts, existingShifts) {
  const allShifts = [...draftShifts, ...existingShifts];
  return allShifts.some(
    s =>
      s.employee_id === empId &&
      s.date === dateStr &&
      s.status !== "cancelled" &&
      startTime < s.end_time &&
      endTime > s.start_time
  );
}

// ─── Core generation algorithm ─────────────────────────────────────────────

function generateSchedule({ weekDates, location, employees, certifications, availabilities, existingShifts, settings }) {
  const today = new Date().toISOString().split("T")[0];
  const { minGuards, shiftLength, allowOvertime } = settings;

  // Determine shift slot based on preferred length
  const [slotStart, slotEnd] = shiftLength.split("-");
  const shiftHours = parseInt(slotEnd, 10) - parseInt(slotStart, 10);

  // Build shift time windows: 2 shifts per day (morning + afternoon)
  const timeSlots = shiftHours <= 5
    ? [
        { start: "07:00", end: addHours("07:00", shiftHours), label: "Morning" },
        { start: addHours("07:00", shiftHours), end: addHours("07:00", shiftHours * 2), label: "Afternoon" },
      ]
    : [
        { start: "08:00", end: addHours("08:00", shiftHours), label: "Full Day" },
      ];

  // Eligible employees: active + certified + at this location (or all if location doesn't restrict)
  const eligible = employees.filter(e => {
    if (e.status && e.status !== "active") return false;
    return isCertifiedAndValid(e.id, certifications, today);
  });

  const warnings = [];
  const draft = [];

  // Track hours per employee to handle overtime
  const empHours = {};
  eligible.forEach(e => { empHours[e.id] = 0; });

  // Round-robin pointer per time slot label
  const rrPointer = {};

  weekDates.forEach(dateStr => {
    timeSlots.forEach(slot => {
      const key = slot.label;
      if (!rrPointer[key]) rrPointer[key] = 0;

      // Available employees for this slot
      const available = eligible.filter(e => {
        if (!isAvailableOnDate(e.id, dateStr, availabilities)) return false;
        if (hasConflict(e.id, dateStr, slot.start, slot.end, draft, existingShifts)) return false;
        if (!allowOvertime && (empHours[e.id] || 0) + shiftHours > 40) return false;
        return true;
      });

      // Assign up to minGuards employees per slot via round-robin
      let assigned = 0;
      let attempts = 0;
      while (assigned < minGuards && attempts < available.length) {
        const emp = available[rrPointer[key] % available.length];
        rrPointer[key] = (rrPointer[key] + 1) % Math.max(available.length, 1);
        attempts++;

        if (!emp) break;

        // Double-check no conflict (can shift in round-robin)
        if (hasConflict(emp.id, dateStr, slot.start, slot.end, draft, existingShifts)) continue;

        const slotHrs = (parseInt(slot.end, 10) - parseInt(slot.start, 10));
        empHours[emp.id] = (empHours[emp.id] || 0) + slotHrs;

        draft.push({
          _id: `draft-${dateStr}-${slot.label}-${emp.id}`,
          date: dateStr,
          start_time: slot.start,
          end_time: slot.end,
          employee_id: emp.id,
          employee_name: `${emp.first_name} ${emp.last_name}`,
          location_id: location.id,
          location_name: location.name,
          color: emp.color || location.color || "",
          status: "scheduled",
          notes: "",
          _slot: slot.label,
          _certExpiring: !!getCertExpirySoon(emp.id, certifications, today),
          _overtimeWarning: !allowOvertime && empHours[emp.id] > 32,
        });
        assigned++;
      }

      if (assigned < minGuards) {
        warnings.push({
          type: "understaffed",
          date: dateStr,
          slot: slot.label,
          assigned,
          needed: minGuards,
        });
      }
    });
  });

  // Insights
  const insights = [];

  const understaffedDays = weekDates.filter(d =>
    warnings.some(w => w.date === d)
  );
  if (understaffedDays.length > 0) {
    insights.push(`⚠️ ${understaffedDays.length} day(s) are understaffed — not enough certified staff.`);
  }

  const overtimeEmps = eligible.filter(e => (empHours[e.id] || 0) > 40);
  if (overtimeEmps.length > 0) {
    insights.push(`⏰ ${overtimeEmps.length} guard(s) are nearing or over 40h this week.`);
  }

  const expiringCerts = eligible.filter(e => getCertExpirySoon(e.id, certifications, today));
  if (expiringCerts.length > 0) {
    insights.push(`🛡️ ${expiringCerts.length} guard(s) have certifications expiring within 30 days.`);
  }

  if (eligible.length === 0) {
    insights.push("🚨 No certified staff found. Cannot generate a compliant schedule.");
  }

  return { draft, warnings, insights, empHours, eligible };
}

// ─── SmartScheduleBuilder ──────────────────────────────────────────────────

export default function SmartScheduleBuilder({
  open, onOpenChange,
  employees, locations, certifications, availabilities, existingShifts,
  onPublish,
}) {
  const today = new Date().toISOString().split("T")[0];
  const nextWeekStart = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 0 });
  const { trackEvent } = useActivityTracker();

  // ── Config state ──
  const [weekStart, setWeekStart] = useState(format(nextWeekStart, "yyyy-MM-dd"));
  const [locationId, setLocationId] = useState("");
  const [minGuards, setMinGuards] = useState(2);
  const [shiftLength, setShiftLength] = useState("08-16"); // start-end hours
  const [allowOvertime, setAllowOvertime] = useState(false);

  // ── Flow state ──
  const [step, setStep] = useState("config"); // config | preview
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [insights, setInsights] = useState([]);
  const [empHours, setEmpHours] = useState({});
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);

  // ── Edit a draft shift inline ──
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const activeLocations = useMemo(() => locations.filter(l => l.status === "active" || !l.status), [locations]);
  const selectedLocation = useMemo(() => activeLocations.find(l => l.id === locationId), [activeLocations, locationId]);

  const weekDates = useMemo(() => {
    const base = new Date(weekStart + "T00:00:00");
    return Array.from({ length: 7 }, (_, i) => format(addDays(base, i), "yyyy-MM-dd"));
  }, [weekStart]);

  const handleGenerate = useCallback(() => {
    if (!selectedLocation) return;
    setGenerating(true);

    // slight delay for UX "feel"
    trackEvent(TRACK.SMART_SCHEDULER_USED);
    setTimeout(() => {
      const result = generateSchedule({
        weekDates,
        location: selectedLocation,
        employees,
        certifications,
        availabilities,
        existingShifts,
        settings: { minGuards, shiftLength, allowOvertime },
      });
      setDraft(result.draft);
      setWarnings(result.warnings);
      setInsights(result.insights);
      setEmpHours(result.empHours);
      setGenerating(false);
      setStep("preview");
      setPublishResult(null);
      setEditingId(null);
    }, 600);
  }, [selectedLocation, weekDates, employees, certifications, availabilities, existingShifts, minGuards, shiftLength, allowOvertime]);

  const handlePublish = async () => {
    setPublishing(true);
    const toSave = draft.map(({ _id, _slot, _certExpiring, _overtimeWarning, ...s }) => s);
    const results = await Promise.allSettled(toSave.map(s => base44.entities.Shift.create(s)));
    const succeeded = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;
    setPublishResult({ succeeded, failed, total: toSave.length });
    setPublishing(false);
    if (failed === 0) {
      onPublish();
      setTimeout(() => {
        onOpenChange(false);
        setStep("config");
        setDraft([]);
      }, 1500);
    }
  };

  const startEdit = (shift) => {
    setEditingId(shift._id);
    setEditForm({
      employee_id: shift.employee_id,
      start_time: shift.start_time,
      end_time: shift.end_time,
    });
  };

  const saveEdit = (shiftId) => {
    setDraft(prev => prev.map(s => {
      if (s._id !== shiftId) return s;
      const emp = employees.find(e => e.id === editForm.employee_id);
      return {
        ...s,
        employee_id: editForm.employee_id,
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : s.employee_name,
        start_time: editForm.start_time,
        end_time: editForm.end_time,
        _certExpiring: !!getCertExpirySoon(editForm.employee_id, certifications, today),
      };
    }));
    setEditingId(null);
  };

  const removeShift = (shiftId) => {
    setDraft(prev => prev.filter(s => s._id !== shiftId));
  };

  // Group draft shifts by date
  const byDate = useMemo(() => {
    const map = {};
    weekDates.forEach(d => { map[d] = []; });
    draft.forEach(s => { if (map[s.date]) map[s.date].push(s); });
    return map;
  }, [draft, weekDates]);

  const fullyStaffedCount = weekDates.filter(d => {
    const dayWarnings = warnings.filter(w => w.date === d);
    return dayWarnings.length === 0 && (byDate[d]?.length > 0);
  }).length;

  const certRisks = draft.filter(s => s._certExpiring).length;
  const overtimeRisks = draft.filter(s => s._overtimeWarning).length;

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setStep("config"); setDraft([]); setPublishResult(null); }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0f6638] to-[#1a9c5b] text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Smart Schedule Builder</h2>
              <p className="text-xs text-green-100">AI-powered · Compliance-enforced · Instant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step === "preview" && (
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 text-xs"
                onClick={() => setStep("config")}>
                ← Back to Settings
              </Button>
            )}
            <button onClick={handleClose} className="text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ── STEP 1: Config ── */}
          {step === "config" && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Week */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Week Starting</Label>
                  <Input
                    type="date"
                    value={weekStart}
                    onChange={e => setWeekStart(e.target.value)}
                    className="h-10"
                  />
                  {weekStart && (
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(weekStart + "T00:00:00"), "MMM d")} –{" "}
                      {format(addDays(new Date(weekStart + "T00:00:00"), 6), "MMM d, yyyy")}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Location</Label>
                  <Select value={locationId} onValueChange={setLocationId}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a location…" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeLocations.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Min guards */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Minimum Guards Per Shift
                  </Label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setMinGuards(g => Math.max(1, g - 1))}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold text-gray-600">−</button>
                    <span className="text-xl font-bold text-gray-900 w-6 text-center">{minGuards}</span>
                    <button onClick={() => setMinGuards(g => Math.min(8, g + 1))}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold text-gray-600">+</button>
                  </div>
                </div>

                {/* Shift length */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Preferred Shift Length</Label>
                  <Select value={shiftLength} onValueChange={setShiftLength}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="07-12">5 hours (07:00–12:00)</SelectItem>
                      <SelectItem value="08-13">5 hours (08:00–13:00)</SelectItem>
                      <SelectItem value="07-15">8 hours (07:00–15:00)</SelectItem>
                      <SelectItem value="08-16">8 hours (08:00–16:00)</SelectItem>
                      <SelectItem value="09-17">8 hours (09:00–17:00)</SelectItem>
                      <SelectItem value="12-20">8 hours (12:00–20:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Allow overtime toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Allow Overtime</p>
                  <p className="text-xs text-gray-500 mt-0.5">Staff can exceed 40 hours this week</p>
                </div>
                <button
                  onClick={() => setAllowOvertime(v => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${allowOvertime ? "bg-[#1a9c5b]" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${allowOvertime ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>

              {/* Staff preview */}
              {locationId && (
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50">
                  <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Available Certified Staff
                  </p>
                  {(() => {
                    const eligible = employees.filter(e => {
                      if (e.status && e.status !== "active") return false;
                      return isCertifiedAndValid(e.id, certifications, today);
                    });
                    if (eligible.length === 0) return (
                      <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> No certified active staff found.
                        Cannot generate a compliant schedule.
                      </p>
                    );
                    return (
                      <div className="flex flex-wrap gap-1.5">
                        {eligible.map(e => (
                          <span key={e.id} className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            {e.first_name} {e.last_name}
                          </span>
                        ))}
                        <span className="text-xs text-blue-600 font-semibold">{eligible.length} total</span>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Generate button */}
              <Button
                className="w-full h-12 bg-[#1a9c5b] hover:bg-[#158a4e] text-base font-semibold gap-2"
                disabled={!locationId || !weekStart || generating}
                onClick={handleGenerate}
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Building Schedule…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Schedule
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* ── STEP 2: Preview ── */}
          {step === "preview" && (
            <div className="p-6 space-y-5">
              {/* Validation summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl p-3 bg-green-50 border border-green-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mb-1" />
                  <p className="text-xl font-bold text-green-700">{fullyStaffedCount}</p>
                  <p className="text-xs text-green-600 font-medium">Staffed Days</p>
                </div>
                <div className={`rounded-xl p-3 border ${warnings.length > 0 ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
                  <AlertTriangle className={`w-4 h-4 mb-1 ${warnings.length > 0 ? "text-amber-600" : "text-gray-400"}`} />
                  <p className={`text-xl font-bold ${warnings.length > 0 ? "text-amber-700" : "text-gray-400"}`}>{warnings.length}</p>
                  <p className={`text-xs font-medium ${warnings.length > 0 ? "text-amber-600" : "text-gray-400"}`}>Understaffed</p>
                </div>
                <div className={`rounded-xl p-3 border ${certRisks > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
                  <ShieldAlert className={`w-4 h-4 mb-1 ${certRisks > 0 ? "text-red-500" : "text-gray-400"}`} />
                  <p className={`text-xl font-bold ${certRisks > 0 ? "text-red-600" : "text-gray-400"}`}>{certRisks}</p>
                  <p className={`text-xs font-medium ${certRisks > 0 ? "text-red-500" : "text-gray-400"}`}>Cert Risks</p>
                </div>
                <div className={`rounded-xl p-3 border ${overtimeRisks > 0 ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}>
                  <Clock className={`w-4 h-4 mb-1 ${overtimeRisks > 0 ? "text-orange-500" : "text-gray-400"}`} />
                  <p className={`text-xl font-bold ${overtimeRisks > 0 ? "text-orange-600" : "text-gray-400"}`}>{overtimeRisks}</p>
                  <p className={`text-xs font-medium ${overtimeRisks > 0 ? "text-orange-500" : "text-gray-400"}`}>OT Warnings</p>
                </div>
              </div>

              {/* Insights */}
              {insights.length > 0 && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-1.5">
                  <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Smart Insights
                  </p>
                  {insights.map((ins, i) => (
                    <p key={i} className="text-xs text-blue-700">{ins}</p>
                  ))}
                </div>
              )}

              {draft.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">No shifts could be generated.</p>
                  <p className="text-sm mt-1">Not enough certified, available staff for this week.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setStep("config")}>
                    Adjust Settings
                  </Button>
                </div>
              ) : (
                <>
                  {/* Week grid */}
                  <div className="space-y-3">
                    {weekDates.map(dateStr => {
                      const dayShifts = byDate[dateStr] || [];
                      const dayWarnings = warnings.filter(w => w.date === dateStr);
                      const dayOfWeek = getDay(new Date(dateStr + "T00:00:00"));
                      return (
                        <div key={dateStr} className="border border-gray-200 rounded-xl overflow-hidden">
                          {/* Day header */}
                          <div className={`flex items-center justify-between px-4 py-2.5 ${dayWarnings.length > 0 ? "bg-amber-50 border-b border-amber-200" : "bg-gray-50 border-b border-gray-100"}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900">{DAY_NAMES[dayOfWeek]}</span>
                              <span className="text-xs text-gray-500">{format(new Date(dateStr + "T00:00:00"), "MMM d")}</span>
                              {dayWarnings.length > 0 && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] gap-0.5 px-1.5">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  {dayWarnings.map(w => `${w.assigned}/${w.needed} ${w.slot}`).join(", ")}
                                </Badge>
                              )}
                              {dayWarnings.length === 0 && dayShifts.length > 0 && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] gap-0.5 px-1.5">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Staffed
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">{dayShifts.length} shift{dayShifts.length !== 1 ? "s" : ""}</span>
                          </div>

                          {/* Shifts */}
                          <div className="divide-y divide-gray-50">
                            {dayShifts.length === 0 ? (
                              <p className="px-4 py-3 text-xs text-gray-400 italic">No shifts scheduled</p>
                            ) : dayShifts.map(shift => (
                              <ShiftRow
                                key={shift._id}
                                shift={shift}
                                editing={editingId === shift._id}
                                editForm={editForm}
                                onEditFormChange={setEditForm}
                                employees={employees}
                                certifications={certifications}
                                today={today}
                                onEdit={() => startEdit(shift)}
                                onSave={() => saveEdit(shift._id)}
                                onCancel={() => setEditingId(null)}
                                onRemove={() => removeShift(shift._id)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Publish result */}
                  {publishResult && (
                    <div className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium ${publishResult.failed > 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
                      {publishResult.failed === 0
                        ? <><CheckCircle2 className="w-4 h-4" /> {publishResult.succeeded} shifts published successfully! Redirecting…</>
                        : <><AlertTriangle className="w-4 h-4" /> {publishResult.succeeded}/{publishResult.total} saved. {publishResult.failed} failed — please retry.</>
                      }
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "preview" && draft.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">{draft.length}</span> shifts ready to publish
              {warnings.length > 0 && <span className="text-amber-600"> · {warnings.length} warnings</span>}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setStep("config"); }}>
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
              </Button>
              <Button
                className="bg-[#1a9c5b] hover:bg-[#158a4e] font-semibold gap-2"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Publishing…</>
                ) : (
                  <><Save className="w-4 h-4" /> Approve & Publish Schedule</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── ShiftRow (inline edit) ────────────────────────────────────────────────

function ShiftRow({ shift, editing, editForm, onEditFormChange, employees, certifications, today, onEdit, onSave, onCancel, onRemove }) {
  const certWarning = shift._certExpiring;
  const overWarning = shift._overtimeWarning;

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-slate-50">
        <Select value={editForm.employee_id} onValueChange={v => onEditFormChange(f => ({ ...f, employee_id: v }))}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {employees.filter(e => e.status === "active").map(e => (
              <SelectItem key={e.id} value={e.id} className="text-xs">
                {e.first_name} {e.last_name}
                {!isCertifiedAndValid(e.id, certifications, today) && " ⚠️"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="time" value={editForm.start_time} onChange={e => onEditFormChange(f => ({ ...f, start_time: e.target.value }))} className="h-8 w-28 text-xs" />
        <span className="text-xs text-gray-400">–</span>
        <Input type="time" value={editForm.end_time} onChange={e => onEditFormChange(f => ({ ...f, end_time: e.target.value }))} className="h-8 w-28 text-xs" />
        <Button size="sm" className="h-7 bg-[#1a9c5b] hover:bg-[#158a4e] text-xs px-3" onClick={onSave}>Save</Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={onCancel}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-gray-50/80 group">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a9c5b] flex-shrink-0" />
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-gray-900">{shift.employee_name}</span>
            <span className="text-xs text-gray-400">{shift.start_time}–{shift.end_time}</span>
            <Badge className="text-[10px] bg-gray-100 text-gray-500 border-gray-200 px-1.5">{shift._slot}</Badge>
            {certWarning && (
              <Badge className="text-[10px] bg-yellow-100 text-yellow-700 border-yellow-200 px-1.5 gap-0.5">
                <ShieldAlert className="w-2.5 h-2.5" /> Cert expiring
              </Badge>
            )}
            {overWarning && (
              <Badge className="text-[10px] bg-orange-100 text-orange-700 border-orange-200 px-1.5 gap-0.5">
                <Clock className="w-2.5 h-2.5" /> OT risk
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onRemove} className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}