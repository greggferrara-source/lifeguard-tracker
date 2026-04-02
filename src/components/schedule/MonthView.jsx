import React from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";

const SHIFT_COLORS = [
  "#0ea5e9","#10b981","#8b5cf6","#f59e0b","#ef4444",
  "#ec4899","#6366f1","#14b8a6","#f97316","#06b6d4"
];

function getShiftColor(employeeName) {
  if (!employeeName) return "#94a3b8";
  const hash = employeeName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return SHIFT_COLORS[hash % SHIFT_COLORS.length];
}

function hasConflict(shift, allShifts) {
  return allShifts.some(
    s => s.id !== shift.id && s.employee_id && s.employee_id === shift.employee_id &&
      s.date === shift.date && s.status !== "cancelled" &&
      s.start_time < shift.end_time && s.end_time > shift.start_time
  );
}

export default function MonthView({ shifts, locations, monthDate, onShiftClick, onCellClick, canDragDrop }) {
  // Build calendar grid
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });

  const weeks = [];
  let current = calStart;
  while (current <= monthEnd || weeks.length < 6) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(current);
      current = addDays(current, 1);
    }
    weeks.push(week);
    if (weeks.length >= 6) break;
  }

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-slate-100 last:border-b-0" style={{ minHeight: 110 }}>
          {week.map((day, di) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const isToday = isSameDay(day, new Date());
            const inMonth = isSameMonth(day, monthDate);
            const dayShifts = shifts.filter(s => s.date === dateStr);
            const MAX_VISIBLE = 3;
            const overflow = dayShifts.length - MAX_VISIBLE;

            return (
              <Droppable key={di} droppableId={`month-${dateStr}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`border-r border-slate-100 last:border-r-0 p-1.5 transition-colors ${!inMonth ? "bg-slate-50/60" : ""} ${isToday ? "bg-cyan-50/40" : ""} ${snapshot.isDraggingOver && canDragDrop ? "bg-blue-50" : ""}`}
                    onClick={() => {
                      if (inMonth) {
                        // default: use first location
                        const loc = locations[0];
                        if (loc) onCellClick(loc, dateStr);
                      }
                    }}
                  >
                    {/* Date number */}
                    <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-cyan-500 text-white" : inMonth ? "text-slate-700" : "text-slate-300"}`}>
                      {format(day, "d")}
                    </div>

                    {/* Shift pills */}
                    <div className="space-y-0.5">
                      {dayShifts.slice(0, MAX_VISIBLE).map((shift, idx) => {
                        const conflicted = hasConflict(shift, shifts);
                        return (
                          <Draggable key={shift.id} draggableId={shift.id} index={idx} isDragDisabled={!canDragDrop}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                onClick={e => { e.stopPropagation(); onShiftClick(shift); }}
                                className={`rounded px-1.5 py-0.5 text-white text-[10px] font-medium truncate relative cursor-pointer ${conflicted ? "ring-1 ring-orange-400" : ""} ${snap.isDragging ? "shadow-lg ring-2 ring-blue-400" : ""} ${canDragDrop ? "cursor-grab" : ""}`}
                                style={{
                                  backgroundColor: shift.color || getShiftColor(shift.employee_name),
                                  opacity: shift.status === "cancelled" ? 0.4 : 1,
                                  ...prov.draggableProps.style,
                                }}
                              >
                                {conflicted && <AlertTriangle className="inline w-2.5 h-2.5 text-orange-200 mr-0.5" />}
                                {shift.employee_name || "OPEN"} {shift.start_time}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {overflow > 0 && (
                        <div className="text-[10px] text-slate-400 font-medium pl-1">+{overflow} more</div>
                      )}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      ))}
    </div>
  );
}