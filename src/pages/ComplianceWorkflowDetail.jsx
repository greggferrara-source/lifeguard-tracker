import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, FileText, ExternalLink, AlertTriangle, ArrowLeft } from "lucide-react";
import { format, parse } from "date-fns";

export default function ComplianceWorkflowDetail() {
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('id');
  const qc = useQueryClient();

  const { data: workflow } = useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: () => workflowId ? base44.entities.ComplianceWorkflow.filter({ id: workflowId }, '', 1).then(r => r[0]) : null,
    enabled: !!workflowId
  });

  const { data: steps = [] } = useQuery({
    queryKey: ["workflow-steps", workflowId],
    queryFn: () => workflowId ? base44.entities.ComplianceWorkflowStep.filter({ workflow_id: workflowId }, 'step_number', 100) : [],
    enabled: !!workflowId
  });

  const completeStep = useMutation({
    mutationFn: async (step) => {
      return base44.entities.ComplianceWorkflowStep.update(step.id, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflow-steps", workflowId] });
      qc.invalidateQueries({ queryKey: ["workflow", workflowId] });
    }
  });

  const toggleChecklist = useMutation({
    mutationFn: async (stepId, checklistItemId) => {
      const step = steps.find(s => s.id === stepId);
      if (!step) return;
      
      const updatedItems = step.checklist_items.map(item =>
        item.id === checklistItemId
          ? { ...item, completed: !item.completed, completed_at: new Date().toISOString() }
          : item
      );

      return base44.entities.ComplianceWorkflowStep.update(stepId, {
        checklist_items: updatedItems
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflow-steps", workflowId] });
    }
  });

  if (!workflow) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Workflow not found</p>
        </div>
      </div>
    );
  }

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progressPercent = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" className="text-gray-600 -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workflows
        </Button>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{workflow.title}</h1>
          <p className="text-gray-600">{workflow.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={
            workflow.priority === 'critical' ? 'bg-red-100 text-red-800' :
            workflow.priority === 'high' ? 'bg-orange-100 text-orange-800' :
            'bg-blue-100 text-blue-800'
          }>
            {workflow.priority} priority
          </Badge>
          <Badge className={
            workflow.status === 'completed' ? 'bg-green-100 text-green-800' :
            workflow.status === 'active' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }>
            {workflow.status}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Overall Progress</h3>
              <span className="text-2xl font-bold text-[#1a9c5b]">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a9c5b] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">{completedSteps} of {steps.length} steps completed</p>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 uppercase">Location</p>
              <p className="font-medium text-gray-900">{workflow.location_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Due Date</p>
              <p className="font-medium text-gray-900">
                {format(parse(workflow.due_date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Assigned To</p>
              <p className="font-medium text-gray-900">{workflow.assigned_to_name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estimated Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1a9c5b]" />
              <span className="font-medium text-gray-900">{workflow.estimated_hours} hours</span>
            </div>
            <p className="text-sm text-gray-600">Based on complexity of tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Workflow Steps</h2>
        
        {steps.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No steps defined for this workflow</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <Card key={step.id} className={step.status === 'completed' ? 'opacity-75' : ''}>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* Step Header */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Step {step.step_number}: {step.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          </div>
                          <Badge className="bg-gray-100 text-gray-800 text-xs">
                            {step.type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Checklist Items */}
                    {step.checklist_items && step.checklist_items.length > 0 && (
                      <div className="ml-10 space-y-2">
                        <p className="text-xs font-semibold text-gray-700 uppercase">Checklist</p>
                        {step.checklist_items.map(item => (
                          <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => toggleChecklist.mutate(step.id, item.id)}
                              className="rounded border-gray-300"
                            />
                            <span className={item.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                              {item.item}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Resources */}
                    {step.resources && step.resources.length > 0 && (
                      <div className="ml-10 space-y-2">
                        <p className="text-xs font-semibold text-gray-700 uppercase">Resources</p>
                        {step.resources.map((resource, ridx) => (
                          <a
                            key={ridx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[#1a9c5b] hover:underline text-sm"
                          >
                            <FileText className="w-4 h-4" />
                            {resource.title}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Complete Step Button */}
                    {step.status !== 'completed' && (
                      <div className="ml-10 pt-2">
                        <Button
                          size="sm"
                          onClick={() => completeStep.mutate(step)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Mark as Complete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}