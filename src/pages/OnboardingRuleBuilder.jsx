import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader, Plus, Edit2, Trash2, ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const EMPLOYEE_ROLES = ['lifeguard', 'head_lifeguard', 'supervisor', 'manager'];
const TASK_ROLES = ['HR', 'IT', 'Training', 'Compliance', 'Management'];

export default function OnboardingRuleBuilder() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 100,
    criteria: {
      roles: [],
      locations: [],
      certifications_required: [],
      training_modules: []
    },
    tasks: []
  });
  const [newTask, setNewTask] = useState({
    task_id: '',
    title: '',
    description: '',
    days_offset: 0,
    assigned_to_role: 'HR',
    depends_on: [],
    order: 0
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['onboarding-rules'],
    queryFn: () => base44.entities.OnboardingTaskRule.filter({}, '-priority', 50)
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.filter({ status: 'active' })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.OnboardingTaskRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-rules'] });
      resetForm();
      setCreateDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.OnboardingTaskRule.update(editingRule.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-rules'] });
      resetForm();
      setEditingRule(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (ruleId) => base44.entities.OnboardingTaskRule.delete(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-rules'] });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      priority: 100,
      criteria: { roles: [], locations: [], certifications_required: [], training_modules: [] },
      tasks: []
    });
    setNewTask({
      task_id: '',
      title: '',
      description: '',
      days_offset: 0,
      assigned_to_role: 'HR',
      depends_on: [],
      order: 0
    });
  };

  const handleAddTask = () => {
    if (newTask.title) {
      setFormData({
        ...formData,
        tasks: [...formData.tasks, { ...newTask, task_id: Date.now().toString() }]
      });
      setNewTask({
        task_id: '',
        title: '',
        description: '',
        days_offset: 0,
        assigned_to_role: 'HR',
        depends_on: [],
        order: 0
      });
    }
  };

  const handleRemoveTask = (index) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    const payload = {
      ...formData,
      created_by_email: 'admin@company.com'
    };

    if (editingRule) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('OnboardingManagement')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Onboarding Task Rules</h1>
              <p className="text-gray-600 mt-1">Define custom rules for automatic task assignment</p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        </div>

        {/* Rules Grid */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 animate-spin text-[#1a9c5b] mx-auto" />
            </div>
          ) : rules.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center text-gray-500">
                <p>No rules defined yet. Create your first rule to automate task assignment.</p>
              </CardContent>
            </Card>
          ) : (
            rules.map(rule => (
              <Card key={rule.id} className="border-l-4 border-[#1a9c5b]">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{rule.name}</CardTitle>
                        <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                          {rule.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">Priority: {rule.priority}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setFormData(rule);
                          setEditingRule(rule);
                          setCreateDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteMutation.mutate(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Criteria Summary */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {rule.criteria?.roles?.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Roles</p>
                        <div className="flex flex-wrap gap-1">
                          {rule.criteria.roles.map(r => (
                            <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {rule.criteria?.locations?.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Locations</p>
                        <div className="flex flex-wrap gap-1">
                          {rule.criteria.locations.map(l => (
                            <Badge key={l} variant="outline" className="text-xs">{locations.find(x => x.id === l)?.name || l}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tasks Summary */}
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">Tasks ({rule.tasks?.length || 0})</p>
                    <div className="space-y-1">
                      {rule.tasks?.map((task, idx) => (
                        <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <span className="font-medium">{task.title}</span> - Due in {task.days_offset} days
                          {task.depends_on?.length > 0 && <span className="ml-2 text-gray-500">(depends on {task.depends_on.length} task)</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Rule Editor Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
            <DialogDescription>Define criteria and tasks for automatic assignment</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Rule Details</h3>
              <div>
                <Label>Rule Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Lifeguard Onboarding"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="When does this rule apply?"
                />
              </div>
              <div>
                <Label>Priority (higher executes first)</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
            </div>

            {/* Criteria */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Matching Criteria</h3>
              <div>
                <Label className="mb-2 block">Employee Roles</Label>
                <div className="space-y-2">
                  {EMPLOYEE_ROLES.map(role => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.criteria.roles.includes(role)}
                        onCheckedChange={(checked) => {
                          const roles = checked
                            ? [...formData.criteria.roles, role]
                            : formData.criteria.roles.filter(r => r !== role);
                          setFormData({
                            ...formData,
                            criteria: { ...formData.criteria, roles }
                          });
                        }}
                      />
                      <span className="text-sm text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Locations</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {locations.map(location => (
                    <label key={location.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.criteria.locations.includes(location.id)}
                        onCheckedChange={(checked) => {
                          const locs = checked
                            ? [...formData.criteria.locations, location.id]
                            : formData.criteria.locations.filter(l => l !== location.id);
                          setFormData({
                            ...formData,
                            criteria: { ...formData.criteria, locations: locs }
                          });
                        }}
                      />
                      <span className="text-sm text-gray-700">{location.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Tasks to Assign</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <Input
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                <Input
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Days until due</Label>
                    <Input
                      type="number"
                      value={newTask.days_offset}
                      onChange={(e) => setNewTask({ ...newTask, days_offset: parseInt(e.target.value) })}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Assigned to</Label>
                    <select
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      value={newTask.assigned_to_role}
                      onChange={(e) => setNewTask({ ...newTask, assigned_to_role: e.target.value })}
                    >
                      {TASK_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button onClick={handleAddTask} variant="outline" className="w-full" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>

              {/* Task List */}
              {formData.tasks.length > 0 && (
                <div className="space-y-2">
                  {formData.tasks.map((task, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-gray-600">Due in {task.days_offset} days • {task.assigned_to_role}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTask(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || formData.tasks.length === 0 || createMutation.isPending}
              className="bg-[#1a9c5b] hover:bg-[#158a4e]"
            >
              {createMutation.isPending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}