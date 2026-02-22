import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Play, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import OnboardingFlowDialog from "@/components/onboarding/OnboardingFlowDialog";
import ChecklistTemplateBuilder from "@/components/onboarding/ChecklistTemplateBuilder";
import ReportTemplateBuilder from "@/components/onboarding/ReportTemplateBuilder";

export default function OnboardingDashboard() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("active");
  const [showNewFlow, setShowNewFlow] = useState(false);
  const [showChecklistBuilder, setShowChecklistBuilder] = useState(false);
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list()
  });

  const { data: onboardings = [] } = useQuery({
    queryKey: ["onboardings"],
    queryFn: () => base44.entities.Onboarding.list("-created_date", 100)
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["checklist-templates"],
    queryFn: () => base44.entities.ChecklistTemplate.list()
  });

  const { data: reportTemplates = [] } = useQuery({
    queryKey: ["report-templates"],
    queryFn: () => base44.entities.OperationalForm.list()
  });

  const deleteOnboarding = useMutation({
    mutationFn: (id) => base44.entities.Onboarding.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["onboardings"] })
  });

  const deleteTemplate = useMutation({
    mutationFn: (id) => base44.entities.ChecklistTemplate.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist-templates"] })
  });

  const activeOnboardings = onboardings.filter(o => o.status === "in_progress");
  const completedOnboardings = onboardings.filter(o => o.status === "completed");

  const tabs = [
    { id: "active", label: "Active Onboardings", count: activeOnboardings.length },
    { id: "completed", label: "Completed", count: completedOnboardings.length },
    { id: "templates", label: "Checklist Templates", count: templates.length },
    { id: "reports", label: "Report Templates", count: reportTemplates.length }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case "completed": return "bg-green-50 border-green-200 text-green-700";
      case "in_progress": return "bg-blue-50 border-blue-200 text-blue-700";
      case "paused": return "bg-yellow-50 border-yellow-200 text-yellow-700";
      default: return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Onboarding Management</h1>
        {tab === "active" && (
          <Button onClick={() => setShowNewFlow(true)} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
            <Plus className="w-4 h-4 mr-2" />
            Start Onboarding
          </Button>
        )}
        {tab === "templates" && (
          <Button onClick={() => setShowChecklistBuilder(true)} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
            <Plus className="w-4 h-4 mr-2" />
            New Checklist Template
          </Button>
        )}
        {tab === "reports" && (
          <Button onClick={() => setShowReportBuilder(true)} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
            <Plus className="w-4 h-4 mr-2" />
            New Report Template
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? "border-[#1a9c5b] text-[#1a9c5b]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Active Onboardings */}
      {tab === "active" && (
        <div className="grid gap-4">
          {activeOnboardings.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="py-8 text-center text-gray-600">
                No active onboardings. Start one to get employees up to speed.
              </CardContent>
            </Card>
          ) : (
            activeOnboardings.map(onboarding => (
              <Card key={onboarding.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{onboarding.employee_name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">Started {onboarding.start_date}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(onboarding.status)}`}>
                      {onboarding.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm font-bold">{onboarding.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#1a9c5b] h-2 rounded-full transition-all"
                        style={{ width: `${onboarding.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOnboarding(onboarding)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      View Tasks
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteOnboarding.mutate(onboarding.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Completed Onboardings */}
      {tab === "completed" && (
        <div className="grid gap-4">
          {completedOnboardings.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="py-8 text-center text-gray-600">
                No completed onboardings yet.
              </CardContent>
            </Card>
          ) : (
            completedOnboardings.map(onboarding => (
              <Card key={onboarding.id} className="bg-green-50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <CardTitle className="text-green-900">{onboarding.employee_name}</CardTitle>
                    </div>
                    <span className="text-sm text-green-700">Completed</span>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Checklist Templates */}
      {tab === "templates" && (
        <div className="grid gap-4">
          {templates.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="py-8 text-center text-gray-600">
                No checklist templates. Create one to streamline your operations.
              </CardContent>
            </Card>
          ) : (
            templates.map(template => (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{template.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{template.type} • {template.items?.length || 0} items</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                      {template.frequency}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteTemplate.mutate(template.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Report Templates */}
      {tab === "reports" && (
        <div className="grid gap-4">
          {reportTemplates.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="py-8 text-center text-gray-600">
                No report templates. Create one to standardize incident documentation.
              </CardContent>
            </Card>
          ) : (
            reportTemplates.map(template => (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{template.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{template.category} • {template.fields?.length || 0} fields</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${template.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {template.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Dialogs */}
      <OnboardingFlowDialog open={showNewFlow} onOpenChange={setShowNewFlow} employees={employees} />
      <ChecklistTemplateBuilder open={showChecklistBuilder} onOpenChange={setShowChecklistBuilder} />
      <ReportTemplateBuilder open={showReportBuilder} onOpenChange={setShowReportBuilder} />

      {/* Task Details Modal */}
      {selectedOnboarding && (
        <OnboardingTasksModal
          onboarding={selectedOnboarding}
          onClose={() => setSelectedOnboarding(null)}
        />
      )}
    </div>
  );
}

function OnboardingTasksModal({ onboarding, onClose }) {
  const { data: tasks = [] } = useQuery({
    queryKey: ["onboarding-tasks", onboarding.id],
    queryFn: () => base44.entities.OnboardingTask.filter({ onboarding_id: onboarding.id }, "-display_order")
  });

  const completedCount = tasks.filter(t => t.status === "completed").length;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{onboarding.employee_name} - Onboarding Tasks</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{completedCount} of {tasks.length} completed</span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#1a9c5b] h-2 rounded-full transition-all"
                style={{ width: `${(completedCount / (tasks.length || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="space-y-2">
            {tasks.map(task => (
              <Card key={task.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{task.category}</span>
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">{task.status}</span>
                      </div>
                    </div>
                    {task.status === "completed" && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}