import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function SubmitChecklistDialog({ open, onOpenChange, template, user }) {
  const qc = useQueryClient();
  const [responses, setResponses] = useState({});
  const [notes, setNotes] = useState("");

  React.useEffect(() => {
    if (open && template) {
      const initial = {};
      template.items?.forEach(item => { initial[item.id] = { value: "", passed: item.type === "checkbox" ? false : true }; });
      setResponses(initial);
      setNotes("");
    }
  }, [open, template]);

  const submit = useMutation({
    mutationFn: async (data) => base44.entities.ChecklistSubmission.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["checklist-submissions"] }); onOpenChange(false); }
  });

  const handleCheckbox = (id, checked) => setResponses(r => ({ ...r, [id]: { value: checked ? "yes" : "no", passed: checked } }));
  const handleNumber = (item, val) => {
    const num = parseFloat(val);
    const passed = (!item.min_value && !item.max_value) ||
      (item.min_value !== "" && item.max_value !== "" ? num >= parseFloat(item.min_value) && num <= parseFloat(item.max_value) :
      item.min_value !== "" ? num >= parseFloat(item.min_value) : num <= parseFloat(item.max_value));
    setResponses(r => ({ ...r, [item.id]: { value: val, passed } }));
  };
  const handleText = (id, val) => setResponses(r => ({ ...r, [id]: { value: val, passed: true } }));

  const handleSubmit = () => {
    const items = template.items || [];
    const responseList = items.map(item => ({
      item_id: item.id,
      label: item.label,
      value: responses[item.id]?.value || "",
      passed: responses[item.id]?.passed ?? true
    }));
    const passed = responseList.filter(r => r.passed).length;
    const total = responseList.length;
    const failCount = responseList.filter(r => !r.passed).length;
    const status = failCount === 0 ? "pass" : failCount <= Math.ceil(total * 0.2) ? "warning" : "fail";

    submit.mutate({
      template_id: template.id,
      template_name: template.name,
      type: template.type,
      location_id: template.location_id || "",
      location_name: template.location_name || "",
      submitted_by_email: user?.email || "",
      submitted_by_name: user?.full_name || "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      responses: responseList,
      status,
      notes,
      items_passed: passed,
      items_total: total
    });
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {(template.items || []).map((item) => (
            <div key={item.id} className="p-3 border rounded-lg">
              <Label className="font-medium mb-2 block">{item.label}</Label>
              {item.type === "checkbox" && (
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={responses[item.id]?.passed || false}
                    onCheckedChange={(c) => handleCheckbox(item.id, c)}
                  />
                  <span className="text-sm text-gray-600">{responses[item.id]?.passed ? "✓ Pass" : "✗ Fail / Not done"}</span>
                </div>
              )}
              {item.type === "number" && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder={`Enter value${item.unit ? ` (${item.unit})` : ""}`}
                    value={responses[item.id]?.value || ""}
                    onChange={e => handleNumber(item, e.target.value)}
                    className="max-w-[160px]"
                  />
                  {item.min_value !== "" && item.max_value !== "" && (
                    <span className="text-xs text-gray-500">Range: {item.min_value}–{item.max_value} {item.unit}</span>
                  )}
                  {responses[item.id]?.value !== "" && (
                    responses[item.id]?.passed
                      ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                      : <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
              {item.type === "text" && (
                <Input placeholder="Enter notes" value={responses[item.id]?.value || ""} onChange={e => handleText(item.id, e.target.value)} />
              )}
            </div>
          ))}

          <div>
            <Label>Additional Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any observations or follow-up needed..." className="mt-1" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submit.isPending}>
              {submit.isPending ? "Submitting..." : "Submit Checklist"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}