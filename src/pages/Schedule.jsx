import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import ScheduleGrid from "@/components/schedule/ScheduleGrid";
import ShiftDialog from "@/components/schedule/ShiftDialog";

export default function Schedule() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [defaultDate, setDefaultDate] = useState("");
  const [defaultLocationId, setDefaultLocationId] = useState("");

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => base44.entities.Shift.list("-date", 500),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list(),
  });

  const createShift = useMutation({
    mutationFn: (data) => base44.entities.Shift.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setDialogOpen(false);
    },
  });

  const updateShift = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Shift.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setDialogOpen(false);
    },
  });

  const deleteShift = useMutation({
    mutationFn: (id) => base44.entities.Shift.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setDialogOpen(false);
    },
  });

  const handleShiftClick = (shift) => {
    setSelectedShift(shift);
    setDefaultDate("");
    setDefaultLocationId("");
    setDialogOpen(true);
  };

  const handleCellClick = (location, date) => {
    setSelectedShift(null);
    setDefaultDate(date);
    setDefaultLocationId(location.id);
    setDialogOpen(true);
  };

  const handleSave = (formData) => {
    if (selectedShift) {
      updateShift.mutate({ id: selectedShift.id, data: formData });
    } else {
      createShift.mutate(formData);
    }
  };

  const activeLocations = locations.filter((l) => l.status === "active" || !l.status);

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setWeekStart(subWeeks(weekStart, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-semibold px-3"
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))}
          >
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h3 className="text-sm font-semibold text-slate-700 ml-2">
            {format(days[0], "MMM d")} – {format(days[6], "MMM d, yyyy")}
          </h3>
        </div>
        <Button
          onClick={() => {
            setSelectedShift(null);
            setDefaultDate(format(new Date(), "yyyy-MM-dd"));
            setDefaultLocationId(activeLocations[0]?.id || "");
            setDialogOpen(true);
          }}
          className="bg-cyan-600 hover:bg-cyan-700"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Shift
        </Button>
      </div>

      {/* Grid */}
      {activeLocations.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <MapPinIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Add a location first to start scheduling</p>
        </div>
      ) : (
        <ScheduleGrid
          shifts={shifts}
          locations={activeLocations}
          days={days}
          onShiftClick={handleShiftClick}
          onCellClick={handleCellClick}
        />
      )}

      {/* Dialog */}
      <ShiftDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shift={selectedShift}
        employees={employees}
        locations={activeLocations}
        onSave={handleSave}
        onDelete={(id) => deleteShift.mutate(id)}
        defaultDate={defaultDate}
        defaultLocationId={defaultLocationId}
      />
    </div>
  );
}

function MapPinIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}