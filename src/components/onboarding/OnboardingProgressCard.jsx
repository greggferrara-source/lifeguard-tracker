import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function OnboardingProgressCard({ workflow }) {
  if (!workflow) return null;

  const tasksCompleted = workflow.tasks?.filter(t => t.status === 'completed').length || 0;
  const totalTasks = workflow.tasks?.length || 0;
  const taskProgress = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;

  const checklistCompleted = workflow.checklist_items?.filter(i => i.completed).length || 0;
  const totalChecklist = workflow.checklist_items?.length || 0;
  const checklistProgress = totalChecklist > 0 ? (checklistCompleted / totalChecklist) * 100 : 0;

  const overallProgress = (taskProgress + checklistProgress) / 2;

  const statusColor = {
    'not_started': 'bg-gray-100 text-gray-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'on_hold': 'bg-yellow-100 text-yellow-800'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Onboarding Progress</CardTitle>
          <Badge className={statusColor[workflow.status]}>
            {workflow.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Overall Completion</p>
            <span className="text-lg font-bold">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Checklist Progress */}
        <div>
          <p className="text-sm font-medium mb-3">Onboarding Checklist</p>
          <div className="space-y-2">
            {workflow.checklist_items?.map(item => (
              <div key={item.id} className="flex items-center gap-2">
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
                <span className={`text-sm ${item.completed ? 'text-gray-600 line-through' : 'text-gray-700'}`}>
                  {item.item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Milestones */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Key Milestones</p>
          <div className="space-y-2 text-sm">
            {workflow.welcome_email_sent && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Welcome email sent</span>
              </div>
            )}
            {workflow.orientation_meeting_scheduled ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Orientation scheduled</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span>Orientation pending</span>
              </div>
            )}
            {workflow.training_modules_assigned?.length > 0 ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>{workflow.training_modules_assigned.length} training modules assigned</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span>Training modules pending</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}