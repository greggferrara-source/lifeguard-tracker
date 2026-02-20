import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ConversationList({ conversations, selectedConversation, onSelectConversation }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = conversations.filter((conv) =>
    conv.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.sender_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 border-r border-gray-200 flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv)}
            className={`p-4 border-b cursor-pointer transition-colors ${
              selectedConversation?.id === conv.id
                ? "bg-blue-50 border-blue-200"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="font-medium text-sm truncate">
              {conv.recipient_name || conv.sender_name}
            </div>
            {conv.lastMessage && (
              <div className="text-xs text-gray-500 truncate mt-1">
                {conv.lastMessage}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}