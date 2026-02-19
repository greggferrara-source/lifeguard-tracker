import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLORS = ["#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"];

export default function LocationDialog({ open, onOpenChange, location, onSave }) {
  const [form, setForm] = useState({
    name: "",
    type: "pool",
    address: "",
    status: "active",
    min_guards_required: 1,
    color: COLORS[0],
    notes: "",
  });

  useEffect(() => {
    if (location) {
      setForm({
        name: location.name || "",
        type: location.type || "pool",
        address: location.address || "",
        status: location.status || "active",
        min_guards_required: location.min_guards_required || 1,
        color: location.color || COLORS[0],
        notes: location.notes || "",
      });
    } else {
      setForm({
        name: "",
        type: "pool",
        address: "",
        status: "active",
        min_guards_required: 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        notes: "",
      });
    }
  }, [location, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{location ? "Edit Location" : "Add Location"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs">Location Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Main Pool"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pool">Pool</SelectItem>
                  <SelectItem value="beach">Beach</SelectItem>
                  <SelectItem value="waterpark">Waterpark</SelectItem>
                  <SelectItem value="lake">Lake</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Pool St"
            />
          </div>
          <div>
            <Label className="text-xs">Min Guards Required</Label>
            <Input
              type="number"
              min={1}
              value={form.min_guards_required}
              onChange={(e) => setForm({ ...form, min_guards_required: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div>
            <Label className="text-xs">Display Color</Label>
            <div className="flex gap-2 mt-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`w-7 h-7 rounded-full transition-all ${
                    form.color === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setForm({ ...form, color: c })}
                />
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(form)} className="bg-cyan-600 hover:bg-cyan-700">
            {location ? "Update" : "Add Location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}