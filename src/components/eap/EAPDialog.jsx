import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";

const defaultForm = () => ({
  title: "", type: "drowning", location_id: "", location_name: "", version: "1.0",
  last_reviewed: "", next_review_due: "", equipment_locations: "", notes: "",
  steps: [], emergency_contacts: [], is_active: true
});

export default function EAPDialog({ open, onOpenChange, plan, locations }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(defaultForm());

  useEffect(() => {
    if (plan) setForm({ ...defaultForm(), ...plan });
    else setForm(defaultForm());
  }, [plan, open]);

  const save = useMutation({
    mutationFn: (data) => plan ? base44.entities.EmergencyActionPlan.update(plan.id, data) : base44.entities.EmergencyActionPlan.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eap"] }); onOpenChange(false); }
  });

  const f = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const addStep = () => f("steps", [...(form.steps || []), { id: Date.now().toString(), order: (form.steps?.length || 0) + 1, title: "", description: "", responsible_role: "", time_target: "" }]);
  const updateStep = (i, field, val) => { const s = [...form.steps]; s[i] = { ...s[i], [field]: val }; f("steps", s); };
  const removeStep = (i) => f("steps", form.steps.filter((_, idx) => idx !== i));

  const addContact = () => f("emergency_contacts", [...(form.emergency_contacts || []), { name: "", role: "", phone: "" }]);
  const updateContact = (i, field, val) => { const c = [...form.emergency_contacts]; c[i] = { ...c[i], [field]: val }; f("emergency_contacts", c); };
  const removeContact = (i) => f("emergency_contacts", form.emergency_contacts.filter((_, idx) => idx !== i));

  const handleLocationChange = (id) => {
    const loc = locations.find(l => l.id === id);
    setForm(p => ({ ...p, location_id: id, location_name: loc?.name || "" }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit" : "New"} Emergency Action Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Plan Title *</Label>
              <Input value={form.title} onChange={e => f("title", e.target.value)} placeholder="e.g. Drowning Response - Main Pool" className="mt-1" />
            </div>
            <div>
              <Label>Emergency Type *</Label>
              <select value={form.type} onChange={e => f("type", e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {["drowning","spinal_injury","lightning","missing_patron","chemical_leak","fire","medical_emergency","active_threat","other"].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, x => x.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Location</Label>
              <select value={form.location_id} onChange={e => handleLocationChange(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">All Locations</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Version</Label>
              <Input value={form.version} onChange={e => f("version", e.target.value)} placeholder="1.0" className="mt-1" />
            </div>
            <div>
              <Label>Next Review Date</Label>
              <Input type="date" value={form.next_review_due} onChange={e => f("next_review_due", e.target.value)} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Equipment Locations</Label>
              <Textarea rows={2} value={form.equipment_locations} onChange={e => f("equipment_locations", e.target.value)} placeholder="AED by front desk, rescue tubes at each guard chair..." className="mt-1" />
            </div>
          </div>

          {/* Response Steps */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Response Steps</Label>
              <Button type="button" size="sm" variant="outline" onClick={addStep} className="gap-1"><Plus className="w-3.5 h-3.5" /> Add Step</Button>
            </div>
            {(form.steps || []).map((step, i) => (
              <div key={step.id || i} className="bg-gray-50 rounded-xl p-3 mb-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1a9c5b] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                  <Input value={step.title} onChange={e => updateStep(i, "title", e.target.value)} placeholder="Step title..." className="bg-white" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(i)} className="text-red-400 flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
                <Textarea rows={2} value={step.description} onChange={e => updateStep(i, "description", e.target.value)} placeholder="Detailed description..." className="bg-white text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={step.responsible_role} onChange={e => updateStep(i, "responsible_role", e.target.value)} placeholder="Responsible role" className="bg-white text-sm h-8" />
                  <Input value={step.time_target} onChange={e => updateStep(i, "time_target", e.target.value)} placeholder="Time target (e.g. 30 sec)" className="bg-white text-sm h-8" />
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Contacts */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Emergency Contacts</Label>
              <Button type="button" size="sm" variant="outline" onClick={addContact} className="gap-1"><Plus className="w-3.5 h-3.5" /> Add Contact</Button>
            </div>
            {(form.emergency_contacts || []).map((c, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                <Input value={c.name} onChange={e => updateContact(i, "name", e.target.value)} placeholder="Name" className="text-sm" />
                <Input value={c.role} onChange={e => updateContact(i, "role", e.target.value)} placeholder="Role" className="text-sm" />
                <div className="flex gap-1">
                  <Input value={c.phone} onChange={e => updateContact(i, "phone", e.target.value)} placeholder="Phone" className="text-sm" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeContact(i)} className="text-red-400 flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => save.mutate(form)} disabled={!form.title || save.isPending}>
              {save.isPending ? "Saving..." : plan ? "Save Changes" : "Create EAP"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}