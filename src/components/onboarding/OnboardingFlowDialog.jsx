import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { addDays, format } from "date-fns";

export default function OnboardingFlowDialog({ open, onOpenChange, employees = [] }) {
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    employee_id: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    target_completion_date: format(addDays(new Date(), 14), "yyyy-MM-dd"),
    include_profile: true,
    include_training: true,
    include_equipment: true
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["training-modules"],
    queryFn: () => base44.entities.TrainingModule.list()
  });

  const createOnboarding = useMutation({
    mutationFn: async (data) => {
      const employee = employees.find(e => e.id === data.employee_id);
      
      // Create onboarding record
      const onboarding = await base44.entities.Onboarding.create({
        employee_id: data.employee_id,
        employee_name: employee?.first_name + " " + employee?.last_name,
        status: "in_progress",
        start_date: data.start_date,
        target_completion_date: data.target_completion_date,
        progress_percentage: 0
      });

      // Create tasks based on selections
      const tasks = [];
      let order = 1;

      if (data.include_profile) {
        tasks.push({
          onboarding_id: onboarding.id,
          employee_id: data.employee_id,
          employee_name: employee?.first_name + " " + employee?.last_name,
          title: "Complete Profile Setup",
          description: "Update personal information, contact details, and emergency contacts",
          category: "documentation",
          status: "pending",
          display_order: order++,
          due_date: data.start_date,
          is_required: true
        });
      }

      tasks.push({
        onboarding_id: onboarding.id,
        employee_id: data.employee_id,
        employee_name: employee?.first_name + " " + employee?.last_name,
        title: "Role Assignment & Permissions",
        description: "Assign employee role, access levels, and certifications",
        category: "orientation",
        status: "pending",
        display_order: order++,
        due_date: data.start_date,
        is_required: true
      });

      if (data.include_training && modules.length > 0) {
        modules.slice(0, 3).forEach(module => {
          tasks.push({
            onboarding_id: onboarding.id,
            employee_id: data.employee_id,
            employee_name: employee?.first_name + " " + employee?.last_name,
            title: `Complete: ${module.title}`,
            description: `${module.description}`,
            category: "training",
            status: "pending",
            display_order: order++,
            due_date: format(addDays(new Date(data.start_date), 3), "yyyy-MM-dd"),
            is_required: true
          });
        });
      }

      if (data.include_equipment) {
        tasks.push({
          onboarding_id: onboarding.id,
          employee_id: data.employee_id,
          employee_name: employee?.first_name + " " + employee?.last_name,
          title: "Equipment & Access Setup",
          description: "Issue badge, keys, equipment assignments, and access credentials",
          category: "equipment",
          status: "pending",
          display_order: order++,
          due_date: format(addDays(new Date(data.start_date), 1), "yyyy-MM-dd"),
          is_required: true
        });
      }

      // Create all tasks
      await base44.entities.OnboardingTask.bulkCreate(tasks);

      return onboarding;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["onboardings"] });
      qc.invalidateQueries({ queryKey: ["onboarding-tasks"] });
      onOpenChange(false);
      setFormData({
        employee_id: "",
        start_date: format(new Date(), "yyyy-MM-dd"),
        target_completion_date: format(addDays(new Date(), 14), "yyyy-MM-dd"),
        include_profile: true,
        include_training: true,
        include_equipment: true
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employee_id) {
      alert("Please select an employee");
      return;
    }
    createOnboarding.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Start Employee Onboarding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Employee *</Label>
            <select
              required
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">Select employee...</option>
              {employees.filter(e => e.status === "active").map(e => (
                <option key={e.id} value={e.id}>
                  {e.first_name} {e.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Target Completion</Label>
              <Input
                type="date"
                value={formData.target_completion_date}
                onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-3 block">Include in Onboarding</Label>
            <div className="space-y-2">
              {[
                { key: "include_profile", label: "Profile Completion - Personal info, contacts, etc." },
                { key: "include_training", label: "Training Materials - Required courses & modules" },
                { key: "include_equipment", label: "Equipment Setup - Badges, keys, access setup" }
              ].map(item => (
                <div key={item.key} className="flex items-center gap-2">
                  <Checkbox
                    id={item.key}
                    checked={formData[item.key]}
                    onCheckedChange={(v) => setFormData({ ...formData, [item.key]: v })}
                  />
                  <label htmlFor={item.key} className="text-sm cursor-pointer">{item.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={createOnboarding.isPending}>
              {createOnboarding.isPending ? "Creating..." : "Start Onboarding"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}