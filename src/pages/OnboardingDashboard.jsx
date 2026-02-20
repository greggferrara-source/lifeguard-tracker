import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, AlertCircle, Clock, Search, Filter, Download, FileText } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist";

export default function OnboardingDashboard() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [sortBy, setSortBy] = useState("recent");

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

  const getTasksForOnboarding = (onboardingId) =>
    onboardingTasks.filter((t) => t.onboarding_id === onboardingId);

  const getOnboardingProgress = (onboardingId) => {
    const tasks = getTasksForOnboarding(onboardingId);
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  };

  const isManager = user?.role === "admin" || user?.role === "manager";

  const filtered = useMemo(() => {
    let result = onboardings;

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Search filter
    if (search) {
      result = result.filter((o) =>
        o.employee_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "progress") {
      result.sort((a, b) => getOnboardingProgress(b.id) - getOnboardingProgress(a.id));
    } else if (sortBy === "dueDate") {
      result.sort((a, b) => new Date(a.target_completion_date) - new Date(b.target_completion_date));
    }

    return result;
  }, [onboardings, statusFilter, search, sortBy]);

  const stats = useMemo(() => ({
    inProgress: onboardings.filter((o) => o.status === "in_progress").length,
    completed: onboardings.filter((o) => o.status === "completed").length,
    paused: onboardings.filter((o) => o.status === "paused").length,
    atRisk: filtered.filter(
      (o) =>
        o.status === "in_progress" &&
        differenceInDays(new Date(o.target_completion_date), new Date()) <= 3 &&
        differenceInDays(new Date(o.target_completion_date), new Date()) > 0
    ).length,
  }), [onboardings, filtered]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Onboarding Dashboard</h1>
        <p className="text-gray-400 mt-2 text-lg">Manage and track new hire onboarding progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "In Progress", value: stats.inProgress, color: "text-blue-600", icon: Clock },
          { label: "Completed", value: stats.completed, color: "text-green-600", icon: CheckCircle2 },
          { label: "Paused", value: stats.paused, color: "text-amber-600", icon: AlertCircle },
          { label: "At Risk", value: stats.atRisk, color: "text-red-600", icon: AlertCircle },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                  <Icon className={`w-5 h-5 ${s.color} opacity-40`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="progress">By Progress</SelectItem>
            <SelectItem value="dueDate">Due Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Onboarding List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-500">No onboardings found</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((onboarding) => {
            const tasks = getTasksForOnboarding(onboarding.id);
            const progress = getOnboardingProgress(onboarding.id);
            const daysLeft = differenceInDays(
              new Date(onboarding.target_completion_date),
              new Date()
            );
            const isAtRisk = daysLeft <= 3 && daysLeft > 0;

            return (
              <Card
                key={onboarding.id}
                className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${
                  onboarding.status === "completed"
                    ? "border-l-green-500"
                    : onboarding.status === "paused"
                    ? "border-l-amber-500"
                    : isAtRisk
                    ? "border-l-red-500"
                    : "border-l-blue-500"
                }`}
                onClick={() => setSelectedOnboarding(onboarding)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                        {onboarding.employee_name?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-lg">
                          {onboarding.employee_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Started {format(new Date(onboarding.start_date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          onboarding.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : onboarding.status === "paused"
                            ? "bg-amber-100 text-amber-700"
                            : isAtRisk
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      >
                        {onboarding.status}
                        {isAtRisk && " - Due Soon"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
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
                        <span className={isAtRisk ? "text-red-600 font-medium" : "text-gray-600"}>
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
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedOnboarding} onOpenChange={() => setSelectedOnboarding(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Onboarding for {selectedOnboarding?.employee_name}</DialogTitle>
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
                <div className="flex gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
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