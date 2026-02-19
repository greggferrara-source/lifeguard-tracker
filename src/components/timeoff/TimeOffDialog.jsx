import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function TimeOffDialog({
  open,
  onOpenChange,
  employees,
  onSubmit,
  isLoading,
}) {
  const [form, setForm] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
    is_partial_day: false,
    partial_start_time: "",
    partial_end_time: "",
    is_recurring: false,
    recurrence_pattern: "weekly",
    recurrence_end_date: "",
    reason: "",
  });

  const handleSubmit = () => {
    if (!form.employee_id || !form.start_date || !form.end_date) {
      return;
    }
    onSubmit(form);
    setForm({
      employee_id: "",
      start_date: "",
      end_date: "",
      is_partial_day: false,
      partial_start_time: "",
      partial_end_time: "",
      is_recurring: false,
      recurrence_pattern: "weekly",
      recurrence_end_date: "",
      reason: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Time Off Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs">Employee</Label>
            <Select
              value={form.employee_id}
              onValueChange={(v) => setForm({ ...form, employee_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees
                  .filter((e) => e.status === "active")
                  .map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">End Date</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>

          {/* Partial Day Toggle */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Checkbox
              id="partial_day"
              checked={form.is_partial_day}
              onCheckedChange={(checked) =>
                setForm({
                  ...form,
                  is_partial_day: checked,
                  partial_start_time: "",
                  partial_end_time: "",
                })
              }
            />
            <Label htmlFor="partial_day" className="text-xs cursor-pointer">
              Partial Day Request
            </Label>
          </div>

          {form.is_partial_day && (
            <div className="grid grid-cols-2 gap-3 pl-6">
              <div>
                <Label className="text-xs">Start Time</Label>
                <Input
                  type="time"
                  value={form.partial_start_time}
                  onChange={(e) =>
                    setForm({ ...form, partial_start_time: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">End Time</Label>
                <Input
                  type="time"
                  value={form.partial_end_time}
                  onChange={(e) =>
                    setForm({ ...form, partial_end_time: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Recurring Toggle */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Checkbox
              id="recurring"
              checked={form.is_recurring}
              onCheckedChange={(checked) =>
                setForm({
                  ...form,
                  is_recurring: checked,
                  recurrence_end_date: "",
                })
              }
            />
            <Label htmlFor="recurring" className="text-xs cursor-pointer">
              Recurring Time Off
            </Label>
          </div>

          {form.is_recurring && (
            <div className="space-y-3 pl-6">
              <div>
                <Label className="text-xs">Pattern</Label>
                <Select
                  value={form.recurrence_pattern}
                  onValueChange={(v) =>
                    setForm({ ...form, recurrence_pattern: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Recurrence End Date</Label>
                <Input
                  type="date"
                  value={form.recurrence_end_date}
                  onChange={(e) =>
                    setForm({ ...form, recurrence_end_date: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs">Reason</Label>
            <Textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Optional reason..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#1a9c5b] hover:bg-[#158a4e] rounded-full"
            disabled={isLoading}
          >
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}