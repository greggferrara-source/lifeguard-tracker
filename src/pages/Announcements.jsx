import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnnouncementDialog from "@/components/communications/AnnouncementDialog.js";
import AnnouncementCard from "@/components/communications/AnnouncementCard.js";

export default function Announcements() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const queryClient = useQueryClient();

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => base44.entities.Announcement.list("-published_at", 100)
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Announcement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setShowDialog(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Announcement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setSelectedAnnouncement(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Announcement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    }
  });

  const publishedAnnouncements = announcements.filter(a => a.status === "published");
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-600 mt-2">Team updates and important messages</p>
          </div>
          {isAdmin && (
            <Button onClick={() => {
              setSelectedAnnouncement(null);
              setShowDialog(true);
            }} className="gap-2">
              <Plus className="w-4 h-4" />
              New Announcement
            </Button>
          )}
        </div>

        {/* Dialog */}
        {showDialog && (
          <AnnouncementDialog
            announcement={selectedAnnouncement}
            onSave={(data) => {
              if (selectedAnnouncement) {
                updateMutation.mutate({ id: selectedAnnouncement.id, data });
              } else {
                createMutation.mutate({ ...data, author_name: user.full_name });
              }
            }}
            onClose={() => setShowDialog(false)}
          />
        )}

        {/* Announcements List */}
        <div className="space-y-4">
          {publishedAnnouncements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No announcements yet</p>
              </CardContent>
            </Card>
          ) : (
            publishedAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onEdit={() => {
                  setSelectedAnnouncement(announcement);
                  setShowDialog(true);
                }}
                onDelete={() => deleteMutation.mutate(announcement.id)}
                onArchive={() => updateMutation.mutate({
                  id: announcement.id,
                  data: { status: "archived" }
                })}
                isAdmin={isAdmin}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}