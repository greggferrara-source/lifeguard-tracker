import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { format, addDays } from "date-fns";

const ONBOARDING_TEMPLATES = {
  default: [
    { title: "Complete onboarding paperwork", category: "documentation", days: 1 },
    { title: "Review company policies and employee handbook", category: "policy", days: 1 },
    { title: "Attend orientation session", category: "orientation", days: 2 },
    { title: "Receive equipment and access credentials", category: "equipment", days: 2 },
    { title: "Shadow experienced team member", category: "training", days: 5 },
    { title: "Complete mandatory safety training", category: "training", days: 7 },
    { title: "Set up communication tools and accounts", category: "equipment", days: 1 },
    { title: "First independent shift", category: "orientation", days: 10 },
  ],
};

export default function StartOnboardingDialog({
  open,
  onOpenChange,
  employee,
  onConfirm,
}) {
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [duration, setDuration] = useState(30);
  const [selectedTasks, setSelectedTasks] = useState(
    ONBOARDING_TEMPLATES.default.reduce((acc, task, idx) => {
      acc[idx] = true;
      return acc;
    }, {})
  );
  const [customTasks, setCustomTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddCustomTask = () => {
    if (newTaskTitle.trim()) {
      setCustomTasks([
        ...customTasks,
        { title: newTaskTitle, category: "other", days: 1 },
      ]);
      setNewTaskTitle("");
    }
  };

  const handleConfirm = () => {
    const tasks = [
      ...ONBOARDING_TEMPLATES.default.filter((_, idx) => selectedTasks[idx]),
      ...customTasks,
    ];

    onConfirm({
      employee_id: employee.id,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      start_date: startDate,
      target_completion_date: format(addDays(new Date(startDate), duration), "yyyy-MM-dd"),
      tasks,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start Onboarding</DialogTitle>
          <DialogDescription>
            Set up onboarding for {employee?.first_name} {employee?.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dates */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date" className="text-sm">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="duration" className="text-sm">
                  Duration (days)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-1"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Target completion: {format(addDays(new Date(startDate), duration), "MMM d, yyyy")}
            </p>
          </div>

          {/* Template Tasks */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Default Tasks</h3>
            <div className="space-y-2">
              {ONBOARDING_TEMPLATES.default.map((task, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-4 flex items-center gap-3">
                    <Checkbox
                      checked={selectedTasks[idx] || false}
                      onCheckedChange={(checked) =>
                        setSelectedTasks({ ...selectedTasks, [idx]: checked })
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.category} • Day {task.days}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Tasks */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Custom Tasks</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Add a custom task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddCustomTask()}
              />
              <Button variant="outline" onClick={handleAddCustomTask}>
                Add
              </Button>
            </div>
            {customTasks.map((task, idx) => (
              <Card key={idx} className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setCustomTasks(customTasks.filter((_, i) => i !== idx))
                    }
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#1a9c5b] hover:bg-[#158a4e]"
            onClick={handleConfirm}
          >
            Start Onboarding
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}