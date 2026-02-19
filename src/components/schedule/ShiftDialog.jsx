import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, Wand2 } from "lucide-react";

export default function ShiftDialog({
  open, onOpenChange, shift, employees, locations, shifts = [], templates = [],
  onSave, onDelete, defaultDate, defaultLocationId,
}) {
  const [form, setForm] = useState({
    date: "", start_time: "09:00", end_time: "17:00",
    employee_id: "", location_id: "", status: "scheduled", notes: "",
  });

  useEffect(() => {
    if (shift) {
      setForm({
        date: shift.date || "",
        start_time: shift.start_time || "09:00",
        end_time: shift.end_time || "17:00",
        employee_id: shift.employee_id || "",
        location_id: shift.location_id || "",
        status: shift.status || "scheduled",
        notes: shift.notes || "",
      });
    } else {
      setForm({
        date: defaultDate || "",
        start_time: "09:00",
        end_time: "17:00",
        employee_id: "",
        location_id: defaultLocationId || "",
        status: "scheduled",
        notes: "",
      });
    }
  }, [shift, defaultDate, defaultLocationId, open]);

  // Conflict detection
  const conflict = useMemo(() => {
    if (!form.employee_id || !form.date || !form.start_time || !form.end_time) return null;
    const competing = shifts.filter(
      s =>
        s.employee_id === form.employee_id &&
        s.date === form.date &&
        s.status !== "cancelled" &&
        s.id !== shift?.id
    );
    for (const s of competing) {
      if (form.start_time < s.end_time && form.end_time > s.start_time) {
        return `Conflict with ${s.start_time}–${s.end_time} at ${s.location_name || "another location"}`;
      }
    }
    return null;
  }, [form.employee_id, form.date, form.start_time, form.end_time, shifts, shift]);

  const applyTemplate = (templateId) => {
    const t = templates.find(t => t.id === templateId);
    if (!t) return;
    setForm(f => ({
      ...f,
      start_time: t.start_time || f.start_time,
      end_time: t.end_time || f.end_time,
      location_id: t.location_id || f.location_id,
      notes: t.notes || f.notes,
    }));
  };

  const handleSave = () => {
    const emp = employees.find(e => e.id === form.employee_id);
    const loc = locations.find(l => l.id === form.location_id);
    onSave({
      ...form,
      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : "",
      location_name: loc ? loc.name : "",
      color: emp?.color || loc?.color || "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{shift ? "Edit Shift" : "New Shift"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Template picker */}
          {!shift && templates.length > 0 && (
            <div>
              <Label className="text-xs">Load from Template</Label>
              <div className="flex gap-2 mt-1">
                <Select onValueChange={applyTemplate}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose a template…" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.filter(t => t.active !== false).map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.start_time}–{t.end_time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center text-slate-400">
                  <Wand2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Start Time</Label>
              <Input type="time" value={form.start_time}
                onChange={e => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">End Time</Label>
              <Input type="time" value={form.end_time}
                onChange={e => setForm({ ...form, end_time: e.target.value })} />
            </div>
          </div>

          <div>
            <Label className="text-xs">Location</Label>
            <Select value={form.location_id} onValueChange={v => setForm({ ...form, location_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>
                {locations.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Employee</Label>
            <Select value={form.employee_id} onValueChange={v => setForm({ ...form, employee_id: v === "__open__" ? "" : v })}>
              <SelectTrigger className={conflict ? "border-orange-400" : ""}>
                <SelectValue placeholder="Leave empty for open shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__open__">— Open Shift —</SelectItem>
                {employees.filter(e => e.status === "active").map(e => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.first_name} {e.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {conflict && (
              <div className="flex items-start gap-1.5 mt-1.5 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-orange-700">{conflict}</p>
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional shift notes..." rows={2} />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {shift && (
              <Button variant="ghost" size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(shift.id)}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}
              className={conflict ? "bg-orange-500 hover:bg-orange-600" : "bg-[#1a9c5b] hover:bg-[#158a4e]"}>
              {conflict ? "Save Anyway" : shift ? "Update" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}