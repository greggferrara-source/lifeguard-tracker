import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Users, CheckCheck, Check } from "lucide-react";

export default function TeamMessaging() {
  const queryClient = useQueryClient();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [selectedDM, setSelectedDM] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["channels"],
    queryFn: () => base44.entities.MessageChannel.list(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["channel-messages", selectedChannel],
    queryFn: () =>
      selectedChannel
        ? base44.entities.ChannelMessage.filter({ channel_id: selectedChannel })
        : Promise.resolve([]),
    enabled: !!selectedChannel,
  });

  const { data: directMessages = [] } = useQuery({
    queryKey: ["direct-messages", selectedDM],
    queryFn: () =>
      selectedDM
        ? base44.entities.DirectMessage.filter({ conversation_id: selectedDM })
        : Promise.resolve([]),
    enabled: !!selectedDM,
  });

  const sendChannelMessage = useMutation({
    mutationFn: async (content) => {
      const response = await base44.functions.invoke("sendChannelMessage", {
        channel_id: selectedChannel,
        content,
      });
      return response.data;
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["channel-messages", selectedChannel] });
    },
  });

  const sendDirectMessage = useMutation({
    mutationFn: async (content) => {
      const response = await base44.functions.invoke("sendDirectMessage", {
        recipient_email: selectedDM.split("_")[1],
        content,
      });
      return response.data;
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["direct-messages", selectedDM] });
    },
  });

  const markAsRead = async (messageId, messageType) => {
    await base44.functions.invoke("markMessageAsRead", {
      message_id: messageId,
      message_type: messageType,
    });
  };

  const handleSend = () => {
    if (!messageText.trim()) return;

    if (selectedChannel) {
      sendChannelMessage.mutate(messageText);
    } else if (selectedDM) {
      sendDirectMessage.mutate(messageText);
    }
  };

  const ReadReceipt = ({ readBy, sender }) => {
    if (sender !== user?.email) return null;
    if (!readBy || readBy.length === 0) return <Check className="w-4 h-4 text-gray-400" />;
    if (readBy.length === 1) return <Check className="w-4 h-4 text-blue-500" />;
    return <CheckCheck className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Channels
            </h3>
            <div className="space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => {
                    setSelectedChannel(channel.id);
                    setSelectedDM(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedChannel === channel.id
                      ? "bg-[#1a9c5b] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">#{channel.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900">
                #{channels.find((c) => c.id === selectedChannel)?.name}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex gap-3 group"
                  onMouseEnter={() => markAsRead(msg.id, "channel")}
                >
                  <div className="w-10 h-10 rounded-full bg-[#1a9c5b] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {msg.sender_name?.[0] || "?"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {msg.sender_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{msg.content}</p>
                  </div>
                  <ReadReceipt
                    readBy={msg.read_by}
                    sender={msg.sender_email}
                  />
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={sendChannelMessage.isPending || !messageText.trim()}
                  className="bg-[#1a9c5b] hover:bg-[#158a4e]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a channel or conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}