import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function BillDialog({ open, onClose, bill, vendors, categories }) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    vendor_id: "", vendor_name: "", bill_number: "", description: "",
    category: "", amount: "", due_date: "", issue_date: "", status: "pending",
    payment_method: "", notes: ""
  });

  useEffect(() => {
    if (bill) {
      setForm({ ...bill, amount: bill.amount?.toString() || "" });
    } else {
      setForm({
        vendor_id: "", vendor_name: "", bill_number: "", description: "",
        category: "", amount: "", due_date: new Date().toISOString().split("T")[0],
        issue_date: new Date().toISOString().split("T")[0], status: "pending",
        payment_method: "", notes: ""
      });
    }
  }, [bill, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleVendorChange = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    set("vendor_id", vendorId);
    set("vendor_name", vendor?.name || "");
  };

  const handleSave = async () => {
    if (!form.vendor_name || !form.amount || !form.due_date) {
      toast.error("Vendor, amount, and due date are required.");
      return;
    }
    setSaving(true);
    const payload = { ...form, amount: parseFloat(form.amount) };
    if (bill) {
      await base44.entities.Bill.update(bill.id, payload);
      toast.success("Bill updated.");
    } else {
      await base44.entities.Bill.create(payload);
      toast.success("Bill created.");
    }
    qc.invalidateQueries({ queryKey: ["bills"] });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{bill ? "Edit Bill" : "Add Bill"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Vendor *</Label>
              {vendors.length > 0 ? (
                <Select value={form.vendor_id} onValueChange={handleVendorChange}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input className="mt-1" placeholder="Vendor name" value={form.vendor_name} onChange={e => set("vendor_name", e.target.value)} />
              )}
            </div>
            <div>
              <Label>Bill Number</Label>
              <Input className="mt-1" value={form.bill_number} onChange={e => set("bill_number", e.target.value)} placeholder="INV-001" />
            </div>
            <div>
              <Label>Amount ($) *</Label>
              <Input className="mt-1" type="number" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label>Issue Date</Label>
              <Input className="mt-1" type="date" value={form.issue_date} onChange={e => set("issue_date", e.target.value)} />
            </div>
            <div>
              <Label>Due Date *</Label>
              <Input className="mt-1" type="date" value={form.due_date} onChange={e => set("due_date", e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => set("category", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["draft","pending","approved","paid","overdue","cancelled"].map(s => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Input className="mt-1" value={form.description} onChange={e => set("description", e.target.value)} placeholder="What is this bill for?" />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Input className="mt-1" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Additional notes..." />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : bill ? "Save Changes" : "Add Bill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}