import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const COLORS = ["#1a9c5b","#2563eb","#7c3aed","#db2777","#ea580c","#ca8a04","#0891b2","#64748b"];

export default function CategoryDialog({ open, onClose, category }) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", color: "#1a9c5b", description: "", budget_monthly: "" });

  useEffect(() => {
    if (category) setForm({ ...category, budget_monthly: category.budget_monthly?.toString() || "" });
    else setForm({ name: "", color: "#1a9c5b", description: "", budget_monthly: "" });
  }, [category, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name) { toast.error("Category name is required."); return; }
    setSaving(true);
    const payload = { ...form, budget_monthly: form.budget_monthly ? parseFloat(form.budget_monthly) : undefined };
    if (category) {
      await base44.entities.BillCategory.update(category.id, payload);
      toast.success("Category updated.");
    } else {
      await base44.entities.BillCategory.create(payload);
      toast.success("Category created.");
    }
    qc.invalidateQueries({ queryKey: ["bill-categories"] });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Name *</Label>
            <Input className="mt-1" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Maintenance" />
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex gap-2 mt-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => set("color", c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <Label>Monthly Budget ($)</Label>
            <Input className="mt-1" type="number" value={form.budget_monthly} onChange={e => set("budget_monthly", e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <Label>Description</Label>
            <Input className="mt-1" value={form.description} onChange={e => set("description", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : category ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}