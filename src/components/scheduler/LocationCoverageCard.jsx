import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Plus, Users } from "lucide-react";

export default function LocationCoverageCard({ location, shifts, employees, days, onAddShift }) {
  const getShiftsForDay = (date) =>
    shifts.filter(s => s.location_id === location.id && s.date === date && s.status !== "cancelled");

  const getStaffedCount = (date) => {
    const dayShifts = getShiftsForDay(date);
    return dayShifts.filter(s => s.employee_id).length;
  };

  const minRequired = location.min_guards_required || 1;

  const weekCoverage = days.map(day => {
    const dateStr = day.toISOString().split("T")[0];
    const staffed = getStaffedCount(dateStr);
    const dayShifts = getShiftsForDay(dateStr);
    return { dateStr, staffed, total: dayShifts.length, ok: staffed >= minRequired };
  });

  const underStaffedDays = weekCoverage.filter(d => !d.ok).length;

  const statusColor = underStaffedDays === 0
    ? "border-green-300 bg-green-50"
    : underStaffedDays <= 2
    ? "border-yellow-300 bg-yellow-50"
    : "border-red-300 bg-red-50";

  return (
    <div className={`rounded-xl border-2 p-4 ${statusColor} transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{location.name}</h3>
          <p className="text-xs text-gray-500 capitalize">{location.type} • min {minRequired} guard{minRequired !== 1 ? "s" : ""}</p>
        </div>
        {underStaffedDays === 0 ? (
          <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
            <CheckCircle2 className="w-3 h-3" /> Covered
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
            <AlertTriangle className="w-3 h-3" /> {underStaffedDays} day{underStaffedDays !== 1 ? "s" : ""} short
          </Badge>
        )}
      </div>

      {/* Daily coverage grid */}
      <div className="grid grid-cols-7 gap-1">
        {weekCoverage.map(({ dateStr, staffed, total, ok }) => {
          const dayLabel = new Date(dateStr + "T00:00:00").toLocaleDateString("en", { weekday: "short" }).slice(0, 2);
          return (
            <button
              key={dateStr}
              onClick={() => onAddShift(location, dateStr)}
              className={`flex flex-col items-center p-1.5 rounded-lg text-xs transition-all hover:scale-105 group ${
                ok ? "bg-green-100 hover:bg-green-200" : total === 0 ? "bg-gray-100 hover:bg-gray-200" : "bg-red-100 hover:bg-red-200"
              }`}
            >
              <span className="text-gray-500 font-medium">{dayLabel}</span>
              <span className={`font-bold text-sm ${ok ? "text-green-700" : total === 0 ? "text-gray-400" : "text-red-700"}`}>
                {staffed}
              </span>
              {!ok && (
                <Plus className="w-3 h-3 text-gray-400 group-hover:text-gray-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200/50 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{shifts.filter(s => s.location_id === location.id && s.employee_id).length} assignments this week</span>
      </div>
    </div>
  );
}