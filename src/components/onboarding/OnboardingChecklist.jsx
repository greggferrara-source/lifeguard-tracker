import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react";
import { format } from "date-fns";

const categoryColors = {
  documentation: "bg-blue-100 text-blue-700",
  training: "bg-purple-100 text-purple-700",
  equipment: "bg-orange-100 text-orange-700",
  orientation: "bg-green-100 text-green-700",
  policy: "bg-red-100 text-red-700",
  other: "bg-gray-100 text-gray-700",
};

const statusIcons = {
  pending: Clock,
  in_progress: Clock,
  completed: CheckCircle2,
  blocked: AlertCircle,
};

export default function OnboardingChecklist({
  tasks = [],
  onboarding,
  isEditable = false,
  onTaskStatusChange,
  onAddTask,
}) {
  const [expandedTask, setExpandedTask] = useState(null);

  const requiredTasks = tasks.filter(t => t.is_required);
  const completedTasks = tasks.filter(t => t.status === "completed");
  const overdueTasks = tasks.filter(
    t => t.status !== "completed" && t.due_date && new Date(t.due_date) < new Date()
  );

  const handleStatusChange = (task) => {
    const newStatus =
      task.status === "pending"
        ? "in_progress"
        : task.status === "in_progress"
        ? "completed"
        : "pending";
    onTaskStatusChange?.(task.id, newStatus);
  };

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Onboarding Progress</CardTitle>
            <Badge
              className={
                onboarding?.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : onboarding?.status === "paused"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-blue-100 text-blue-700"
              }
            >
              {onboarding?.status || "Not Started"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">
                  {completedTasks.length} of {requiredTasks.length} required tasks
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {Math.round(((completedTasks.length / requiredTasks.length) || 0) * 100)}%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#1a9c5b] h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((completedTasks.length / requiredTasks.length) || 0) * 100}%`,
                  }}
                />
              </div>
            </div>

            {onboarding?.target_completion_date && (
              <p className="text-xs text-gray-500">
                Target completion: {format(new Date(onboarding.target_completion_date), "MMM d, yyyy")}
              </p>
            )}

            {overdueTasks.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks by Category */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500 mb-4">No tasks added yet</p>
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddTask?.()}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          tasks
            .sort((a, b) => a.display_order - b.display_order)
            .map(task => {
              const IconComponent = statusIcons[task.status];
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

              return (
                <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div
                      className="space-y-3"
                      onClick={() =>
                        setExpandedTask(expandedTask === task.id ? null : task.id)
                      }
                    >
                      <div className="flex items-start gap-3">
                        {isEditable && (
                          <Checkbox
                            checked={task.status === "completed"}
                            onChange={() => handleStatusChange(task)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p
                              className={`font-medium flex-1 ${
                                task.status === "completed"
                                  ? "text-gray-500 line-through"
                                  : "text-gray-900"
                              }`}
                            >
                              {task.title}
                            </p>
                            <Badge className={categoryColors[task.category]}>
                              {task.category}
                            </Badge>
                            {!isEditable && task.status === "completed" && (
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
                            {task.assigned_to_name && (
                              <span>Assigned to: {task.assigned_to_name}</span>
                            )}
                            {task.due_date && (
                              <span
                                className={isOverdue && task.status !== "completed" ? "text-red-600 font-semibold" : ""}
                              >
                                Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {expandedTask === task.id && task.description && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-700">{task.description}</p>
                          {task.completion_notes && task.status === "completed" && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-sm text-gray-700">
                              <p className="font-medium text-green-700">Completion Notes:</p>
                              <p>{task.completion_notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
        )}
      </div>
    </div>
  );
}