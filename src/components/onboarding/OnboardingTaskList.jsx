import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, BookOpen, Award, FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const CATEGORY_ICONS = {
  documentation: FileText,
  training: BookOpen,
  equipment: Clock,
  orientation: Clock,
  policy: FileText,
  other: Circle,
};

const STATUS_STYLES = {
  completed: "text-green-600",
  in_progress: "text-blue-600",
  pending: "text-gray-400",
  blocked: "text-red-500",
};

const TRAINING_STATUS_BADGE = {
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  in_progress: "bg-blue-100 text-blue-700",
  assigned: "bg-gray-100 text-gray-700",
  overdue: "bg-red-100 text-red-700",
};

const CERT_STATUS_BADGE = {
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  expiring_soon: "bg-amber-100 text-amber-700",
};

export default function OnboardingTaskList({ tasks, trainings, certs, onUpdateTask }) {
  const [activeTab, setActiveTab] = useState("tasks");

  const tabs = [
    { id: "tasks", label: `Tasks (${tasks.length})` },
    { id: "training", label: `Training (${trainings.length})` },
    { id: "certs", label: `Certifications (${certs.length})` },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-[#1a9c5b] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No onboarding tasks. Click "Generate Tasks" to create them.</p>
          ) : (
            tasks
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
              .map((task) => {
                const Icon = CATEGORY_ICONS[task.category] || Circle;
                const isOverdue =
                  task.status !== "completed" &&
                  task.due_date &&
                  new Date(task.due_date) < new Date();
                return (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      isOverdue ? "border-red-200 bg-red-50" : "border-gray-100 bg-white"
                    }`}
                  >
                    <button
                      className={`mt-0.5 flex-shrink-0 ${STATUS_STYLES[task.status]}`}
                      onClick={() =>
                        onUpdateTask(task.id, {
                          status: task.status === "completed" ? "pending" : "completed",
                          completed_date: task.status === "completed" ? null : new Date().toISOString().split("T")[0],
                        })
                      }
                    >
                      {task.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-medium ${
                            task.status === "completed" ? "line-through text-gray-400" : "text-gray-800"
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.is_required && (
                          <Badge className="text-[9px] bg-gray-100 text-gray-600 border-0">Required</Badge>
                        )}
                        {isOverdue && (
                          <Badge className="text-[9px] bg-red-100 text-red-600 border-0">
                            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />Overdue
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-[10px] text-gray-500 mt-0.5 truncate">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        {task.due_date && (
                          <span className="text-[10px] text-gray-400">
                            Due {format(new Date(task.due_date + "T00:00:00"), "MMM d")}
                          </span>
                        )}
                        <Badge className={`text-[9px] capitalize px-1.5 py-0 ${STATUS_STYLES[task.status]} bg-transparent border-0`}>
                          {task.status?.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* Training Tab */}
      {activeTab === "training" && (
        <div className="space-y-2">
          {trainings.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No training assignments.</p>
          ) : (
            trainings.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white">
                <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{t.module_title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {t.final_score != null && (
                      <span className="text-[10px] text-gray-500">Score: {t.final_score}%</span>
                    )}
                    {t.due_date && (
                      <span className="text-[10px] text-gray-400">
                        Due {format(new Date(t.due_date + "T00:00:00"), "MMM d")}
                      </span>
                    )}
                  </div>
                </div>
                <Badge className={`text-[10px] capitalize ${TRAINING_STATUS_BADGE[t.status] || "bg-gray-100 text-gray-700"}`}>
                  {t.status?.replace("_", " ")}
                </Badge>
              </div>
            ))
          )}
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === "certs" && (
        <div className="space-y-2">
          {certs.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No certifications on file.</p>
          ) : (
            certs.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white">
                <Award className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{c.name}</p>
                  {c.expiry_date && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Expires {format(new Date(c.expiry_date + "T00:00:00"), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                <Badge className={`text-[10px] capitalize ${CERT_STATUS_BADGE[c.status] || "bg-gray-100 text-gray-700"}`}>
                  {c.status?.replace("_", " ")}
                </Badge>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}