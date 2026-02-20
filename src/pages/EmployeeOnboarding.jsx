import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, AlertCircle, Clock, User, ChevronRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function EmployeeOnboarding() {
  const queryClient = useQueryClient();
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const { data: onboardings = [] } = useQuery({
    queryKey: ["onboardings"],
    queryFn: () => base44.entities.Onboarding.list("-created_date", 200),
  });

  const { data: onboardingTasks = [] } = useQuery({
    queryKey: ["onboarding-tasks"],
    queryFn: () => base44.entities.OnboardingTask.list("-created_date", 500),
  });

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const updateTaskStatus = useMutation({
    mutationFn: ({ taskId, status }) =>
      base44.entities.OnboardingTask.update(taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["onboardings"] });
    },
  });

  const updateOnboardingStatus = useMutation({
    mutationFn: ({ onboardingId, status }) =>
      base44.entities.Onboarding.update(onboardingId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboardings"] });
      setSelectedOnboarding(null);
    },
  });

  const createTask = useMutation({
    mutationFn: (taskData) => base44.entities.OnboardingTask.create(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-tasks"] });
      setEditingTask(null);
    },
  });

  const getTasksForOnboarding = (onboardingId) =>
    onboardingTasks.filter((t) => t.onboarding_id === onboardingId);

  const getOnboardingProgress = (onboardingId) => {
    const tasks = getTasksForOnboarding(onboardingId);
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  };

  const isManager = user?.role === "admin" || user?.role === "manager";
  const inProgressOnboardings = onboardings.filter((o) => o.status === "in_progress");
  const completedOnboardings = onboardings.filter((o) => o.status === "completed");
  const pausedOnboardings = onboardings.filter((o) => o.status === "paused");

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Employee Onboarding</h1>
        <p className="text-gray-600 mt-1">Manage and track new hire onboarding progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{inProgressOnboardings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{completedOnboardings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Paused</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{pausedOnboardings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{onboardings.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {inProgressOnboardings.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-gray-500">No active onboardings</p>
              </CardContent>
            </Card>
          ) : (
            inProgressOnboardings.map((onboarding) => {
              const tasks = getTasksForOnboarding(onboarding.id);
              const progress = getOnboardingProgress(onboarding.id);
              const daysLeft = differenceInDays(
                new Date(onboarding.target_completion_date),
                new Date()
              );

              return (
                <Card
                  key={onboarding.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedOnboarding(onboarding)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {onboarding.employee_name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {onboarding.employee_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Started {format(new Date(onboarding.start_date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
                    </div>

                    <div className="space-y-3">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-600">
                            Progress: {progress}%
                          </p>
                          <p className="text-xs text-gray-500">
                            {tasks.filter((t) => t.status === "completed").length}/{tasks.length}
                            tasks
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#1a9c5b] h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {daysLeft > 0 ? (
                          <span className="text-gray-600">
                            {daysLeft} days remaining
                          </span>
                        ) : daysLeft === 0 ? (
                          <span className="text-amber-600 font-medium">Due today</span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            {Math.abs(daysLeft)} days overdue
                          </span>
                        )}
                      </div>

                      {/* Overdue Tasks */}
                      {tasks.some(
                        (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed"
                      ) && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          {tasks.filter(
                            (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed"
                          ).length}{" "}
                          overdue task
                          {tasks.filter(
                            (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed"
                          ).length !== 1
                            ? "s"
                            : ""}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOnboarding(onboarding);
                      }}>
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="paused" className="space-y-4">
          {pausedOnboardings.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-gray-500">No paused onboardings</p>
              </CardContent>
            </Card>
          ) : (
            pausedOnboardings.map((onboarding) => (
              <Card
                key={onboarding.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                        {onboarding.employee_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {onboarding.employee_name}
                        </p>
                        <p className="text-sm text-gray-500">Paused</p>
                      </div>
                    </div>
                    {isManager && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateOnboardingStatus.mutate({
                            onboardingId: onboarding.id,
                            status: "in_progress",
                          })
                        }
                      >
                        Resume
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOnboardings.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-gray-500">No completed onboardings</p>
              </CardContent>
            </Card>
          ) : (
            completedOnboardings.map((onboarding) => (
              <Card
                key={onboarding.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                      {onboarding.employee_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {onboarding.employee_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Completed {format(new Date(onboarding.processed_at || onboarding.updated_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedOnboarding} onOpenChange={() => setSelectedOnboarding(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Onboarding for {selectedOnboarding?.employee_name}
            </DialogTitle>
            <DialogDescription>
              {selectedOnboarding?.status === "in_progress"
                ? `Target completion: ${format(
                    new Date(selectedOnboarding.target_completion_date),
                    "MMM d, yyyy"
                  )}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedOnboarding && (
            <div className="space-y-6">
              {/* Status Controls */}
              {isManager && selectedOnboarding.status === "in_progress" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateOnboardingStatus.mutate({
                        onboardingId: selectedOnboarding.id,
                        status: "paused",
                      })
                    }
                  >
                    Pause
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#1a9c5b] hover:bg-[#158a4e]"
                    onClick={() =>
                      updateOnboardingStatus.mutate({
                        onboardingId: selectedOnboarding.id,
                        status: "completed",
                      })
                    }
                  >
                    Mark Complete
                  </Button>
                </div>
              )}

              {/* Checklist */}
              <OnboardingChecklist
                tasks={getTasksForOnboarding(selectedOnboarding.id)}
                onboarding={selectedOnboarding}
                isEditable={isManager}
                onTaskStatusChange={(taskId, status) =>
                  updateTaskStatus.mutate({ taskId, status })
                }
                onAddTask={() => {
                  // Handle adding new task
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}