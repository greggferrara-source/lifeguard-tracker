import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AnnouncementDialog({ announcement, onSave, onClose }) {
  const [formData, setFormData] = useState(announcement || {
    title: "",
    content: "",
    priority: "medium",
    location_id: null
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{announcement ? "Edit Announcement" : "New Announcement"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Announcement title"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Write your announcement..."
              rows={6}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Priority</label>
            <Select value={formData.priority} onValueChange={(val) => setFormData({...formData, priority: val})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({...formData, status: "published", published_at: new Date().toISOString()})}>
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}