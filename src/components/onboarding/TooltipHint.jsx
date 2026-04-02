import React, { useState } from "react";
import { Lightbulb, X } from "lucide-react";

/**
 * A dismissible tooltip hint that persists dismissal in localStorage.
 * Usage: <TooltipHint id="schedule-auto-build" message="Click Auto Build Schedule to generate a full week instantly!" />
 */
export default function TooltipHint({ id, message, className = "" }) {
  const storageKey = `hint_dismissed_${id}`;
  const [visible, setVisible] = useState(() => {
    try { return !localStorage.getItem(storageKey); } catch { return true; }
  });

  if (!visible) return null;

  const dismiss = (e) => {
    e.stopPropagation();
    try { localStorage.setItem(storageKey, "1"); } catch {}
    setVisible(false);
  };

  return (
    <div className={`flex items-start gap-2.5 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 ${className}`}>
      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
      <span className="flex-1 leading-snug">{message}</span>
      <button onClick={dismiss} className="text-amber-400 hover:text-amber-600 flex-shrink-0 mt-0.5">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}