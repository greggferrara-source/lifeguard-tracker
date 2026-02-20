import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ConversationList({ messages, employees, selectedRecipient, onSelect, currentUser }) {
  const conversations = new Map();

  messages.forEach(msg => {
    const otherEmail = msg.sender_email === currentUser?.email ? msg.recipient_email : msg.sender_email;
    const otherName = msg.sender_email === currentUser?.email ? msg.recipient_name : msg.sender_name;
    
    if (!conversations.has(otherEmail)) {
      conversations.set(otherEmail, { email: otherEmail, name: otherName, lastMessage: msg });
    } else {
      const conv = conversations.get(otherEmail);
      if (new Date(msg.created_date) > new Date(conv.lastMessage.created_date)) {
        conv.lastMessage = msg;
      }
    }
  });

  const unreadCount = messages.filter(m => m.recipient_email === currentUser?.email && !m.read).length;

  return (
    <Card className="p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4">Conversations {unreadCount > 0 && <Badge>{unreadCount}</Badge>}</h3>
      <div className="space-y-2">
        {Array.from(conversations.values()).map(conv => (
          <button
            key={conv.email}
            onClick={() => onSelect(employees.find(e => e.email === conv.email))}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              selectedRecipient?.email === conv.email
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
          >
            <p className="font-medium text-sm">{conv.name}</p>
            <p className="text-xs text-gray-500 truncate">{conv.lastMessage.content}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}