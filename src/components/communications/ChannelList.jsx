import React from "react";
import { Card } from "@/components/ui/card";

export default function ChannelList({ channels, selectedChannel, onSelect }) {
  return (
    <Card className="p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4">Channels</h3>
      <div className="space-y-2">
        {channels.map(channel => (
          <button
            key={channel.id}
            onClick={() => onSelect(channel)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              selectedChannel?.id === channel.id
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
          >
            <p className="font-medium text-sm">#{channel.name}</p>
            <p className="text-xs text-gray-500">{channel.description}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}