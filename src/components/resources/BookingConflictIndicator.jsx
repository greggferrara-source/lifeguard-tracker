import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BookingConflictIndicator({ conflicts, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Checking for conflicts...</p>
      </div>
    );
  }

  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <p className="text-sm font-medium text-green-800">No conflicts - Ready to book</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <p className="text-sm font-medium text-red-800">{conflicts.length} booking conflict(s)</p>
      </div>
      <div className="space-y-1">
        {conflicts.map((conflict, idx) => (
          <div key={idx} className="text-xs text-red-700 bg-white rounded p-1.5">
            <p className="font-medium">{conflict.title}</p>
            <p className="text-red-600">{conflict.booked_by} • {conflict.start}</p>
          </div>
        ))}
      </div>
    </div>
  );
}