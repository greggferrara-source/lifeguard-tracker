import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function ChannelDialog({ onCreate, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "general",
    is_private: false
  });

  const handleCreate = () => {
    if (formData.name.trim()) {
      onCreate(formData);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Channel Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., announcements, general"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="What's this channel about?"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Type</label>
            <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="location">Location</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.is_private}
              onCheckedChange={(val) => setFormData({...formData, is_private: val})}
            />
            <label className="text-sm font-medium">Private channel</label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate}>Create Channel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}