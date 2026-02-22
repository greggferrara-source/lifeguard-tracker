import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, AlertTriangle, FileText, Users, Phone } from "lucide-react";

const FOLLOW_UP_STEPS = [
  { id: "notify_management", label: "Management notified", icon: Phone, description: "Supervisor/manager has been informed of the incident" },
  { id: "witness_statements", label: "Witness statements collected", icon: Users, description: "All witness accounts documented" },
  { id: "report_filed", label: "Official report filed", icon: FileText, description: "Incident report submitted to appropriate authorities" },
  { id: "corrective_action", label: "Corrective action taken", icon: AlertTriangle, description: "Root cause addressed and prevention measures implemented" },
  { id: "staff_debriefed", label: "Staff debriefed", icon: Users, description: "Team briefed on incident and lessons learned" },
];

export default function IncidentFollowUpPanel({ incident }) {
  const qc = useQueryClient();
  const completed = incident.follow_up_steps_completed || [];
  const [note, setNote] = useState(incident.follow_up_notes || "");
  const [saving, setSaving] = useState(false);

  const update = useMutation({
    mutationFn: (data) => base44.entities.IncidentLog.update(incident.id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incident-logs"] }),
  });

  const toggleStep = (stepId) => {
    const next = completed.includes(stepId)
      ? completed.filter(s => s !== stepId)
      : [...completed, stepId];
    update.mutate({ follow_up_steps_completed: next });
  };

  const saveNote = async () => {
    setSaving(true);
    await update.mutateAsync({ follow_up_notes: note });
    setSaving(false);
  };

  const completedCount = completed.length;
  const totalSteps = FOLLOW_UP_STEPS.length;
  const pct = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span className="font-medium">Follow-up Progress</span>
          <span className={pct === 100 ? "text-green-600 font-bold" : ""}>{completedCount}/{totalSteps} steps</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-green-500" : "bg-[#1a9c5b]"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct === 100 && (
          <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> All follow-up steps complete
          </p>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {FOLLOW_UP_STEPS.map((step) => {
          const done = completed.includes(step.id);
          const Icon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                done
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
              }`}
            >
              {done
                ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                : <Circle className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />}
              <div className="min-w-0">
                <p className={`text-sm font-medium ${done ? "text-green-700 line-through" : "text-gray-800"}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Notes */}
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Follow-up Notes</p>
        <Textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Document corrective actions, follow-up contacts, or additional details..."
          className="text-sm resize-none"
          rows={3}
        />
        <Button
          size="sm"
          className="mt-2 bg-[#1a9c5b] hover:bg-[#158a4e]"
          onClick={saveNote}
          disabled={saving || note === incident.follow_up_notes}
        >
          {saving ? "Saving..." : "Save Notes"}
        </Button>
      </div>
    </div>
  );
}