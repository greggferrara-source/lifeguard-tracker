import React from "react";
import { format, addDays, isSameDay } from "date-fns";
import { motion } from "framer-motion";

const SHIFT_COLORS = [
  "#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444",
  "#ec4899", "#6366f1", "#14b8a6", "#f97316", "#06b6d4"
];

function getShiftColor(employeeName, index) {
  if (!employeeName) return "#94a3b8";
  const hash = employeeName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return SHIFT_COLORS[hash % SHIFT_COLORS.length];
}

export default function ScheduleGrid({ shifts, locations, days, onShiftClick, onCellClick }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="sticky left-0 z-20 bg-slate-50/80 backdrop-blur-sm w-48 px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-r border-slate-200/60">
                Location
              </th>
              {days.map((day, i) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <th
                    key={i}
                    className={`px-2 py-3 text-center border-b border-slate-200/60 min-w-[120px] ${
                      isToday ? "bg-cyan-50/50" : ""
                    }`}
                  >
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {format(day, "EEE")}
                    </div>
                    <div className={`text-sm font-bold mt-0.5 ${isToday ? "text-cyan-600" : "text-slate-700"}`}>
                      {format(day, "MMM d")}
                    </div>
                    {isToday && (
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mx-auto mt-1" />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <tr key={location.id} className="group">
                <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/50 backdrop-blur-sm px-4 py-3 border-b border-r border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: location.color || "#0ea5e9" }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{location.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{location.type}</p>
                    </div>
                  </div>
                </td>
                {days.map((day, dayIdx) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const isToday = isSameDay(day, new Date());
                  const dayShifts = shifts.filter(
                    s => s.date === dateStr && s.location_id === location.id
                  );
                  return (
                    <td
                      key={dayIdx}
                      className={`px-1.5 py-1.5 border-b border-slate-200/60 align-top cursor-pointer hover:bg-slate-50/50 transition-colors ${
                        isToday ? "bg-cyan-50/30" : ""
                      }`}
                      onClick={() => onCellClick(location, dateStr)}
                    >
                      <div className="space-y-1 min-h-[40px]">
                        {dayShifts.map((shift) => (
                          <motion.div
                            key={shift.id}
                            whileHover={{ scale: 1.03 }}
                            className="shift-block rounded-lg px-2 py-1.5 text-white text-[11px] font-medium leading-tight cursor-pointer"
                            style={{
                              backgroundColor: shift.color || getShiftColor(shift.employee_name),
                              opacity: shift.status === "cancelled" ? 0.4 : 1,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onShiftClick(shift);
                            }}
                          >
                            <div className="truncate font-semibold">
                              {shift.employee_name || "OPEN"}
                            </div>
                            <div className="opacity-80 text-[10px]">
                              {shift.start_time}–{shift.end_time}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}