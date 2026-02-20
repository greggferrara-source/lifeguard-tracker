import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Archive, Edit2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AnnouncementCard({ announcement, onEdit, onDelete, onArchive, isAdmin }) {
  const [showComments, setShowComments] = useState(false);

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800"
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{announcement.title}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge className={priorityColors[announcement.priority]}>
                {announcement.priority}
              </Badge>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(announcement.created_date), { addSuffix: true })}
              </span>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onArchive}>
                <Archive className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
        <div className="text-xs text-gray-500 mt-4">By {announcement.author_name}</div>
      </CardContent>
    </Card>
  );
}