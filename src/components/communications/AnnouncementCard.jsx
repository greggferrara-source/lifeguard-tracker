import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { format } from "date-fns";

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-slate-100 text-slate-800"
};

export default function AnnouncementCard({ announcement, onEdit, onDelete }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{announcement.title}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge className={priorityColors[announcement.priority]}>
                {announcement.priority}
              </Badge>
              <Badge className={statusColors[announcement.status]}>
                {announcement.status}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => onEdit(announcement)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(announcement.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">{announcement.content}</p>
        <div className="text-xs text-gray-500">
          By {announcement.author_name} • {format(new Date(announcement.created_date), "MMM d, yyyy")}
        </div>
      </CardContent>
    </Card>
  );
}