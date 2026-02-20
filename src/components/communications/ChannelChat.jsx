import React, { useEffect, useRef } from "react";

export default function ChannelChat({ messages, currentUser }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(msg => (
        <div key={msg.id} className="space-y-1">
          <div className="flex items-baseline gap-2">
            <p className="font-medium text-sm">{msg.sender_name}</p>
            <p className="text-xs text-gray-500">
              {new Date(msg.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <p className="text-sm text-gray-700 ml-2">{msg.content}</p>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}