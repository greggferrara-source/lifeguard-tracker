import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConversationList from "@/components/communications/ConversationList";
import ChatWindow from "@/components/communications/ChatWindow";

export default function Messages() {
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [messageText, setMessageText] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages"],
    queryFn: () => base44.entities.Message.list("-created_date", 200),
    refetchInterval: 3000
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list()
  });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setMessageText("");
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.Message.update(id, {
      read: true,
      read_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    }
  });

  const handleSend = () => {
    if (!messageText.trim() || !selectedRecipient) return;

    sendMutation.mutate({
      sender_email: user.email,
      sender_name: user.full_name,
      recipient_email: selectedRecipient.email,
      recipient_name: selectedRecipient.full_name,
      content: messageText
    });
  };

  const userMessages = messages.filter(
    m => m.sender_email === user?.email || m.recipient_email === user?.email
  );

  const conversations = selectedRecipient
    ? userMessages.filter(
        m => (m.sender_email === selectedRecipient.email || m.recipient_email === selectedRecipient.email)
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

        <div className="grid grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <ConversationList
            messages={userMessages}
            employees={employees}
            selectedRecipient={selectedRecipient}
            onSelect={setSelectedRecipient}
            currentUser={user}
          />

          {/* Chat Window */}
          {selectedRecipient ? (
            <div className="col-span-2 flex flex-col bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="font-semibold">{selectedRecipient.full_name}</h2>
              </div>

              <ChatWindow
                messages={conversations}
                currentUser={user}
                onMarkAsRead={markAsReadMutation.mutate}
              />

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
              <p className="text-gray-400">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}