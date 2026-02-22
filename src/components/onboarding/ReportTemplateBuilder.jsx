import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

export default function ReportTemplateBuilder({ open, onOpenChange }) {
  const qc = useQueryClient();
  const [template, setTemplate] = useState({
    name: "",
    description: "",
    category: "safety",
    fields: [{ id: "1", label: "", type: "pass_fail", required: true }],
    alert_email: "",
    is_active: true
  });

  const createTemplate = useMutation({
    mutationFn: (data) => base44.entities.OperationalForm.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["report-templates"] });
      onOpenChange(false);
      setTemplate({
        name: "",
        description: "",
        category: "safety",
        fields: [{ id: "1", label: "", type: "pass_fail", required: true }],
        alert_email: "",
        is_active: true
      });
    }
  });

  const handleAddField = () => {
    const newId = String(Math.max(...template.fields.map(f => parseInt(f.id) || 0), 0) + 1);
    setTemplate({
      ...template,
      fields: [...template.fields, { id: newId, label: "", type: "pass_fail", required: true }]
    });
  };

  const handleUpdateField = (id, field, value) => {
    setTemplate({
      ...template,
      fields: template.fields.map(f =>
        f.id === id ? { ...f, [field]: value } : f
      )
    });
  };

  const handleRemoveField = (id) => {
    setTemplate({
      ...template,
      fields: template.fields.filter(f => f.id !== id)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!template.name || template.fields.length === 0) {
      alert("Please provide a name and at least one field");
      return;
    }
    createTemplate.mutate(template);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Report Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Template Name *</Label>
            <Input
              required
              placeholder="e.g., Incident Report"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="What is this report for?"
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              rows={2}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <select
                value={template.category}
                onChange={(e) => setTemplate({ ...template, category: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="vehicle">Vehicle</option>
                <option value="equipment">Equipment</option>
                <option value="safety">Safety</option>
                <option value="training">Training</option>
                <option value="facility">Facility</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label>Alert Email (optional)</Label>
              <Input
                type="email"
                placeholder="admin@facility.com"
                value={template.alert_email}
                onChange={(e) => setTemplate({ ...template, alert_email: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="font-medium">Report Fields</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddField}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Field
              </Button>
            </div>

            <div className="space-y-3">
              {template.fields.map((field) => (
                <div key={field.id} className="p-3 border border-gray-200 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Field label"
                      value={field.label}
                      onChange={(e) => handleUpdateField(field.id, "label", e.target.value)}
                      className="text-sm"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => handleUpdateField(field.id, "type", e.target.value)}
                      className="w-full px-2 py-2 border border-gray-200 rounded text-sm"
                    >
                      <option value="pass_fail">Pass/Fail</option>
                      <option value="yes_no">Yes/No</option>
                      <option value="number">Number</option>
                      <option value="text">Text</option>
                      <option value="select">Select</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`required-${field.id}`}
                        checked={field.required}
                        onChange={(e) => handleUpdateField(field.id, "required", e.target.checked)}
                        className="cursor-pointer"
                      />
                      <label htmlFor={`required-${field.id}`} className="text-sm cursor-pointer">
                        Required
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveField(field.id)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={createTemplate.isPending}>
              {createTemplate.isPending ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}