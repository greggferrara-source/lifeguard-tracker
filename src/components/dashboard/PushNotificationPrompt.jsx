import React, { useState, useEffect } from "react";
import { Bell, X, BellOff } from "lucide-react";

export default function PushNotificationPrompt() {
  const [status, setStatus] = useState(null); // null = unknown, "granted", "denied", "unsupported"
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus(Notification.permission);
  }, []);

  const handleEnable = async () => {
    const permission = await Notification.requestPermission();
    setStatus(permission);
    if (permission === "granted") {
      new Notification("LifeGuard Tracker", {
        body: "You'll now receive shift reminders and alerts.",
        icon: "/favicon.ico",
      });
    }
  };

  // Don't show if: unsupported, already granted, denied, or dismissed
  if (!status || status === "granted" || status === "unsupported" || dismissed) return null;
  if (localStorage.getItem("push_prompt_dismissed") === "true") return null;

  const handleDismiss = () => {
    localStorage.setItem("push_prompt_dismissed", "true");
    setDismissed(true);
  };

  if (status === "denied") {
    return null; // Browser blocked it, nothing we can do
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <p className="text-sm font-medium text-blue-700">
          Enable notifications to get shift reminders and alerts instantly.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleEnable}
          className="text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          Enable
        </button>
        <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 p-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}