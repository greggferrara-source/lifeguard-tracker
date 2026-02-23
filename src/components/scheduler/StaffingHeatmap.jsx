import React from "react";
import { format } from "date-fns";

export default function StaffingHeatmap({ locations, shifts, days }) {
  const getStaffed = (locationId, dateStr) =>
    shifts.filter(s => s.location_id === locationId && s.date === dateStr && s.employee_id && s.status !== "cancelled").length;

  const getTotal = (locationId, dateStr) =>
    shifts.filter(s => s.location_id === locationId && s.date === dateStr && s.status !== "cancelled").length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold text-gray-700 min-w-[140px]">Location</th>
            {days.map(d => (
              <th key={d.toISOString()} className="text-center py-2 px-2 font-medium text-gray-500 min-w-[80px]">
                <div>{format(d, "EEE")}</div>
                <div className="text-xs font-normal">{format(d, "MMM d")}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {locations.map(loc => (
            <tr key={loc.id} className="border-t border-gray-100">
              <td className="py-2 pr-4">
                <div className="font-medium text-gray-800 truncate max-w-[140px]">{loc.name}</div>
                <div className="text-xs text-gray-400">min {loc.min_guards_required || 1}</div>
              </td>
              {days.map(d => {
                const dateStr = d.toISOString().split("T")[0];
                const staffed = getStaffed(loc.id, dateStr);
                const total = getTotal(loc.id, dateStr);
                const min = loc.min_guards_required || 1;
                const bg = staffed >= min
                  ? "bg-green-100 text-green-800"
                  : total === 0
                  ? "bg-gray-50 text-gray-300"
                  : "bg-red-100 text-red-800";
                return (
                  <td key={dateStr} className="py-2 px-2 text-center">
                    <span className={`inline-flex items-center justify-center w-9 h-7 rounded-md text-xs font-bold ${bg}`}>
                      {staffed}/{total || 0}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}