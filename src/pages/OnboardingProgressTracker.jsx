import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import OnboardingHireCard from "@/components/onboarding/OnboardingHireCard";
import OnboardingTaskList from "@/components/onboarding/OnboardingTaskList";
import GenerateTasksDialog from "@/components/onboarding/GenerateTasksDialog";

export default function OnboardingProgressTracker() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
  const [generateFor, setGenerateFor] = useState(null);

  const { data: employees = [], isLoading: empLoading } = useQuery({
    queryKey: ["onboarding-employees"],
    queryFn: () => base44.entities.Employee.filter({ status: "active" }, "-created_date", 50),
  });

  const { data: onboardingTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["onboarding-tasks"],
    queryFn: () => base44.entities.OnboardingTask.list("-created_date", 200),
  });

  const { data: trainingAssignments = [] } = useQuery({
    queryKey: ["training-assignments"],
    queryFn: () => base44.entities.TrainingAssignment.list("-created_date", 200),
  });

  const { data: certifications = [] } = useQuery({
    queryKey: ["certifications-all"],
    queryFn: () => base44.entities.Certification.list("-created_date", 200),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }) => base44.entities.OnboardingTask.update(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["onboarding-tasks"] }),
  });

  const filtered = employees.filter(
    (e) =>
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Enrich each employee with task + training data
  const enriched = filtered.map((emp) => {
    const tasks = onboardingTasks.filter((t) => t.employee_id === emp.id);
    const trainings = trainingAssignments.filter((t) => t.employee_id === emp.id);
    const certs = certifications.filter((c) => c.employee_id === emp.id);
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const completedTrainings = trainings.filter((t) => t.status === "completed").length;
    const activeCerts = certs.filter((c) => c.status === "active").length;
    const totalProgress = tasks.length + trainings.length;
    const doneProgress = completedTasks + completedTrainings;
    const pct = totalProgress > 0 ? Math.round((doneProgress / totalProgress) * 100) : 0;
    return { ...emp, tasks, trainings, certs, completedTasks, completedTrainings, activeCerts, pct, totalProgress };
  });

  const needsAttention = enriched.filter((e) => {
    const overdueTasks = e.tasks.filter(
      (t) => t.status !== "completed" && t.due_date && new Date(t.due_date) < new Date()
    );
    return overdueTasks.length > 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Onboarding Progress</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track certification milestones, training completions, and admin tasks per hire.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["onboarding-tasks"] });
                queryClient.invalidateQueries({ queryKey: ["training-assignments"] });
              }}
            >
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
        </div>

        {/* Needs attention banner */}
        {needsAttention.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <p className="text-sm text-amber-800 font-medium">
              {needsAttention.length} employee{needsAttention.length > 1 ? "s have" : " has"} overdue onboarding tasks.
            </p>
          </div>
        )}

        {/* Search + Summary */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{enriched.length}</span> employees
            <span>·</span>
            <span className="font-semibold text-amber-600">{needsAttention.length}</span> need attention
          </div>
        </div>

        {/* Employee List */}
        {empLoading ? (
          <div className="text-center py-20 text-gray-400">Loading employees...</div>
        ) : enriched.length === 0 ? (
          <Card className="py-20 text-center border-dashed">
            <UserPlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No employees found.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {enriched.map((emp) => (
              <div key={emp.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <OnboardingHireCard
                  employee={emp}
                  expanded={expandedEmployeeId === emp.id}
                  onToggle={() =>
                    setExpandedEmployeeId(expandedEmployeeId === emp.id ? null : emp.id)
                  }
                  onGenerateTasks={() => setGenerateFor(emp)}
                />

                {expandedEmployeeId === emp.id && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 bg-gray-50">
                    <OnboardingTaskList
                      tasks={emp.tasks}
                      trainings={emp.trainings}
                      certs={emp.certs}
                      onUpdateTask={(id, updates) => updateTaskMutation.mutate({ id, updates })}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Tasks Dialog */}
      {generateFor && (
        <GenerateTasksDialog
          employee={generateFor}
          onClose={() => setGenerateFor(null)}
          onSuccess={() => {
            setGenerateFor(null);
            queryClient.invalidateQueries({ queryKey: ["onboarding-tasks"] });
          }}
        />
      )}
    </div>
  );
}