import React, { useEffect, useRef } from "react";

export default function ChatWindow({ messages, currentUser, onMarkAsRead }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    
    messages.forEach(msg => {
      if (msg.recipient_email === currentUser?.email && !msg.read) {
        onMarkAsRead({ id: msg.id });
      }
    });
  }, [messages, currentUser, onMarkAsRead]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`flex ${msg.sender_email === currentUser?.email ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs px-4 py-2 rounded-lg ${
              msg.sender_email === currentUser?.email
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-900"
            }`}
          >
            <p className="text-sm">{msg.content}</p>
            <p className="text-xs mt-1 opacity-70">
              {new Date(msg.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}