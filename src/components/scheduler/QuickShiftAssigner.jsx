import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from "lucide-react";

export default function QuickShiftAssigner({ open, onOpenChange, location, date, employees, existingShifts, onSave }) {
  const [form, setForm] = useState({
    employee_id: "",
    start_time: "08:00",
    end_time: "16:00",
    status: "scheduled"
  });
  const [saving, setSaving] = useState(false);

  const locationShifts = existingShifts.filter(s => s.location_id === location?.id && s.date === date);
  const assignedEmployeeIds = locationShifts.map(s => s.employee_id).filter(Boolean);

  const availableEmployees = employees.filter(e => {
    if (assignedEmployeeIds.includes(e.id)) return false;
    const preferred = !e.location_id || e.location_id === location?.id;
    return preferred;
  });

  const handleSave = async () => {
    if (!form.employee_id) return;
    setSaving(true);
    await onSave({
      employee_id: form.employee_id,
      location_id: location.id,
      location_name: location.name,
      date,
      start_time: form.start_time,
      end_time: form.end_time,
      status: form.status,
      employee_name: employees.find(e => e.id === form.employee_id)
        ? `${employees.find(e => e.id === form.employee_id).first_name} ${employees.find(e => e.id === form.employee_id).last_name}`
        : ""
    });
    setForm({ employee_id: "", start_time: "08:00", end_time: "16:00", status: "scheduled" });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Assign Shift</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium">{location?.name}</p>
            <p className="text-gray-500">{date}</p>
            <p className="text-gray-400 text-xs mt-1">{locationShifts.length} existing shift(s)</p>
          </div>

          <div>
            <Label>Employee</Label>
            <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees.length === 0 && (
                  <SelectItem value="__none__" disabled>No available employees</SelectItem>
                )}
                {availableEmployees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                    {emp.role && <span className="text-gray-400 ml-2 text-xs">({emp.role})</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Time</Label>
              <Input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={!form.employee_id || saving}
            className="bg-[#1a9c5b] hover:bg-[#158a4e]"
          >
            {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
            Assign Shift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}