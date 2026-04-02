import React from "react";
import { format, isSameDay } from "date-fns";
import { AlertTriangle, Plus } from "lucide-react";
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

export default function DayView({ shifts, locations, day, onShiftClick, onCellClick, canDragDrop }) {
  const dateStr = format(day, "yyyy-MM-dd");
  const isToday = isSameDay(day, new Date());
  const dayShifts = shifts.filter(s => s.date === dateStr);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Day header */}
      <div className={`px-6 py-4 border-b border-slate-100 ${isToday ? "bg-cyan-50" : "bg-slate-50"}`}>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{format(day, "EEEE")}</div>
        <div className={`text-2xl font-bold mt-0.5 ${isToday ? "text-cyan-600" : "text-slate-800"}`}>{format(day, "MMMM d, yyyy")}</div>
        <div className="text-sm text-slate-500 mt-0.5">{dayShifts.length} shift{dayShifts.length !== 1 ? "s" : ""} scheduled</div>
      </div>

      {/* Per-location rows */}
      <div className="divide-y divide-slate-100">
        {locations.map(location => {
          const locShifts = dayShifts.filter(s => s.location_id === location.id);
          const droppableId = `${location.id}-${dateStr}`;
          return (
            <Droppable key={location.id} droppableId={droppableId} direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex items-start gap-3 px-5 py-4 transition-colors ${snapshot.isDraggingOver && canDragDrop ? "bg-blue-50" : "hover:bg-slate-50/60"}`}
                >
                  {/* Location label */}
                  <div className="w-44 flex-shrink-0 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: location.color || "#0ea5e9" }} />
                      <span className="text-sm font-semibold text-slate-800">{location.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 capitalize ml-4.5 mt-0.5">{location.type}</div>
                  </div>

                  {/* Shifts */}
                  <div className="flex flex-wrap gap-2 flex-1 min-h-[48px]">
                    {locShifts.map((shift, idx) => {
                      const conflicted = hasConflict(shift, shifts);
                      return (
                        <Draggable key={shift.id} draggableId={shift.id} index={idx} isDragDisabled={!canDragDrop}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              onClick={() => onShiftClick(shift)}
                              className={`rounded-xl px-3 py-2 text-white text-xs font-medium cursor-pointer select-none relative ${conflicted ? "ring-2 ring-orange-400" : ""} ${snap.isDragging ? "shadow-xl ring-2 ring-blue-400 rotate-1" : "shadow-sm"} ${canDragDrop ? "cursor-grab" : ""}`}
                              style={{
                                backgroundColor: shift.color || getShiftColor(shift.employee_name),
                                opacity: shift.status === "cancelled" ? 0.4 : 1,
                                ...prov.draggableProps.style,
                              }}
                            >
                              {conflicted && <AlertTriangle className="absolute top-1 right-1 w-3 h-3 text-orange-200" />}
                              <div className="font-semibold pr-3">{shift.employee_name || "OPEN"}</div>
                              <div className="opacity-80 mt-0.5">{shift.start_time}–{shift.end_time}</div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    {/* Add shift button */}
                    <button
                      onClick={() => onCellClick(location, dateStr)}
                      className="rounded-xl border-2 border-dashed border-slate-200 px-3 py-2 text-slate-400 text-xs hover:border-[#1a9c5b] hover:text-[#1a9c5b] transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </div>
  );
}