import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Siren, Camera, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import SignaturePad from "./SignaturePad";

const defaultForm = () => ({
  location_id: "", date: format(new Date(), "yyyy-MM-dd"), time: format(new Date(), "HH:mm"),
  type: "incident", severity: "minor", patron_name: "", patron_age: "",
  description: "", action_taken: "", ems_called: false, patron_transported: false,
  witnesses: "", follow_up_required: false, follow_up_notes: "", status: "open",
  photo_urls: [], signature_url: null
});

export default function LogIncidentForm({ open, onOpenChange }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(defaultForm());
  const [showSignature, setShowSignature] = useState(false);
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const save = useMutation({
    mutationFn: (data) => base44.entities.IncidentLog.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incident-logs"] });
      onOpenChange(false);
      setForm(defaultForm());
    }
  });

  const f = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleSignatureCapture = async (dataUrl) => {
    try {
      const blob = await fetch(dataUrl).then(r => r.blob());
      const { file_url } = await base44.integrations.Core.UploadFile({ file: blob });
      f("signature_url", file_url);
      setShowSignature(false);
    } catch (error) {
      console.error("Failed to upload signature:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.signature_url) {
      alert("Signature is required. Please sign the form.");
      return;
    }
    const loc = locations.find(l => l.id === form.location_id);
    save.mutate({
      ...form,
      patron_age: form.patron_age ? Number(form.patron_age) : undefined,
      location_name: loc?.name || "",
      reporting_staff_name: user?.full_name || "",
      reporting_staff_email: user?.email || "",
    });
  };

  const isCritical = form.severity === "critical" || form.type === "rescue";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCritical && <AlertTriangle className="w-5 h-5 text-red-500" />}
            Log Incident / Injury Report
          </DialogTitle>
        </DialogHeader>

        {isCritical && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-sm">
            <Siren className="w-4 h-4 flex-shrink-0" />
            Critical/rescue incident — ensure emergency protocols are followed.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Location *</Label>
              <select required value={form.location_id} onChange={e => f("location_id", e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select location...</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => f("date", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={form.time} onChange={e => f("time", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Incident Type *</Label>
              <select required value={form.type} onChange={e => f("type", e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="rescue">🚨 Rescue</option>
                <option value="injury">🩹 Injury</option>
                <option value="incident">⚠️ Incident</option>
                <option value="near_miss">⚡ Near Miss</option>
                <option value="first_aid">➕ First Aid</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label>Severity</Label>
              <select value={form.severity} onChange={e => f("severity", e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="serious">Serious</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <Label>Patron / Victim Name</Label>
              <Input placeholder="Full name" value={form.patron_name} onChange={e => f("patron_name", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Patron Age</Label>
              <Input type="number" min="0" placeholder="Age" value={form.patron_age} onChange={e => f("patron_age", e.target.value)} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Description *</Label>
              <Textarea required rows={3} placeholder="Describe exactly what happened..." value={form.description} onChange={e => f("description", e.target.value)} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Action Taken</Label>
              <Textarea rows={2} placeholder="What response actions were taken?" value={form.action_taken} onChange={e => f("action_taken", e.target.value)} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Witnesses</Label>
              <Input placeholder="Names of any witnesses" value={form.witnesses} onChange={e => f("witnesses", e.target.value)} className="mt-1" />
            </div>
            <div className="col-span-2 space-y-2">
              {[
                ["ems_called", "EMS / 911 Called"],
                ["patron_transported", "Patron Transported by EMS"],
                ["follow_up_required", "Follow-Up Required"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox checked={form[key]} onCheckedChange={v => f(key, v)} id={key} />
                  <label htmlFor={key} className="text-sm text-gray-700 cursor-pointer">{label}</label>
                </div>
              ))}
            </div>
            {form.follow_up_required && (
              <div className="col-span-2">
                <Label>Follow-Up Notes</Label>
                <Textarea rows={2} value={form.follow_up_notes} onChange={e => f("follow_up_notes", e.target.value)} className="mt-1" placeholder="What follow-up is needed?" />
              </div>
            )}

            {/* Photo Attachments */}
            <div className="col-span-2">
              <Label className="flex items-center gap-1"><Camera className="w-4 h-4" /> Photo Attachments</Label>
              <div className="mt-1 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-200 rounded-lg px-4 py-3 hover:border-[#1a9c5b] transition-colors">
                  <Camera className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Click to upload photo(s)</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    const urls = [];
                    for (const file of files) {
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      urls.push(file_url);
                    }
                    f("photo_urls", [...(form.photo_urls || []), ...urls]);
                  }} />
                </label>
                {(form.photo_urls || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.photo_urls.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt={`Photo ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                        <button type="button" onClick={() => f("photo_urls", form.photo_urls.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Signature Pad */}
            <div className="col-span-2">
              {showSignature ? (
                <SignaturePad onSign={handleSignatureCapture} onCancel={() => setShowSignature(false)} />
              ) : (
                <div className="space-y-2">
                  <Label>Signature *</Label>
                  {form.signature_url ? (
                    <div className="space-y-2">
                      <img src={form.signature_url} alt="Signature" className="w-32 h-20 border border-gray-200 rounded-lg" />
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowSignature(true)}>
                        Re-sign
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" onClick={() => setShowSignature(true)} className="w-full">
                      Capture Signature
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={save.isPending}>
              {save.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}