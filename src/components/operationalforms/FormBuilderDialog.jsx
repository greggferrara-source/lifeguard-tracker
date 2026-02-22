import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, AlertTriangle } from "lucide-react";

const FIELD_TYPES = [
  { value: "pass_fail", label: "Pass / Fail" },
  { value: "yes_no", label: "Yes / No" },
  { value: "number", label: "Number" },
  { value: "text", label: "Text" },
  { value: "select", label: "Multiple Choice" },
];

const CATEGORIES = ["vehicle", "equipment", "safety", "training", "patient", "facility", "other"];

function newField() {
  return {
    id: crypto.randomUUID(),
    label: "",
    type: "pass_fail",
    required: true,
    alert_on_fail: false,
    options: [],
    unit: "",
  };
}

export default function FormBuilderDialog({ open, onOpenChange, editForm }) {
  const queryClient = useQueryClient();
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });

  const [name, setName] = useState(editForm?.name || "");
  const [description, setDescription] = useState(editForm?.description || "");
  const [category, setCategory] = useState(editForm?.category || "safety");
  const [locationId, setLocationId] = useState(editForm?.location_id || "");
  const [alertEmail, setAlertEmail] = useState(editForm?.alert_email || "");
  const [fields, setFields] = useState(editForm?.fields?.length ? editForm.fields : [newField()]);

  React.useEffect(() => {
    if (open) {
      setName(editForm?.name || "");
      setDescription(editForm?.description || "");
      setCategory(editForm?.category || "safety");
      setLocationId(editForm?.location_id || "");
      setAlertEmail(editForm?.alert_email || "");
      setFields(editForm?.fields?.length ? editForm.fields : [newField()]);
    }
  }, [open, editForm]);

  const save = useMutation({
    mutationFn: (data) => editForm
      ? base44.entities.OperationalForm.update(editForm.id, data)
      : base44.entities.OperationalForm.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["op-forms"] });
      onOpenChange(false);
    },
  });

  const addField = () => setFields(f => [...f, newField()]);
  const removeField = (id) => setFields(f => f.filter(x => x.id !== id));
  const updateField = (id, key, value) => setFields(f => f.map(x => x.id === id ? { ...x, [key]: value } : x));

  const handleSubmit = (e) => {
    e.preventDefault();
    const loc = locations.find(l => l.id === locationId);
    save.mutate({
      name, description, category,
      location_id: locationId || undefined,
      location_name: loc?.name || undefined,
      alert_email: alertEmail || undefined,
      fields,
      is_active: editForm?.is_active ?? true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editForm ? "Edit Form" : "Create Operational Form"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Form Name *</label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Truck Check Out Checklist" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm capitalize">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Location (optional)</label>
              <select value={locationId} onChange={e => setLocationId(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">All Locations</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this form for?" className="mt-1" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-orange-500" /> Alert Email on Failures</label>
              <Input type="email" value={alertEmail} onChange={e => setAlertEmail(e.target.value)} placeholder="email@example.com" className="mt-1" />
            </div>
          </div>

          {/* Fields */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-700">Form Fields</label>
              <Button type="button" size="sm" variant="outline" onClick={addField} className="gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Field
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div key={field.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-gray-300 mt-2.5 flex-shrink-0" />
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <Input
                          placeholder={`Field ${idx + 1} label (e.g. Lights Operational?)`}
                          value={field.label}
                          onChange={e => updateField(field.id, "label", e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <select
                          value={field.type}
                          onChange={e => updateField(field.id, "type", e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                        >
                          {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      {field.type === "number" && (
                        <Input
                          placeholder="Unit (e.g. miles)"
                          value={field.unit}
                          onChange={e => updateField(field.id, "unit", e.target.value)}
                          className="text-sm"
                        />
                      )}
                      {field.type === "select" && (
                        <div className="col-span-2">
                          <Input
                            placeholder="Options comma-separated (e.g. Good,Fair,Poor)"
                            value={field.options?.join(",")}
                            onChange={e => updateField(field.id, "options", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                            className="text-sm"
                          />
                        </div>
                      )}
                      <div className="col-span-2 flex items-center gap-4">
                        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                          <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, "required", e.target.checked)} />
                          Required
                        </label>
                        {(field.type === "pass_fail" || field.type === "yes_no") && (
                          <label className="flex items-center gap-1.5 text-xs text-orange-600 cursor-pointer">
                            <input type="checkbox" checked={field.alert_on_fail} onChange={e => updateField(field.id, "alert_on_fail", e.target.checked)} />
                            Alert on Fail
                          </label>
                        )}
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeField(field.id)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={save.isPending}>
              {editForm ? "Save Changes" : "Create Form"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}