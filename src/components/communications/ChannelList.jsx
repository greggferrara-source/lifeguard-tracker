import React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Lock } from "lucide-react";

export default function ChannelList({ channels, selectedChannel, onSelectChannel, onCreateNew }) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filtered = channels.filter((ch) =>
    ch.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 border-r border-gray-200 flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((channel) => (
          <div
            key={channel.id}
            onClick={() => onSelectChannel(channel)}
            className={`p-4 border-b cursor-pointer transition-colors ${
              selectedChannel?.id === channel.id
                ? "bg-blue-50 border-blue-200"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              {channel.is_private && <Lock className="w-3 h-3 text-gray-400" />}
              <div className="font-medium text-sm truncate">{channel.name}</div>
              {channel.type && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {channel.type}
                </Badge>
              )}
            </div>
            {channel.description && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {channel.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}