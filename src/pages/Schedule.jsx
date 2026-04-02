import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { DragDropContext } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, MapPin, Users, AlertTriangle, Repeat, ArrowLeftRight, Sparkles } from "lucide-react";
import ScheduleGrid from "@/components/schedule/ScheduleGrid";
import EmployeeView from "@/components/schedule/EmployeeView";
import ShiftDialog from "@/components/schedule/ShiftDialog";
import RecurringShiftDialog from "@/components/schedule/RecurringShiftDialog";
import ShiftSwapDialog from "@/components/schedule/ShiftSwapDialog";
import RecommendationsPanel from "@/components/schedule/RecommendationsPanel";
import ScheduleSuggestionsPanel from "@/components/schedule/ScheduleSuggestionsPanel";

export default function Schedule() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [view, setView] = useState("location"); // "location" | "employee"
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapShift, setSwapShift] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [defaultDate, setDefaultDate] = useState("");
  const [defaultLocationId, setDefaultLocationId] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [canDragDrop, setCanDragDrop] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekDates = days.map(d => format(d, "yyyy-MM-dd"));

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
  const { data: templates = [] } = useQuery({
    queryKey: ["shift_templates"],
    queryFn: () => base44.entities.ShiftTemplate.list(),
  });

  const { data: availabilities = [] } = useQuery({
    queryKey: ["availabilities"],
    queryFn: () => base44.entities.EmployeeAvailability.list(),
  });

  const { data: certifications = [] } = useQuery({
    queryKey: ["certifications"],
    queryFn: () => base44.entities.Certification.list(),
  });

  useEffect(() => {
    const getUserData = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        // Only enable drag-drop on mobile/touch devices
        const isTouchDevice = () => window.matchMedia("(hover: none)").matches || navigator.maxTouchPoints > 0;
        setCanDragDrop((user?.role === "admin" || user?.role === "manager") && isTouchDevice());
      } catch (e) {
        const isTouchDevice = () => window.matchMedia("(hover: none)").matches || navigator.maxTouchPoints > 0;
        setCanDragDrop(isTouchDevice());
      }
    };
    getUserData();
  }, []);

  const createShift = useMutation({
    mutationFn: (data) => base44.entities.Shift.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shifts"] }); setDialogOpen(false); },
  });
  const updateShift = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Shift.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shifts"] }); setDialogOpen(false); },
  });
  const deleteShift = useMutation({
    mutationFn: (id) => base44.entities.Shift.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shifts"] }); setDialogOpen(false); },
  });

  const weekShifts = useMemo(() => shifts.filter(s => weekDates.includes(s.date)), [shifts, weekDates]);

  // Count conflicts in the current week
  const conflictCount = useMemo(() => {
    return weekShifts.filter(s => {
      if (!s.employee_id || s.status === "cancelled") return false;
      return weekShifts.some(
        o => o.id !== s.id && o.employee_id === s.employee_id &&
          o.date === s.date && o.status !== "cancelled" &&
          o.start_time < s.end_time && o.end_time > s.start_time
      );
    }).length / 2; // each conflict is counted twice
  }, [weekShifts]);

  const activeLocations = locations.filter(l => l.status === "active" || !l.status);

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

  const handleRecurringSave = async (shiftList) => {
    await Promise.all(shiftList.map(s => base44.entities.Shift.create(s)));
    queryClient.invalidateQueries({ queryKey: ["shifts"] });
    setRecurringOpen(false);
  };

  const handleSwapSubmit = async (swapData) => {
    const user = await base44.auth.me();
    const me = employees.find(e => e.email === user?.email);
    const created = await base44.entities.ShiftSwapRequest.create({
      ...swapData,
      requester_employee_id: me?.id || swapData.requester_employee_id,
      requester_employee_name: me ? `${me.first_name} ${me.last_name}` : swapData.requester_employee_name,
    });
    await base44.functions.invoke("shiftSwapNotify", { swap_request_id: created.id, action: "new_request" });
    setSwapOpen(false);
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    
    const shift = shifts.find(s => s.id === draggableId);
    if (!shift) return;

    const [locId, dateStr] = source.droppableId.split("-");
    const [newLocId, newDateStr] = destination.droppableId.split("-");

    if (view === "location") {
      updateShift.mutate({
        id: shift.id,
        data: {
          ...shift,
          location_id: newLocId,
          date: newDateStr,
        }
      });
    } else if (view === "employee") {
      updateShift.mutate({
        id: shift.id,
        data: {
          ...shift,
          employee_id: newLocId,
          date: newDateStr,
        }
      });
    }
  };

  // Availability conflict check for schedule grid
  const getAvailabilityWarning = (employeeId, dateStr) => {
    const avail = availabilities.find(a => a.employee_id === employeeId);
    if (!avail) return null;
    // Check unavailable periods
    for (const p of (avail.unavailable_periods || [])) {
      if (p.start_date && p.end_date && dateStr >= p.start_date && dateStr <= p.end_date) {
        return `Unavailable: ${p.reason || "blocked period"}`;
      }
    }
    return null;
  };

  // Get AI recommendations
  const handleGetRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      const response = await base44.functions.invoke("getShiftRecommendations", {
        location_id: activeLocations[0]?.id || "",
        week_start: weekDates[0],
      });
      setRecommendations(response.data?.slots || []);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleApplyRecommendation = async (rec) => {
    const shift = weekShifts.find(s => s.id === rec.shift_id);
    if (shift) {
      await updateShift.mutate({
        id: shift.id,
        data: { ...shift, employee_id: rec.employee_id },
      });
      setRecommendations(recommendations.filter(r => r.shift_id !== rec.shift_id));
    }
  };

  const openShiftsCount = weekShifts.filter(s => s.status === "open" || !s.employee_id).length;

  return (
    <DragDropContext onDragEnd={handleDragEnd} enableMouseEvents={canDragDrop}>
      <div className="p-4 lg:p-8 space-y-5 max-w-full bg-white min-h-screen">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="icon" className="h-9 w-9"
            onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="text-xs font-semibold px-3"
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))}>
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Today
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9"
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h3 className="text-sm font-semibold text-slate-700 ml-1">
            {format(days[0], "MMM d")} – {format(days[6], "MMM d, yyyy")}
          </h3>
          {conflictCount > 0 && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 gap-1">
              <AlertTriangle className="w-3 h-3" />
              {Math.ceil(conflictCount)} conflict{Math.ceil(conflictCount) !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setView("location")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${view === "location" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
              <MapPin className="w-3.5 h-3.5" /> By Location
            </button>
            <button
              onClick={() => setView("employee")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${view === "employee" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
              <Users className="w-3.5 h-3.5" /> By Employee
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={() => setRecurringOpen(true)}>
            <Repeat className="w-4 h-4 mr-1" /> Recurring
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSuggestionsOpen(true)}
            title="Generate automated shift schedule"
          >
            <Sparkles className="w-4 h-4 mr-1" /> Auto Schedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetRecommendations}
            disabled={recommendationsLoading}
            title="Get AI recommendations for open shifts"
          >
            <Sparkles className="w-4 h-4 mr-1" /> {recommendationsLoading ? "Analyzing..." : "AI Suggestions"}
          </Button>
          <Button
            onClick={() => {
              setSelectedShift(null);
              setDefaultDate(format(new Date(), "yyyy-MM-dd"));
              setDefaultLocationId(activeLocations[0]?.id || "");
              setDialogOpen(true);
            }}
            className="bg-[#1a9c5b] hover:bg-[#158a4e]" size="sm">
            <Plus className="w-4 h-4 mr-1" /> New Shift
          </Button>
        </div>
      </div>

      {/* Recommendations Panel */}
      {(recommendations.length > 0 || recommendationsLoading) && (
        <RecommendationsPanel
          recommendations={recommendations}
          onApply={handleApplyRecommendation}
          isLoading={recommendationsLoading}
          openShiftsCount={openShiftsCount}
        />
      )}

      {/* Grid */}
      {activeLocations.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Add a location first to start scheduling</p>
        </div>
      ) : view === "location" ? (
        <ScheduleGrid
          shifts={weekShifts}
          locations={activeLocations}
          days={days}
          availabilities={availabilities}
          onShiftClick={handleShiftClick}
          onCellClick={handleCellClick}
          canDragDrop={canDragDrop}
        />
      ) : (
        <EmployeeView
          shifts={weekShifts}
          employees={employees}
          days={days}
          availabilities={availabilities}
          onShiftClick={handleShiftClick}
          onSwapClick={(shift) => { setSwapShift(shift); setSwapOpen(true); }}
          canDragDrop={canDragDrop}
        />
      )}

      <ShiftDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shift={selectedShift}
        employees={employees}
        locations={activeLocations}
        shifts={shifts}
        templates={templates}
        certifications={certifications}
        onSave={handleSave}
        onDelete={(id) => deleteShift.mutate(id)}
        defaultDate={defaultDate}
        defaultLocationId={defaultLocationId}
      />
      <RecurringShiftDialog
        open={recurringOpen}
        onOpenChange={setRecurringOpen}
        employees={employees}
        locations={activeLocations}
        allShifts={shifts}
        templates={templates}
        onSave={handleRecurringSave}
      />
      <ShiftSwapDialog
        open={swapOpen}
        onOpenChange={setSwapOpen}
        myShift={swapShift}
        allShifts={shifts}
        employees={employees}
        onSubmit={handleSwapSubmit}
      />
      {suggestionsOpen && (
        <ScheduleSuggestionsPanel
          weekStart={format(weekStart, "yyyy-MM-dd")}
          locationId=""
          onAssignments={() => queryClient.invalidateQueries({ queryKey: ["shifts"] })}
          onClose={() => setSuggestionsOpen(false)}
        />
      )}
      </div>
      </DragDropContext>
      );
      }