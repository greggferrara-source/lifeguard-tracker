import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function RuleDialog({ open, onClose, rule, categories }) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", keyword: "", match_field: "both", category: "", enabled: true });

  React.useEffect(() => {
    if (rule) setForm({ name: rule.name, keyword: rule.keyword, match_field: rule.match_field || "both", category: rule.category, enabled: rule.enabled !== false });
    else setForm({ name: "", keyword: "", match_field: "both", category: "", enabled: true });
  }, [rule, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.keyword || !form.category) { toast.error("All fields are required."); return; }
    setSaving(true);
    if (rule) {
      await base44.entities.CategoryRule.update(rule.id, form);
      toast.success("Rule updated.");
    } else {
      await base44.entities.CategoryRule.create(form);
      toast.success("Rule created.");
    }
    qc.invalidateQueries({ queryKey: ["category-rules"] });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{rule ? "Edit Rule" : "New Auto-Categorization Rule"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Rule Name</Label>
            <Input className="mt-1" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Utility Company Rule" />
          </div>
          <div>
            <Label>Keyword to Match</Label>
            <Input className="mt-1" value={form.keyword} onChange={e => set("keyword", e.target.value)} placeholder="e.g. utility, electric, internet..." />
          </div>
          <div>
            <Label>Match Against</Label>
            <Select value={form.match_field} onValueChange={v => set("match_field", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vendor">Vendor name only</SelectItem>
                <SelectItem value="description">Description only</SelectItem>
                <SelectItem value="both">Vendor name or Description</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Assign Category</Label>
            <Select value={form.category} onValueChange={v => set("category", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.enabled} onCheckedChange={v => set("enabled", v)} />
            <Label>Enabled</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : rule ? "Save" : "Create Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CategoryRulesManager({ categories }) {
  const qc = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editRule, setEditRule] = useState(null);

  const { data: rules = [] } = useQuery({
    queryKey: ["category-rules"],
    queryFn: () => base44.entities.CategoryRule.list("name", 100),
  });

  const handleDelete = async (id) => {
    if (!confirm("Delete this rule?")) return;
    await base44.entities.CategoryRule.delete(id);
    qc.invalidateQueries({ queryKey: ["category-rules"] });
    toast.success("Rule deleted.");
  };

  const handleToggle = async (rule) => {
    await base44.entities.CategoryRule.update(rule.id, { enabled: !rule.enabled });
    qc.invalidateQueries({ queryKey: ["category-rules"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Zap className="w-4 h-4 text-[#1a9c5b]" />Auto-Categorization Rules</h3>
          <p className="text-xs text-gray-500 mt-0.5">Rules are applied before AI suggestions. Keywords are case-insensitive.</p>
        </div>
        <Button size="sm" className="bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={() => { setEditRule(null); setShowDialog(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm border border-dashed rounded-lg">
          No rules yet. Add a rule to auto-assign categories based on keywords.
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map(rule => (
            <Card key={rule.id} className="p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Switch checked={rule.enabled !== false} onCheckedChange={() => handleToggle(rule)} />
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{rule.name}</p>
                  <p className="text-xs text-gray-500">
                    Match <span className="font-mono bg-gray-100 px-1 rounded">{rule.keyword}</span> in {rule.match_field} → <Badge className="bg-[#e8f7ef] text-[#1a9c5b] border-0 text-xs">{rule.category}</Badge>
                  </p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditRule(rule); setShowDialog(true); }}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(rule.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <RuleDialog open={showDialog} onClose={() => setShowDialog(false)} rule={editRule} categories={categories} />
    </div>
  );
}