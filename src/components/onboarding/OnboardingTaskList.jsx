import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function OnboardingTaskList({ workflow }) {
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async (updatedWorkflow) => {
      await base44.entities.OnboardingWorkflow.update(workflow.id, updatedWorkflow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-workflows'] });
    }
  });

  const handleTaskComplete = (taskId) => {
    const updatedTasks = workflow.tasks.map(t =>
      t.id === taskId
        ? { ...t, status: 'completed', completed_date: new Date().toISOString() }
        : t
    );

    updateTaskMutation.mutate({
      tasks: updatedTasks,
      progress_percentage: (updatedTasks.filter(t => t.status === 'completed').length / workflow.tasks.length) * 100
    });
  };

  const statusStyles = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Onboarding Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workflow.tasks?.map(task => (
            <div key={task.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleTaskComplete(task.id)}
                  className="mt-1 flex-shrink-0"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </button>

                <div className="flex-1">
                  <p className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                <Badge className={statusStyles[task.status]} variant="outline">
                  {task.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}