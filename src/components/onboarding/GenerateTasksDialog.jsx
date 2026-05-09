import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

export default function GenerateTasksDialog({ employee, onClose, onSuccess }) {
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("generateOnboardingTasks", {
        employee_id: employee.id,
        start_date: startDate,
      });
      const data = res.data;
      if (data?.success) {
        // Persist tasks to OnboardingTask entity
        if (data.tasks?.length > 0) {
          await Promise.all(
            data.tasks.map((t) =>
              base44.entities.OnboardingTask.create({
                employee_id: employee.id,
                employee_name: `${employee.first_name} ${employee.last_name}`,
                title: t.title,
                description: t.description || "",
                due_date: t.due_date,
                status: "pending",
                is_required: true,
                display_order: t.order || 0,
                assigned_to_role: t.assigned_to_role || "manager",
                onboarding_id: `onboarding-${employee.id}`,
              })
            )
          );
        }
        setResult(data);
      } else {
        setError(data?.error || "Failed to generate tasks.");
      }
    } catch (e) {
      setError(e.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-[#1a9c5b]" />
            Generate Onboarding Tasks
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Automatically generate onboarding tasks for{" "}
              <strong>
                {employee.first_name} {employee.last_name}
              </strong>{" "}
              based on their role and location.
            </p>

            <div>
              <Label className="text-xs font-semibold text-gray-600">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                className="bg-[#1a9c5b] hover:bg-[#158a4e]"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                {loading ? "Generating..." : "Generate Tasks"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="font-semibold text-gray-900">
                {result.task_count} tasks generated!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {result.rules_matched} onboarding rules matched for this employee.
              </p>
            </div>
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] w-full" onClick={onSuccess}>
              View Tasks
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}