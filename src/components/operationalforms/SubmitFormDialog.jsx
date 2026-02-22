import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, X, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function SubmitFormDialog({ open, onOpenChange, form }) {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const [responses, setResponses] = useState({});
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState(format(new Date(), "HH:mm"));

  React.useEffect(() => {
    if (open && form) {
      const initial = {};
      form.fields?.forEach(f => { initial[f.id] = ""; });
      setResponses(initial);
      setNotes("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      setTime(format(new Date(), "HH:mm"));
    }
  }, [open, form]);

  const save = useMutation({
    mutationFn: (data) => base44.entities.OperationalFormSubmission.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["op-submissions"] });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const responseArr = (form.fields || []).map(f => {
      const value = responses[f.id] ?? "";
      let passed = true;
      if (f.type === "pass_fail") passed = value === "pass";
      else if (f.type === "yes_no") passed = value === "yes";
      return { field_id: f.id, label: f.label, type: f.type, value, passed };
    });

    const failedAlerts = responseArr.filter(r => !r.passed && form.fields?.find(f => f.id === r.field_id)?.alert_on_fail);
    const failCount = responseArr.filter(r => !r.passed).length;
    const status = failCount === 0 ? "pass" : failCount <= 1 ? "warning" : "fail";

    save.mutate({
      form_id: form.id,
      form_name: form.name,
      form_category: form.category,
      location_id: form.location_id,
      location_name: form.location_name,
      submitted_by_email: user?.email,
      submitted_by_name: user?.full_name,
      date,
      time,
      responses: responseArr,
      status,
      notes,
      has_alerts: failedAlerts.length > 0,
    });
  };

  if (!form) return null;

  const setResponse = (fieldId, value) => setResponses(r => ({ ...r, [fieldId]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Date</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Time</label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1" />
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {(form.fields || []).map(field => (
              <div key={field.id} className="border border-gray-200 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-gray-800">{field.label}</p>
                  <div className="flex items-center gap-1">
                    {field.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                    {field.alert_on_fail && <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />}
                  </div>
                </div>

                {field.type === "pass_fail" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setResponse(field.id, "pass")}
                      className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${responses[field.id] === "pass" ? "bg-green-500 text-white shadow-md" : "bg-gray-100 text-gray-400 hover:bg-green-50"}`}
                    >
                      <CheckCircle2 className="w-5 h-5" /> Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => setResponse(field.id, "fail")}
                      className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${responses[field.id] === "fail" ? "bg-red-500 text-white shadow-md" : "bg-gray-100 text-gray-400 hover:bg-red-50"}`}
                    >
                      <X className="w-5 h-5" /> Fail
                    </button>
                  </div>
                )}

                {field.type === "yes_no" && (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setResponse(field.id, "yes")}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${responses[field.id] === "yes" ? "bg-green-500 text-white shadow-md" : "bg-gray-100 text-gray-400 hover:bg-green-50"}`}>
                      Yes
                    </button>
                    <button type="button" onClick={() => setResponse(field.id, "no")}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${responses[field.id] === "no" ? "bg-red-500 text-white shadow-md" : "bg-gray-100 text-gray-400 hover:bg-red-50"}`}>
                      No
                    </button>
                  </div>
                )}

                {field.type === "number" && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Enter value"
                      value={responses[field.id] || ""}
                      onChange={e => setResponse(field.id, e.target.value)}
                      className="text-xl font-bold"
                    />
                    {field.unit && <span className="text-sm text-gray-500">{field.unit}</span>}
                  </div>
                )}

                {field.type === "text" && (
                  <Input
                    placeholder="Enter text"
                    value={responses[field.id] || ""}
                    onChange={e => setResponse(field.id, e.target.value)}
                  />
                )}

                {field.type === "select" && (
                  <div className="flex flex-wrap gap-2">
                    {(field.options || []).map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setResponse(field.id, opt)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${responses[field.id] === opt ? "bg-[#1a9c5b] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Any additional notes..."
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={save.isPending}>Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}