import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import OnboardingProgressCard from "@/components/onboarding/OnboardingProgressCard";
import OnboardingTaskList from "@/components/onboarding/OnboardingTaskList";

export default function OnboardingManagement() {
  const queryClient = useQueryClient();
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [newOnboardingOpen, setNewOnboardingOpen] = useState(false);
  const [formData, setFormData] = useState({ employee_id: '', start_date: '', mentor_email: '' });

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['onboarding-workflows'],
    queryFn: () => base44.entities.OnboardingWorkflow.filter({}, '-created_at', 50)
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.filter({ status: 'active' })
  });

  const { data: trainingModules = [] } = useQuery({
    queryKey: ['training-modules'],
    queryFn: () => base44.entities.TrainingModule.filter({}, '', 50)
  });

  const initializeOnboardingMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.functions.invoke('initializeEmployeeOnboarding', {
        employee_id: data.employee_id,
        start_date: data.start_date,
        mentor_email: data.mentor_email
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-workflows'] });
      setNewOnboardingOpen(false);
      setFormData({ employee_id: '', start_date: '', mentor_email: '' });
    }
  });

  const getStatusColor = (status) => {
    const colors = {
      'not_started': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'on_hold': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.not_started;
  };

  const activeWorkflows = workflows.filter(w => w.status !== 'completed');
  const completedWorkflows = workflows.filter(w => w.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Employee Onboarding</h1>
            <p className="text-gray-600 mt-1">Manage and track employee onboarding workflows</p>
          </div>
          <Button onClick={() => setNewOnboardingOpen(true)} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
            <Plus className="w-4 h-4 mr-2" />
            Start Onboarding
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Active Onboardings</p>
              <p className="text-3xl font-bold mt-2">{activeWorkflows.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{completedWorkflows.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {workflows.filter(w => w.status === 'in_progress').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Avg. Completion</p>
              <p className="text-3xl font-bold mt-2">
                {workflows.length > 0 
                  ? Math.round(workflows.reduce((sum, w) => sum + (w.progress_percentage || 0), 0) / workflows.length)
                  : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active ({activeWorkflows.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedWorkflows.length})</TabsTrigger>
          </TabsList>

          {/* Active Workflows */}
          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin text-[#1a9c5b] mx-auto" />
              </div>
            ) : activeWorkflows.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-gray-500">
                  <p>No active onboarding workflows</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeWorkflows.map(workflow => (
                  <Card 
                    key={workflow.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{workflow.employee_name}</CardTitle>
                          <p className="text-xs text-gray-500 mt-1">{workflow.employee_email}</p>
                        </div>
                        <Badge className={getStatusColor(workflow.status)}>
                          {workflow.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold">{Math.round(workflow.progress_percentage)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1a9c5b] transition-all"
                            style={{ width: `${workflow.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          {workflow.welcome_email_sent ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span>Welcome Email</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {workflow.orientation_meeting_scheduled ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span>Orientation</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed Workflows */}
          <TabsContent value="completed">
            {completedWorkflows.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-gray-500">
                  <p>No completed onboarding workflows</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {completedWorkflows.map(workflow => (
                  <Card key={workflow.id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{workflow.employee_name}</p>
                          <p className="text-xs text-gray-500">Completed: {new Date(workflow.completed_at).toLocaleDateString()}</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Detail View */}
        {selectedWorkflow && (
          <div className="space-y-4">
            <Button variant="outline" onClick={() => setSelectedWorkflow(null)}>← Back to list</Button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <OnboardingProgressCard workflow={selectedWorkflow} />
              <div className="lg:col-span-2">
                <OnboardingTaskList workflow={selectedWorkflow} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Onboarding Dialog */}
      <Dialog open={newOnboardingOpen} onOpenChange={setNewOnboardingOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Start New Employee Onboarding</DialogTitle>
            <DialogDescription>Initialize the onboarding workflow for a new employee</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select value={formData.employee_id} onValueChange={(value) => setFormData({...formData, employee_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              />
            </div>

            <div>
              <Label>Mentor Email (optional)</Label>
              <Input
                type="email"
                placeholder="mentor@company.com"
                value={formData.mentor_email}
                onChange={(e) => setFormData({...formData, mentor_email: e.target.value})}
              />
            </div>

            <Button
              onClick={() => initializeOnboardingMutation.mutate(formData)}
              disabled={!formData.employee_id || !formData.start_date || initializeOnboardingMutation.isPending}
              className="w-full bg-[#1a9c5b] hover:bg-[#158a4e]"
            >
              {initializeOnboardingMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                'Start Onboarding'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}