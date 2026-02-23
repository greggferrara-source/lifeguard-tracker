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

export default function VendorDialog({ open, onClose, vendor }) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", contact_name: "", email: "", phone: "", address: "",
    website: "", category: "", payment_terms: "net_30", notes: "", is_active: true
  });

  useEffect(() => {
    if (vendor) setForm({ ...vendor });
    else setForm({ name: "", contact_name: "", email: "", phone: "", address: "", website: "", category: "", payment_terms: "net_30", notes: "", is_active: true });
  }, [vendor, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name) { toast.error("Vendor name is required."); return; }
    setSaving(true);
    if (vendor) {
      await base44.entities.Vendor.update(vendor.id, form);
      toast.success("Vendor updated.");
    } else {
      await base44.entities.Vendor.create(form);
      toast.success("Vendor added.");
    }
    qc.invalidateQueries({ queryKey: ["vendors"] });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label>Vendor Name *</Label>
            <Input className="mt-1" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Company name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Contact Name</Label>
              <Input className="mt-1" value={form.contact_name} onChange={e => set("contact_name", e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Input className="mt-1" value={form.category} onChange={e => set("category", e.target.value)} placeholder="e.g. Supplies" />
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" type="email" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input className="mt-1" value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Payment Terms</Label>
            <Select value={form.payment_terms} onValueChange={v => set("payment_terms", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                <SelectItem value="net_15">Net 15</SelectItem>
                <SelectItem value="net_30">Net 30</SelectItem>
                <SelectItem value="net_60">Net 60</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Input className="mt-1" value={form.notes} onChange={e => set("notes", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : vendor ? "Save Changes" : "Add Vendor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}