import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const defaultItem = () => ({ id: crypto.randomUUID(), label: "", type: "checkbox", required: true, unit: "", min_value: "", max_value: "" });

export default function ChecklistTemplateDialog({ open, onOpenChange, template }) {
  const qc = useQueryClient();
  const isEdit = !!template;

  const [form, setForm] = useState(template || {
    name: "", type: "chemical", frequency: "daily", location_id: "", location_name: "", items: [defaultItem()], is_active: true
  });

  React.useEffect(() => {
    setForm(template || { name: "", type: "chemical", frequency: "daily", location_id: "", location_name: "", items: [defaultItem()], is_active: true });
  }, [template, open]);

  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });

  const save = useMutation({
    mutationFn: (data) => isEdit ? base44.entities.ChecklistTemplate.update(template.id, data) : base44.entities.ChecklistTemplate.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["checklist-templates"] }); onOpenChange(false); }
  });

  const addItem = () => setForm(f => ({ ...f, items: [...(f.items || []), defaultItem()] }));
  const removeItem = (id) => setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) }));
  const updateItem = (id, field, val) => setForm(f => ({ ...f, items: f.items.map(i => i.id === id ? { ...i, [field]: val } : i) }));

  const handleLocationChange = (id) => {
    const loc = locations.find(l => l.id === id);
    setForm(f => ({ ...f, location_id: id, location_name: loc?.name || "" }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Checklist Template" : "New Checklist Template"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Morning Chemical Check" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="chemical">Chemical</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="opening">Opening</SelectItem>
                  <SelectItem value="closing">Closing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_shift">Per Shift</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location (optional)</Label>
              <Select value={form.location_id || "all"} onValueChange={v => v === "all" ? setForm(f => ({ ...f, location_id: "", location_name: "" })) : handleLocationChange(v)}>
                <SelectTrigger><SelectValue placeholder="All locations" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Checklist Items</Label>
              <Button size="sm" variant="outline" onClick={addItem}><Plus className="w-3 h-3 mr-1" />Add Item</Button>
            </div>
            <div className="space-y-2">
              {(form.items || []).map((item) => (
                <div key={item.id} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input placeholder="Item label" value={item.label} onChange={e => updateItem(item.id, "label", e.target.value)} />
                    <Select value={item.type} onValueChange={v => updateItem(item.id, "type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checkbox">Checkbox (pass/fail)</SelectItem>
                        <SelectItem value="number">Number (range)</SelectItem>
                        <SelectItem value="text">Text note</SelectItem>
                      </SelectContent>
                    </Select>
                    {item.type === "number" && (
                      <>
                        <Input placeholder="Min value" type="number" value={item.min_value} onChange={e => updateItem(item.id, "min_value", e.target.value)} />
                        <Input placeholder="Max value" type="number" value={item.max_value} onChange={e => updateItem(item.id, "max_value", e.target.value)} />
                        <Input placeholder="Unit (e.g. ppm, °F)" value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} className="col-span-2" />
                      </>
                    )}
                  </div>
                  <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600 mt-0.5" onClick={() => removeItem(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.name}>
              {save.isPending ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}