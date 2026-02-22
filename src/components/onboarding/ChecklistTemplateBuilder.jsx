import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, GripVertical } from "lucide-react";

export default function ChecklistTemplateBuilder({ open, onOpenChange }) {
  const qc = useQueryClient();
  const [template, setTemplate] = useState({
    name: "",
    type: "safety",
    frequency: "daily",
    items: [{ id: "1", label: "", type: "checkbox", required: true }]
  });

  const createTemplate = useMutation({
    mutationFn: (data) => base44.entities.ChecklistTemplate.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checklist-templates"] });
      onOpenChange(false);
      setTemplate({
        name: "",
        type: "safety",
        frequency: "daily",
        items: [{ id: "1", label: "", type: "checkbox", required: true }]
      });
    }
  });

  const handleAddItem = () => {
    const newId = String(Math.max(...template.items.map(i => parseInt(i.id) || 0), 0) + 1);
    setTemplate({
      ...template,
      items: [...template.items, { id: newId, label: "", type: "checkbox", required: true }]
    });
  };

  const handleUpdateItem = (id, field, value) => {
    setTemplate({
      ...template,
      items: template.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const handleRemoveItem = (id) => {
    setTemplate({
      ...template,
      items: template.items.filter(item => item.id !== id)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!template.name || template.items.length === 0) {
      alert("Please provide a name and at least one item");
      return;
    }
    createTemplate.mutate(template);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Checklist Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Template Name *</Label>
              <Input
                required
                placeholder="e.g., Daily Safety Check"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Type</Label>
              <select
                value={template.type}
                onChange={(e) => setTemplate({ ...template, type: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="chemical">Chemical</option>
                <option value="equipment">Equipment</option>
                <option value="safety">Safety</option>
                <option value="opening">Opening</option>
                <option value="closing">Closing</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Frequency</Label>
            <select
              value={template.frequency}
              onChange={(e) => setTemplate({ ...template, frequency: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="per_shift">Per Shift</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="font-medium">Checklist Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {template.items.map((item, idx) => (
                <div key={item.id} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                  <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Item description"
                      value={item.label}
                      onChange={(e) => handleUpdateItem(item.id, "label", e.target.value)}
                      className="text-sm"
                    />
                    <select
                      value={item.type}
                      onChange={(e) => handleUpdateItem(item.id, "type", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                    >
                      <option value="checkbox">Checkbox</option>
                      <option value="number">Number</option>
                      <option value="text">Text</option>
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
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