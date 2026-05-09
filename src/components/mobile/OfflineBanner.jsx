import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

export default function OfflineBanner({ onSync, queueCount = 0, syncing = false }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustCameOnline(true);
      setTimeout(() => setJustCameOnline(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setJustCameOnline(false);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !justCameOnline && queueCount === 0) return null;

  if (!isOnline) {
    return (
      <div className="bg-yellow-500 text-yellow-900 px-4 py-2.5 flex items-center gap-3">
        <WifiOff className="w-4 h-4 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-bold">You're offline</p>
          <p className="text-[10px] opacity-80">Actions will sync automatically when you reconnect</p>
        </div>
        {queueCount > 0 && (
          <span className="text-xs font-bold bg-yellow-900/20 px-2 py-0.5 rounded-full">
            {queueCount} queued
          </span>
        )}
      </div>
    );
  }

  if (justCameOnline) {
    return (
      <div className="bg-green-500 text-white px-4 py-2.5 flex items-center gap-3 animate-pulse">
        <Wifi className="w-4 h-4 flex-shrink-0" />
        <p className="text-xs font-bold flex-1">Back online!</p>
      </div>
    );
  }

  if (queueCount > 0 && isOnline) {
    return (
      <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center gap-3">
        <RefreshCw className={`w-4 h-4 flex-shrink-0 ${syncing ? "animate-spin" : ""}`} />
        <p className="text-xs font-bold flex-1">{queueCount} action{queueCount > 1 ? "s" : ""} pending sync</p>
        {onSync && (
          <button
            onClick={onSync}
            disabled={syncing}
            className="text-xs font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full transition-colors"
          >
            {syncing ? "Syncing..." : "Sync now"}
          </button>
        )}
      </div>
    );
  }

  return null;
}