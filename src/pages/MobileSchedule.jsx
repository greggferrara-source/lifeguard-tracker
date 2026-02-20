import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, addDays, subDays, isSameDay } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Plus, AlertCircle } from "lucide-react";
import ShiftDialog from "@/components/schedule/ShiftDialog";

export default function MobileSchedule() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [defaultLocationId, setDefaultLocationId] = useState("");

  const dateStr = format(date, "yyyy-MM-dd");
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
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

  const updateShift = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Shift.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setDialogOpen(false);
    },
  });

  const createShift = useMutation({
    mutationFn: (data) => base44.entities.Shift.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setDialogOpen(false);
    },
  });

  const deleteShift = useMutation({
    mutationFn: (id) => base44.entities.Shift.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shifts"] }),
  });

  const dayShifts = useMemo(
    () => shifts.filter((s) => s.date === dateStr),
    [shifts, dateStr]
  );

  const handleSave = (formData) => {
    if (selectedShift) {
      updateShift.mutate({ id: selectedShift.id, data: formData });
    } else {
      createShift.mutate(formData);
    }
  };

  const activeLocations = locations.filter((l) => l.status === "active" || !l.status);

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
        <p className="text-sm text-gray-500">{format(date, "EEEE, MMMM d")}</p>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setDate(subDays(date, 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex-1 flex gap-1 overflow-x-auto">
          {days.map((day, i) => {
            const isSelected = isSameDay(day, date);
            const isToday = isSameDay(day, new Date());
            return (
              <button
                key={i}
                onClick={() => setDate(day)}
                className={`flex-1 min-w-[50px] py-2 rounded-lg text-center transition-colors ${
                  isSelected
                    ? "bg-[#1a9c5b] text-white"
                    : isToday
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                <div className="text-xs font-semibold">{format(day, "EEE")}</div>
                <div className="text-sm font-bold">{format(day, "d")}</div>
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setDate(addDays(date, 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Add Shift Button */}
      <Button
        onClick={() => {
          setSelectedShift(null);
          setDefaultLocationId(activeLocations[0]?.id || "");
          setDialogOpen(true);
        }}
        className="w-full bg-[#1a9c5b] hover:bg-[#158a4e]"
      >
        <Plus className="w-4 h-4 mr-2" /> Add Shift
      </Button>

      {/* Shifts List */}
      <div className="space-y-3">
        {dayShifts.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-gray-500 text-sm">No shifts scheduled for this day</p>
            </CardContent>
          </Card>
        ) : (
          dayShifts.map((shift) => {
            const employee = employees.find((e) => e.id === shift.employee_id);
            const location = locations.find((l) => l.id === shift.location_id);
            const isOpen = !shift.employee_id || shift.status === "open";

            return (
              <Card
                key={shift.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                style={{ borderLeftColor: shift.color || "#1a9c5b" }}
                onClick={() => {
                  setSelectedShift(shift);
                  setDialogOpen(true);
                }}
              >
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {employee ? `${employee.first_name} ${employee.last_name}` : "OPEN"}
                        </p>
                        <p className="text-sm text-gray-500">{location?.name}</p>
                      </div>
                      {isOpen && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">Open</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                      {shift.start_time} – {shift.end_time}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedShift(shift);
                          setDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteShift.mutate(shift.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
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
        defaultLocationId={defaultLocationId}
      />
    </div>
  );
}