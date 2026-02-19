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
import { Trash2, Plus, AlertTriangle } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";

const COLORS = ["#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"];

export default function EmployeeDialog({ open, onOpenChange, employee, onSave }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "lifeguard",
    status: "active",
    hourly_rate: "",
    max_hours_per_week: 40,
    color: COLORS[0],
    certifications: [],
    notes: "",
  });
  const [newCert, setNewCert] = useState({ name: "", expiry_date: "" });

  useEffect(() => {
    if (employee) {
      setForm({
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        role: employee.role || "lifeguard",
        status: employee.status || "active",
        hourly_rate: employee.hourly_rate || "",
        max_hours_per_week: employee.max_hours_per_week || 40,
        color: employee.color || COLORS[0],
        certifications: employee.certifications || [],
        notes: employee.notes || "",
      });
    } else {
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "lifeguard",
        status: "active",
        hourly_rate: "",
        max_hours_per_week: 40,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        certifications: [],
        notes: "",
      });
    }
    setNewCert({ name: "", expiry_date: "" });
  }, [employee, open]);

  const addCertification = () => {
    if (newCert.name.trim()) {
      setForm(f => ({
        ...f,
        certifications: [...f.certifications, { ...newCert }]
      }));
      setNewCert({ name: "", expiry_date: "" });
    }
  };

  const removeCertification = (idx) => {
    setForm(f => ({
      ...f,
      certifications: f.certifications.filter((_, i) => i !== idx)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add Employee"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">First Name</Label>
              <Input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="John"
              />
            </div>
            <div>
              <Label className="text-xs">Last Name</Label>
              <Input
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@email.com"
              />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="555-0123"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lifeguard">Lifeguard</SelectItem>
                  <SelectItem value="head_lifeguard">Head Lifeguard</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
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
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Hourly Rate ($)</Label>
              <Input
                type="number"
                value={form.hourly_rate}
                onChange={(e) => setForm({ ...form, hourly_rate: parseFloat(e.target.value) || "" })}
                placeholder="15.00"
              />
            </div>
            <div>
              <Label className="text-xs">Max Hours/Week</Label>
              <Input
                type="number"
                value={form.max_hours_per_week}
                onChange={(e) => setForm({ ...form, max_hours_per_week: parseInt(e.target.value) || 40 })}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Schedule Color</Label>
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
            <Label className="text-xs font-semibold">Certifications</Label>
            <div className="space-y-2 mt-2">
              {form.certifications.map((cert, idx) => {
                const isExpired = cert.expiry_date && isPast(parseISO(cert.expiry_date));
                return (
                  <div key={idx} className={`p-2.5 rounded-lg flex items-center justify-between text-sm ${isExpired ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{cert.name}</p>
                      {cert.expiry_date && (
                        <p className={`text-xs ${isExpired ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                          {isExpired && <span className="inline-block mr-1">⚠️</span>}
                          Expires: {format(parseISO(cert.expiry_date), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-red-600" onClick={() => removeCertification(idx)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 space-y-2">
              <Input placeholder="Cert name (e.g., CPR/AED)" value={newCert.name} onChange={(e) => setNewCert({ ...newCert, name: e.target.value })} />
              <div className="flex gap-2">
                <Input type="date" value={newCert.expiry_date} onChange={(e) => setNewCert({ ...newCert, expiry_date: e.target.value })} />
                <Button size="sm" variant="outline" onClick={addCertification} className="text-xs"><Plus className="w-3 h-3" /></Button>
              </div>
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
            {employee ? "Update" : "Add Employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}