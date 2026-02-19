import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CalendarDays, CheckCircle2, Wand2 } from "lucide-react";
import { addDays, addWeeks, format, parseISO, getDay } from "date-fns";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function detectConflicts(newShifts, existingShifts) {
  const conflicts = [];
  for (const ns of newShifts) {
    if (!ns.employee_id) continue;
    const clash = existingShifts.find(
      s => s.employee_id === ns.employee_id && s.date === ns.date &&
        s.status !== "cancelled" &&
        ns.start_time < s.end_time && ns.end_time > ns.start_time
    );
    if (clash) conflicts.push({ date: ns.date, with: clash.start_time + "–" + clash.end_time + " @ " + (clash.location_name || "") });
  }
  return conflicts;
}

export default function RecurringShiftDialog({ open, onOpenChange, employees, locations, allShifts, templates, onSave }) {
  const [form, setForm] = useState({
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    start_time: "09:00",
    end_time: "17:00",
    employee_id: "",
    location_id: "",
    frequency: "weekly",  // weekly | biweekly
    days_of_week: [],
    notes: "",
    status: "scheduled",
  });
  const [saving, setSaving] = useState(false);

  const applyTemplate = (tid) => {
    const t = templates.find(t => t.id === tid);
    if (!t) return;
    setForm(f => ({
      ...f,
      start_time: t.start_time || f.start_time,
      end_time: t.end_time || f.end_time,
      location_id: t.location_id || f.location_id,
      days_of_week: t.days_of_week?.length ? t.days_of_week : f.days_of_week,
    }));
  };

  // Generate preview of all shifts
  const generatedShifts = useMemo(() => {
    if (!form.start_date || !form.end_date || form.days_of_week.length === 0) return [];
    const result = [];
    let cursor = parseISO(form.start_date);
    const end = parseISO(form.end_date);
    let weekCount = 0;
    const seenWeeks = new Set();

    while (cursor <= end) {
      const dayOfWeek = getDay(cursor);
      const weekKey = format(cursor, "yyyy-'W'ww");

      if (form.days_of_week.includes(dayOfWeek)) {
        const shouldAdd = form.frequency === "weekly" ||
          (form.frequency === "biweekly" && !seenWeeks.has(weekKey));

        if (shouldAdd) {
          const emp = employees.find(e => e.id === form.employee_id);
          const loc = locations.find(l => l.id === form.location_id);
          result.push({
            date: format(cursor, "yyyy-MM-dd"),
            start_time: form.start_time,
            end_time: form.end_time,
            employee_id: form.employee_id,
            employee_name: emp ? `${emp.first_name} ${emp.last_name}` : "",
            location_id: form.location_id,
            location_name: loc ? loc.name : "",
            color: emp?.color || loc?.color || "",
            status: form.status,
            notes: form.notes,
          });
          if (form.frequency === "biweekly") seenWeeks.add(weekKey);
        }
      }
      cursor = addDays(cursor, 1);
      if (result.length > 200) break; // safety cap
    }
    return result;
  }, [form, employees, locations]);

  const conflicts = useMemo(() => detectConflicts(generatedShifts, allShifts), [generatedShifts, allShifts]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(generatedShifts);
    setSaving(false);
  };

  const toggleDay = (d) => {
    setForm(f => ({
      ...f,
      days_of_week: f.days_of_week.includes(d) ? f.days_of_week.filter(x => x !== d) : [...f.days_of_week, d],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Create Recurring Shifts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Template */}
          {templates.length > 0 && (
            <div>
              <Label className="text-xs">Load from Template</Label>
              <Select onValueChange={applyTemplate}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a template…" /></SelectTrigger>
                <SelectContent>
                  {templates.filter(t => t.active !== false).map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.start_time}–{t.end_time})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Start Time</Label>
              <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} /></div>
            <div><Label className="text-xs">End Time</Label>
              <Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} /></div>
          </div>

          {/* Location & Employee */}
          <div>
            <Label className="text-xs">Location</Label>
            <Select value={form.location_id} onValueChange={v => setForm(f => ({ ...f, location_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Employee</Label>
            <Select value={form.employee_id} onValueChange={v => setForm(f => ({ ...f, employee_id: v === "__open__" ? "" : v }))}>
              <SelectTrigger><SelectValue placeholder="Open shift (no employee)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__open__">— Open Shift —</SelectItem>
                {employees.filter(e => e.status === "active").map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recurrence */}
          <div>
            <Label className="text-xs">Frequency</Label>
            <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Every Week</SelectItem>
                <SelectItem value="biweekly">Every Two Weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Days of Week</Label>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {DAY_NAMES.map((d, i) => (
                <button key={i} onClick={() => toggleDay(i)}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                    form.days_of_week.includes(i) ? "bg-[#1a9c5b] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>{d}</button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Start Date</Label>
              <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
            <div><Label className="text-xs">End Date</Label>
              <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
          </div>

          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes for all shifts…" rows={2} />
          </div>

          {/* Preview */}
          {generatedShifts.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="inline w-3.5 h-3.5 text-green-500 mr-1" />
                  {generatedShifts.length} shifts will be created
                </p>
                {conflicts.length > 0 && (
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs gap-1">
                    <AlertTriangle className="w-3 h-3" /> {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              {conflicts.length > 0 && (
                <div className="mb-2 space-y-1">
                  {conflicts.map((c, i) => (
                    <p key={i} className="text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded-lg">
                      ⚠ {c.date}: overlaps with {c.with}
                    </p>
                  ))}
                </div>
              )}
              <div className="max-h-32 overflow-y-auto space-y-0.5">
                {generatedShifts.slice(0, 30).map((s, i) => (
                  <p key={i} className="text-xs text-slate-600">{s.date} {s.start_time}–{s.end_time}</p>
                ))}
                {generatedShifts.length > 30 && (
                  <p className="text-xs text-slate-400">…and {generatedShifts.length - 30} more</p>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={generatedShifts.length === 0 || saving}
            onClick={handleSave}
            className={conflicts.length > 0 ? "bg-orange-500 hover:bg-orange-600" : "bg-[#1a9c5b] hover:bg-[#158a4e]"}>
            {saving ? "Creating…" : conflicts.length > 0 ? `Create Anyway (${generatedShifts.length})` : `Create ${generatedShifts.length} Shifts`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}