import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AvailabilityDialog({ open, onOpenChange, employee, availability, onSave }) {
  const [form, setForm] = useState({
    preferred_days: [],
    preferred_start: "08:00",
    preferred_end: "16:00",
    unavailable_periods: [],
    notes: "",
  });

  useEffect(() => {
    if (availability) {
      setForm({
        preferred_days: availability.preferred_days || [],
        preferred_start: availability.preferred_start || "08:00",
        preferred_end: availability.preferred_end || "16:00",
        unavailable_periods: availability.unavailable_periods || [],
        notes: availability.notes || "",
      });
    } else {
      setForm({ preferred_days: [], preferred_start: "08:00", preferred_end: "16:00", unavailable_periods: [], notes: "" });
    }
  }, [availability, open]);

  const toggleDay = (d) => {
    setForm(f => ({
      ...f,
      preferred_days: f.preferred_days.includes(d)
        ? f.preferred_days.filter(x => x !== d)
        : [...f.preferred_days, d],
    }));
  };

  const addPeriod = () => {
    setForm(f => ({
      ...f,
      unavailable_periods: [...f.unavailable_periods, { start_date: "", end_date: "", reason: "" }],
    }));
  };

  const updatePeriod = (i, field, val) => {
    const periods = [...form.unavailable_periods];
    periods[i] = { ...periods[i], [field]: val };
    setForm(f => ({ ...f, unavailable_periods: periods }));
  };

  const removePeriod = (i) => {
    setForm(f => ({ ...f, unavailable_periods: f.unavailable_periods.filter((_, idx) => idx !== i) }));
  };

  const handleSave = () => {
    onSave({
      employee_id: employee.id,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      ...form,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Availability — {employee?.first_name} {employee?.last_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Preferred days */}
          <div>
            <Label className="text-xs font-semibold text-slate-700">Preferred Working Days</Label>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {DAY_NAMES.map((d, i) => (
                <button key={i} onClick={() => toggleDay(i)}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                    form.preferred_days.includes(i)
                      ? "bg-[#1a9c5b] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred hours */}
          <div>
            <Label className="text-xs font-semibold text-slate-700">Preferred Working Hours</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <Label className="text-xs text-slate-500">From</Label>
                <Input type="time" value={form.preferred_start}
                  onChange={e => setForm(f => ({ ...f, preferred_start: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs text-slate-500">To</Label>
                <Input type="time" value={form.preferred_end}
                  onChange={e => setForm(f => ({ ...f, preferred_end: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Unavailability periods */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-semibold text-slate-700">Unavailability Periods</Label>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-[#1a9c5b]" onClick={addPeriod}>
                <Plus className="w-3 h-3 mr-1" /> Add Period
              </Button>
            </div>
            {form.unavailable_periods.length === 0 && (
              <p className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3">No unavailability periods set.</p>
            )}
            <div className="space-y-3">
              {form.unavailable_periods.map((p, i) => (
                <div key={i} className="p-3 bg-orange-50 border border-orange-100 rounded-xl space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-slate-500">Start Date</Label>
                      <Input type="date" value={p.start_date}
                        onChange={e => updatePeriod(i, "start_date", e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">End Date</Label>
                      <Input type="date" value={p.end_date}
                        onChange={e => updatePeriod(i, "end_date", e.target.value)} className="h-8 text-xs" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Reason (e.g. Vacation)" value={p.reason}
                      onChange={e => updatePeriod(i, "reason", e.target.value)} className="h-8 text-xs flex-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-50" onClick={() => removePeriod(i)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700">Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any additional availability notes..." rows={2} className="mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={handleSave}>Save Availability</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}