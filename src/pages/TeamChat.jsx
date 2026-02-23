import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Users, Search, Plus, X } from "lucide-react";
import { format } from "date-fns";

export default function TeamChat() {
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);
  const qc = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["channels"],
    queryFn: () => base44.entities.Channel.list()
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedChannel],
    queryFn: () => base44.entities.TeamMessage.filter({
      channel_id: selectedChannel
    }, '-created_at', 100),
    refetchInterval: 3000
  });

  const { data: onlineUsers = [] } = useQuery({
    queryKey: ["online-users"],
    queryFn: () => base44.entities.UserActivity.filter({
      status: 'active'
    }, '-last_active', 50),
    refetchInterval: 5000
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!messageText.trim() || !user?.email) return;

      return base44.entities.TeamMessage.create({
        channel_id: selectedChannel,
        sender_email: user.email,
        sender_name: user.full_name,
        message: messageText,
        created_at: new Date().toISOString(),
        edited: false,
        reactions: [],
        thread_id: null
      });
    },
    onSuccess: () => {
      setMessageText("");
      qc.invalidateQueries({ queryKey: ["messages", selectedChannel] });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredMessages = messages.filter(msg => 
    msg.message.toLowerCase().includes(search.toLowerCase()) ||
    msg.sender_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#1a9c5b]" />
            Team Chat
          </h1>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h2 className="text-xs font-bold text-gray-500 uppercase px-2 mb-3">Channels</h2>
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                selectedChannel === channel.id
                  ? 'bg-[#1a9c5b] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              # {channel.name}
            </button>
          ))}
          
          <Button variant="outline" className="w-full justify-start gap-2 text-gray-600 mt-2">
            <Plus className="w-4 h-4" />
            New Channel
          </Button>
        </div>

        {/* Online Users */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          <h2 className="text-xs font-bold text-gray-500 uppercase mb-3">Online ({onlineUsers.length})</h2>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {onlineUsers.map(user => (
              <div key={user.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-gray-700">{user.user_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">
              # {channels.find(c => c.id === selectedChannel)?.name || "general"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {messages.length} messages
            </p>
          </div>
          <div className="relative w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search messages"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div key={msg.id} className="flex gap-3 group">
                <div className="w-8 h-8 rounded-full bg-[#1a9c5b] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {msg.sender_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{msg.sender_name}</span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mt-1 break-words">{msg.message}</p>
                  {msg.edited && (
                    <p className="text-xs text-gray-400 mt-0.5">(edited)</p>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="text-xs">⋮</Button>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (sendMessage.mutate(), e.preventDefault())}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage.mutate()}
              disabled={sendMessage.isPending || !messageText.trim()}
              className="bg-[#1a9c5b] hover:bg-[#158a4e]"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}