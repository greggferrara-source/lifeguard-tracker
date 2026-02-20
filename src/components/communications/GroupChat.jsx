import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GroupChat() {
  const [showDialog, setShowDialog] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["channels"],
    queryFn: () => base44.entities.Channel.list()
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list()
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list()
  });

  const createChannelMutation = useMutation({
    mutationFn: (data) => base44.entities.Channel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      setShowDialog(false);
    }
  });

  const filteredChannels = channels.filter(c => {
    if (filterType === "location") return c.type === "location";
    if (filterType === "team") return c.type === "team";
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="location">Location Groups</SelectItem>
            <SelectItem value="team">Team Groups</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowDialog(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> New Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChannels.map(channel => (
          <div key={channel.id} className="p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">#{channel.name}</h3>
                <p className="text-sm text-gray-500">{channel.description}</p>
                <div className="mt-2 flex gap-2">
                  {channel.type === "location" && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"><MapPin className="w-3 h-3 inline mr-1" />Location</span>}
                  {channel.type === "team" && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"><Users className="w-3 h-3 inline mr-1" />Team</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showDialog && (
        <Dialog open={true} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Group Chat</DialogTitle>
            </DialogHeader>
            <GroupCreateForm
              locations={locations}
              onSubmit={(data) => {
                createChannelMutation.mutate({
                  ...data,
                  created_by: user.email
                });
              }}
              onClose={() => setShowDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function GroupCreateForm({ locations, onSubmit, onClose }) {
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    type: "team"
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Group Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="e.g., Morning Shift Team"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="What's this group for?"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Type</label>
        <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="location">Location</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSubmit(formData)}>Create</Button>
      </DialogFooter>
    </div>
  );
}