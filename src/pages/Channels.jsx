import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChannelDialog from "@/components/communications/ChannelDialog.js";
import ChannelList from "@/components/communications/ChannelList.js";
import ChannelChat from "@/components/communications/ChannelChat.js";

export default function Channels() {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [messageText, setMessageText] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["channels"],
    queryFn: () => base44.entities.Channel.list()
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["channel-messages"],
    queryFn: () => base44.entities.ChannelMessage.list("-created_date", 300),
    refetchInterval: 3000
  });

  const { data: members = [] } = useQuery({
    queryKey: ["channel-members"],
    queryFn: () => base44.entities.ChannelMember.list()
  });

  const createChannelMutation = useMutation({
    mutationFn: (data) => base44.entities.Channel.create(data),
    onSuccess: (newChannel) => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      setShowDialog(false);
      setSelectedChannel(newChannel);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChannelMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channel-messages"] });
      setMessageText("");
    }
  });

  const handleSend = () => {
    if (!messageText.trim() || !selectedChannel) return;

    sendMessageMutation.mutate({
      channel_id: selectedChannel.id,
      sender_email: user.email,
      sender_name: user.full_name,
      content: messageText
    });
  };

  const channelMessages = selectedChannel
    ? messages.filter(m => m.channel_id === selectedChannel.id)
    : [];

  const channelMembersList = selectedChannel
    ? members.filter(m => m.channel_id === selectedChannel.id)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Team Channels</h1>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Channel
          </Button>
        </div>

        {showDialog && (
          <ChannelDialog
            onCreate={(data) => createChannelMutation.mutate({
              ...data,
              created_by: user.email
            })}
            onClose={() => setShowDialog(false)}
          />
        )}

        <div className="grid grid-cols-3 gap-6 h-[600px]">
          {/* Channel List */}
          <ChannelList
            channels={channels}
            selectedChannel={selectedChannel}
            onSelect={setSelectedChannel}
          />

          {/* Chat Area */}
          {selectedChannel ? (
            <div className="col-span-2 flex flex-col bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="font-semibold">{selectedChannel.name}</h2>
                <p className="text-sm text-gray-500">{channelMembersList.length} members</p>
              </div>

              <ChannelChat messages={channelMessages} currentUser={user} />

              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <Button onClick={handleSend} size="icon" disabled={!messageText.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="col-span-2 flex items-center justify-center bg-white rounded-lg border">
              <p className="text-gray-400">Select a channel to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}