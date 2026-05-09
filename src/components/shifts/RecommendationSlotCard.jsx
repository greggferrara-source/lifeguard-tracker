import React from "react";
import { Clock, CheckCircle2, User } from "lucide-react";

const PRIORITY_BADGE = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

export default function RecommendationSlotCard({ slot, isPublished }) {
  return (
    <div className="p-2 space-y-1">
      <div className="flex items-center justify-between gap-1">
        <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-600">
          <Clock className="w-3 h-3" />
          {slot.start_time}–{slot.end_time}
        </span>
        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${PRIORITY_BADGE[slot.priority] || PRIORITY_BADGE.low}`}>
          {slot.priority}
        </span>
      </div>

      {slot.assigned_employee_name ? (
        <div className={`flex items-center gap-1.5 rounded-md px-2 py-1 ${isPublished ? "bg-green-100" : "bg-white/70"}`}>
          {isPublished ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
          ) : (
            <User className="w-3.5 h-3.5 text-[#1a9c5b] flex-shrink-0" />
          )}
          <span className="text-[10px] font-semibold text-gray-800 truncate">{slot.assigned_employee_name}</span>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md px-2 py-1.5 text-center">
          <p className="text-[9px] text-gray-400">Drop employee here</p>
        </div>
      )}

      {slot.reason && (
        <p className="text-[9px] text-gray-500 leading-tight line-clamp-2">{slot.reason}</p>
      )}
    </div>
  );
}