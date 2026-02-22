import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Edit, Trash2, Play, Settings, ChevronRight, Check, Clock,
  AlertCircle, Zap, FileText
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TRIGGER_TYPES = {
  document_upload: { label: "Document Uploaded", icon: FileText },
  asset_status_change: { label: "Asset Status Changes", icon: Settings },
  certification_expiry: { label: "Certification Expiring", icon: AlertCircle },
  incident_logged: { label: "Incident Logged", icon: AlertCircle },
  pool_test_result: { label: "Pool Test Result", icon: Zap },
  manual: { label: "Manual Trigger", icon: Play }
};

const ACTION_TYPES = [
  { value: 'create_task', label: 'Create Maintenance Task' },
  { value: 'create_assessment', label: 'Create Compliance Assessment' },
  { value: 'send_notification', label: 'Send Notification' },
  { value: 'update_entity', label: 'Update Entity' },
  { value: 'approval_gate', label: 'Approval Gate' }
];

export default function WorkflowAutomation() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'document_upload',
    steps: [{ id: '1', order: 1, action_type: 'send_notification', action_config: {}, requires_approval: false }]
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.Workflow.list('-created_date', 100)
  });

  const { data: executions = [] } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: () => base44.entities.WorkflowExecution.list('-started_at', 50),
    refetchInterval: 10000
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Workflow.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setDialogOpen(false);
      setFormData({ name: '', description: '', trigger_type: 'document_upload', steps: [] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Workflow.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] })
  });

  const handleSubmit = () => {
    if (formData.name && formData.steps.length > 0) {
      createMutation.mutate(formData);
    }
  };

  const addStep = () => {
    const newSteps = [...formData.steps];
    newSteps.push({
      id: String(Math.random()),
      order: newSteps.length + 1,
      action_type: 'send_notification',
      action_config: {},
      requires_approval: false
    });
    setFormData({ ...formData, steps: newSteps });
  };

  const removeStep = (index) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      paused: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Workflow Automation</h1>
            <p className="text-gray-600 mt-2">Create automated workflows that trigger actions across your facility</p>
          </div>
          <Button
            onClick={() => { setEditingWorkflow(null); setDialogOpen(true); }}
            className="bg-[#1a9c5b] hover:bg-[#158a4e]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>

        {/* Workflows Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {workflows.map((workflow) => {
            const triggerConfig = TRIGGER_TYPES[workflow.trigger_type];
            return (
              <Card key={workflow.id} className="border-2 hover:border-[#1a9c5b] transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {triggerConfig?.icon && <triggerConfig.icon className="w-5 h-5 text-[#1a9c5b]" />}
                        {workflow.name}
                        {workflow.enabled && <Badge className="ml-auto bg-green-100 text-green-800 text-xs">Active</Badge>}
                      </CardTitle>
                      <CardDescription className="mt-1">{workflow.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Trigger: {triggerConfig?.label}</p>
                      <p className="text-sm text-gray-600">{workflow.steps?.length || 0} step{workflow.steps?.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Steps:</p>
                      {workflow.steps?.map((step, idx) => (
                        <div key={step.id} className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#1a9c5b] text-white flex items-center justify-center text-xs">{idx + 1}</span>
                          {ACTION_TYPES.find(a => a.value === step.action_type)?.label}
                          {step.requires_approval && <Badge className="bg-orange-100 text-orange-800 text-xs">Needs Approval</Badge>}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="text-xs flex-1">
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs flex-1 text-red-600"
                        onClick={() => deleteMutation.mutate(workflow.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Executions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Executions</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {executions.slice(0, 10).map((exec) => (
                  <div key={exec.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{exec.workflow_name}</p>
                      <p className="text-sm text-gray-600">{exec.trigger_entity_type} - {new Date(exec.started_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(exec.status)}>
                        {exec.status === 'in_progress' && <Clock className="w-3 h-3 mr-1" />}
                        {exec.status === 'completed' && <Check className="w-3 h-3 mr-1" />}
                        {exec.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Workflow</DialogTitle>
            <DialogDescription>Define an automated workflow with multiple steps</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Workflow Name</label>
              <Input
                placeholder="e.g., Document Upload Compliance Check"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
              <Textarea
                placeholder="What does this workflow do?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Trigger</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={formData.trigger_type}
                onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
              >
                {Object.entries(TRIGGER_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Steps</label>
              <div className="space-y-2">
                {formData.steps?.map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="font-semibold text-gray-500">{idx + 1}</span>
                    <select
                      className="flex-1 border border-gray-300 rounded p-1 text-sm"
                      value={step.action_type}
                      onChange={(e) => {
                        const newSteps = [...formData.steps];
                        newSteps[idx].action_type = e.target.value;
                        setFormData({ ...formData, steps: newSteps });
                      }}
                    >
                      {ACTION_TYPES.map(a => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(idx)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addStep} className="mt-2 w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Step
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-[#1a9c5b] hover:bg-[#158a4e]">Create Workflow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}