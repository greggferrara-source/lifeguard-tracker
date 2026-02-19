import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Calendar, Clock, MapPin } from "lucide-react";

export default function ShiftSwapDialog({ open, onOpenChange, myShift, allShifts, employees, onSubmit }) {
  const [targetShiftId, setTargetShiftId] = useState("");
  const [message, setMessage] = useState("");

  // Find future shifts belonging to other active employees
  const today = new Date().toISOString().split("T")[0];
  const swappableShifts = allShifts.filter(
    s => s.employee_id &&
      s.employee_id !== myShift?.employee_id &&
      s.date >= today &&
      s.status === "scheduled"
  );

  const empMap = Object.fromEntries(employees.map(e => [e.id, e]));
  const targetShift = swappableShifts.find(s => s.id === targetShiftId);
  const targetEmp = targetShift ? empMap[targetShift.employee_id] : null;

  const handleSubmit = () => {
    if (!targetShift || !myShift) return;
    onSubmit({
      requester_shift_id: myShift.id,
      requester_shift_date: myShift.date,
      requester_shift_time: `${myShift.start_time}–${myShift.end_time}`,
      requester_shift_location: myShift.location_name,
      target_employee_id: targetShift.employee_id,
      target_employee_name: `${targetEmp?.first_name || ""} ${targetEmp?.last_name || ""}`.trim(),
      target_shift_id: targetShift.id,
      target_shift_date: targetShift.date,
      target_shift_time: `${targetShift.start_time}–${targetShift.end_time}`,
      target_shift_location: targetShift.location_name,
      requester_message: message,
      status: "pending_employee",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4" /> Request Shift Swap
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* My shift */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Shift</Label>
            <div className="mt-1.5 p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                <Calendar className="w-3.5 h-3.5" /> {myShift?.date}
              </div>
              <div className="flex items-center gap-4 text-xs text-blue-700">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{myShift?.start_time}–{myShift?.end_time}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{myShift?.location_name}</span>
              </div>
            </div>
          </div>

          {/* Target shift */}
          <div>
            <Label className="text-xs font-semibold text-slate-700">Swap With</Label>
            <Select value={targetShiftId} onValueChange={setTargetShiftId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a shift to swap with…" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {swappableShifts.map(s => {
                  const emp = empMap[s.employee_id];
                  return (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="font-medium">{emp ? `${emp.first_name} ${emp.last_name}` : "Unknown"}</span>
                      <span className="text-slate-500 ml-2">{s.date} {s.start_time}–{s.end_time} @ {s.location_name}</span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {targetShift && (
              <div className="mt-1.5 p-3 bg-green-50 border border-green-100 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-900">
                  <Calendar className="w-3.5 h-3.5" /> {targetShift.date}
                </div>
                <div className="flex items-center gap-4 text-xs text-green-700">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{targetShift.start_time}–{targetShift.end_time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{targetShift.location_name}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700">Message (optional)</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Explain why you'd like to swap…" rows={2} className="mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!targetShiftId} onClick={handleSubmit} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
            Send Swap Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}