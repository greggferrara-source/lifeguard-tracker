import React from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default function ChannelChat({ channel, messages }) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {channel ? (
        <>
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2">
              #{channel.name}
            </CardTitle>
            {channel.description && (
              <p className="text-sm text-gray-600 font-normal">{channel.description}</p>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages && messages.length > 0 ? (
              messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm">{msg.sender_name}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(msg.created_date), "HH:mm")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{msg.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 mt-8">
                No messages yet. Start chatting!
              </div>
            )}
          </CardContent>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Select a channel to view messages
        </div>
      )}
    </div>
  );
}