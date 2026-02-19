import React from "react";
import { format, isSameDay } from "date-fns";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeftRight } from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";

const SHIFT_COLORS = [
  "#0ea5e9","#10b981","#8b5cf6","#f59e0b","#ef4444",
  "#ec4899","#6366f1","#14b8a6","#f97316","#06b6d4"
];
function getColor(name) {
  if (!name) return "#94a3b8";
  const hash = name.split("").reduce((a,c) => a+c.charCodeAt(0), 0);
  return SHIFT_COLORS[hash % SHIFT_COLORS.length];
}
function hasConflict(shift, allShifts) {
  return allShifts.some(
    s => s.id !== shift.id && s.employee_id === shift.employee_id &&
      s.date === shift.date && s.status !== "cancelled" &&
      s.start_time < shift.end_time && s.end_time > shift.start_time
  );
}

function getUnavailableReason(employeeId, dateStr, availabilities) {
  const avail = availabilities?.find(a => a.employee_id === employeeId);
  if (!avail) return null;
  for (const p of (avail.unavailable_periods || [])) {
    if (p.start_date && p.end_date && dateStr >= p.start_date && dateStr <= p.end_date) {
      return p.reason || "Unavailable";
    }
  }
  return null;
}

export default function EmployeeView({ shifts, employees, days, availabilities = [], onShiftClick, onSwapClick, canDragDrop = false }) {
  const activeEmployees = employees.filter(e => e.status === "active");

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="sticky left-0 z-20 bg-slate-50/80 w-44 px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-r border-slate-200/60">
                Employee
              </th>
              {days.map((day, i) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <th key={i} className={`px-2 py-3 text-center border-b border-slate-200/60 min-w-[120px] ${isToday ? "bg-cyan-50/50" : ""}`}>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">{format(day, "EEE")}</div>
                    <div className={`text-sm font-bold mt-0.5 ${isToday ? "text-cyan-600" : "text-slate-700"}`}>{format(day, "MMM d")}</div>
                    {isToday && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mx-auto mt-1" />}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {activeEmployees.map(emp => {
              const empShifts = shifts.filter(s => s.employee_id === emp.id);
              const weekHours = empShifts.reduce((sum, s) => {
                const [sh, sm] = s.start_time.split(":").map(Number);
                const [eh, em] = s.end_time.split(":").map(Number);
                return sum + Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
              }, 0);
              return (
                <tr key={emp.id} className="group">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/50 px-4 py-3 border-b border-r border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: emp.color || getColor(`${emp.first_name} ${emp.last_name}`) }}>
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{emp.first_name} {emp.last_name}</p>
                        <p className="text-[10px] text-slate-400">{weekHours.toFixed(1)}h this week</p>
                      </div>
                    </div>
                  </td>
                  {days.map((day, idx) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isToday = isSameDay(day, new Date());
                    const dayShifts = empShifts.filter(s => s.date === dateStr);
                    const unavailReason = getUnavailableReason(emp.id, dateStr, availabilities);
                    const droppableId = `${emp.id}-${dateStr}`;
                    return (
                      <Droppable key={idx} droppableId={droppableId} isDropDisabled={!canDragDrop}>
                        {(provided, snapshot) => (
                          <td ref={provided.innerRef} {...provided.droppableProps}
                            className={`px-1.5 py-1.5 border-b border-slate-200/60 align-top transition-colors ${isToday ? "bg-cyan-50/20" : ""} ${unavailReason && dayShifts.length === 0 ? "bg-red-50/40" : ""} ${snapshot.isDraggingOver && canDragDrop ? "bg-blue-100/50" : ""}`}>
                            {unavailReason && dayShifts.length === 0 && (
                              <div className="text-[9px] text-red-400 px-1 truncate" title={unavailReason}>🚫 {unavailReason}</div>
                            )}
                            <div className="space-y-1 min-h-[32px]">
                              {dayShifts.map((shift, shiftIdx) => {
                                const conflicted = hasConflict(shift, shifts);
                                const availConflict = unavailReason;
                                return (
                                  <Draggable key={shift.id} draggableId={shift.id} index={shiftIdx} isDragDisabled={!canDragDrop}>
                                    {(provided, snapshot) => (
                                      <motion.div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                        whileHover={canDragDrop ? { scale: 1.03 } : {}}
                                        className={`shift-block rounded-lg px-2 py-1.5 text-white text-[11px] font-medium relative ${conflicted || availConflict ? "ring-2 ring-orange-400 ring-offset-1" : ""} ${canDragDrop ? "cursor-grab" : "cursor-pointer"} ${snapshot.isDragging ? "shadow-lg ring-2 ring-blue-400" : ""}`}
                                        style={{ backgroundColor: emp.color || getColor(`${emp.first_name} ${emp.last_name}`), opacity: shift.status === "cancelled" ? 0.4 : 1, ...provided.draggableProps.style }}
                                        onClick={() => onShiftClick(shift)}>
                                        {(conflicted || availConflict) && <AlertTriangle className="absolute top-1 right-1 w-2.5 h-2.5 text-orange-300" />}
                                        <div className="truncate pr-3">{shift.location_name || "—"}</div>
                                        <div className="opacity-80 text-[10px]">{shift.start_time}–{shift.end_time}</div>
                                        {onSwapClick && shift.status === "scheduled" && (
                                          <button
                                            onClick={e => { e.stopPropagation(); onSwapClick(shift); }}
                                            className="absolute bottom-0.5 right-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                                            title="Request swap">
                                            <ArrowLeftRight className="w-2.5 h-2.5 text-white/70" />
                                          </button>
                                        )}
                                      </motion.div>
                                    )}
                                  </Draggable>
                                );
                              })}
                              {provided.placeholder}
                            </div>
                          </td>
                        )}
                      </Droppable>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}