import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, addDays, subDays, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, User } from "lucide-react";
import ShiftDialog from "@/components/schedule/ShiftDialog";

const statusColors = {
  scheduled: "#1a9c5b",
  open: "#f59e0b",
  completed: "#6b7280",
  cancelled: "#ef4444",
  no_show: "#7c3aed",
};

function haptic() {
  if (navigator.vibrate) navigator.vibrate(8);
}

export default function MobileSchedule() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  const dateStr = format(date, "yyyy-MM-dd");
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: shifts = [] } = useQuery({ queryKey: ["shifts"], queryFn: () => base44.entities.Shift.list("-date", 500) });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.list() });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });

  const updateShift = useMutation({ mutationFn: ({ id, data }) => base44.entities.Shift.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shifts"] }); setDialogOpen(false); } });
  const createShift = useMutation({ mutationFn: (data) => base44.entities.Shift.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shifts"] }); setDialogOpen(false); } });
  const deleteShift = useMutation({ mutationFn: (id) => base44.entities.Shift.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shifts"] }) });

  const dayShifts = useMemo(() => shifts.filter((s) => s.date === dateStr), [shifts, dateStr]);
  const activeLocations = locations.filter((l) => l.status === "active" || !l.status);

  const handleSave = (formData) => {
    if (selectedShift) updateShift.mutate({ id: selectedShift.id, data: formData });
    else createShift.mutate(formData);
  };

  const shiftsByLocation = useMemo(() => {
    const grouped = {};
    dayShifts.forEach((s) => {
      const key = s.location_id || "unassigned";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    });
    return grouped;
  }, [dayShifts]);

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24">
      {/* Date Header */}
      <div className="bg-white px-4 pt-4 pb-2 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{format(date, "EEEE")}</h1>
            <p className="text-sm text-gray-400">{format(date, "MMMM d, yyyy")}</p>
          </div>
          <button
            onClick={() => { haptic(); setSelectedShift(null); setDialogOpen(true); }}
            className="w-11 h-11 bg-[#1a9c5b] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Week Strip */}
        <div className="flex gap-1.5 pb-2">
          {days.map((day, i) => {
            const isSelected = isSameDay(day, date);
            const isToday = isSameDay(day, new Date());
            const hasShifts = shifts.some((s) => s.date === format(day, "yyyy-MM-dd"));
            return (
              <button
                key={i}
                onClick={() => { haptic(); setDate(day); }}
                className={`flex-1 py-2 rounded-xl text-center transition-all active:scale-95 ${
                  isSelected ? "bg-[#1a9c5b] shadow-sm" : isToday ? "bg-[#f0faf5]" : "bg-transparent"
                }`}
              >
                <div className={`text-[10px] font-semibold uppercase tracking-wide ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                  {format(day, "EEE")}
                </div>
                <div className={`text-base font-bold ${isSelected ? "text-white" : isToday ? "text-[#1a9c5b]" : "text-gray-700"}`}>
                  {format(day, "d")}
                </div>
                {hasShifts && (
                  <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-0.5 ${isSelected ? "bg-white/60" : "bg-[#1a9c5b]"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shifts */}
      <div className="flex-1 overflow-auto px-4 pt-4 space-y-4">
        <AnimatePresence mode="wait">
          {dayShifts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-400">No shifts today</p>
              <p className="text-sm text-gray-300 mt-1">Tap + to add one</p>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {Object.entries(shiftsByLocation).map(([locId, locShifts]) => {
                const loc = locations.find((l) => l.id === locId);
                return (
                  <div key={locId}>
                    {loc && (
                      <div className="flex items-center gap-1.5 mb-2 px-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{loc.name}</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      {locShifts.map((shift) => {
                        const emp = employees.find((e) => e.id === shift.employee_id);
                        const isOpen = !shift.employee_id || shift.status === "open";
                        const accentColor = shift.color || statusColors[shift.status] || "#1a9c5b";

                        return (
                          <motion.button
                            key={shift.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => { haptic(); setSelectedShift(shift); setDialogOpen(true); }}
                            className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-[0.98] transition-transform"
                          >
                            <div className="flex items-stretch">
                              {/* Color bar */}
                              <div className="w-1 rounded-l-2xl flex-shrink-0" style={{ backgroundColor: accentColor }} />
                              <div className="flex-1 px-4 py-3 flex items-center gap-3">
                                {/* Avatar */}
                                {emp ? (
                                  <div
                                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                                    style={{ backgroundColor: emp.color || accentColor }}
                                  >
                                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-amber-100">
                                    <User className="w-5 h-5 text-amber-500" />
                                  </div>
                                )}
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm truncate">
                                    {emp ? `${emp.first_name} ${emp.last_name}` : "Open Shift"}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {shift.start_time} – {shift.end_time}
                                  </p>
                                </div>
                                {/* Badge */}
                                {isOpen && (
                                  <span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex-shrink-0">
                                    Open
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ShiftDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shift={selectedShift}
        employees={employees}
        locations={activeLocations}
        shifts={shifts}
        templates={[]}
        onSave={handleSave}
        onDelete={(id) => deleteShift.mutate(id)}
        defaultDate={dateStr}
        defaultLocationId={activeLocations[0]?.id || ""}
      />
    </div>
  );
}