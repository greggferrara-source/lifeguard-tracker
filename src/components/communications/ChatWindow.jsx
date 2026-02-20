import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function ChatWindow({ conversation, messages }) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {conversation ? (
        <>
          <CardHeader className="border-b border-gray-200">
            <CardTitle>{conversation.recipient_name || conversation.sender_name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages && messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_email === conversation.sender_email ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender_email === conversation.sender_email
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {format(new Date(msg.created_date), "HH:mm")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 mt-8">
                No messages yet. Start a conversation!
              </div>
            )}
          </CardContent>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Select a conversation to start messaging
        </div>
      )}
    </div>
  );
}