import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek, addDays, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, isSameDay } from "date-fns";
import { DragDropContext } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, MapPin, Users, AlertTriangle, Repeat, Sparkles, Calendar } from "lucide-react";
import ScheduleGrid from "@/components/schedule/ScheduleGrid";
import DayView from "@/components/schedule/DayView";
import MonthView from "@/components/schedule/MonthView";
import EmployeeView from "@/components/schedule/EmployeeView";
import ShiftDialog from "@/components/schedule/ShiftDialog";
import RecurringShiftDialog from "@/components/schedule/RecurringShiftDialog";
import ShiftSwapDialog from "@/components/schedule/ShiftSwapDialog";
import RecommendationsPanel from "@/components/schedule/RecommendationsPanel";
import ScheduleSuggestionsPanel from "@/components/schedule/ScheduleSuggestionsPanel";
import CertExpiryBanner from "@/components/schedule/CertExpiryBanner";
import SmartScheduleBuilder from "@/components/schedule/SmartScheduleBuilder";
import TooltipHint from "@/components/onboarding/TooltipHint";

export default function Schedule() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [dayDate, setDayDate] = useState(new Date());
  const [monthDate, setMonthDate] = useState(startOfMonth(new Date()));
  const [calView, setCalView] = useState("week"); // "day" | "week" | "month"
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
  const [smartBuilderOpen, setSmartBuilderOpen] = useState(false);

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
        // Enable drag-drop for admins/managers on all devices
        setCanDragDrop(user?.role === "admin" || user?.role === "manager" || user?.role === "site_owner" || user?.role === "enterprise_admin" || user?.role === "enterprise_site_owner");
      } catch (e) {
        setCanDragDrop(false);
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

  // All shifts relevant to the current calendar view
  const viewShifts = useMemo(() => {
    if (calView === "day") return shifts.filter(s => s.date === format(dayDate, "yyyy-MM-dd"));
    if (calView === "month") {
      const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
      const end = format(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0), "yyyy-MM-dd");
      return shifts.filter(s => s.date >= start && s.date <= end);
    }
    return weekShifts;
  }, [calView, shifts, weekShifts, dayDate, monthDate]);

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

  const [recurringResult, setRecurringResult] = useState(null);

  const handleRecurringSave = async (shiftList) => {
    const results = await Promise.allSettled(shiftList.map(s => base44.entities.Shift.create(s)));
    const succeeded = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;
    queryClient.invalidateQueries({ queryKey: ["shifts"] });
    const summary = { succeeded, failed, total: shiftList.length };
    setRecurringResult(summary);
    if (failed === 0) setRecurringOpen(false);
    return summary;
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
    if (!destination || source.droppableId === destination.droppableId) return;

    const shift = shifts.find(s => s.id === draggableId);
    if (!shift) return;

    // Month view uses "month-YYYY-MM-DD" droppable IDs
    if (destination.droppableId.startsWith("month-")) {
      const newDateStr = destination.droppableId.replace("month-", "");
      updateShift.mutate({ id: shift.id, data: { ...shift, date: newDateStr } });
      return;
    }

    // Week / Day view uses "locationId-YYYY-MM-DD"
    const lastDash = destination.droppableId.lastIndexOf("-");
    const secondLastDash = destination.droppableId.lastIndexOf("-", lastDash - 1);
    // date is always last 10 chars (yyyy-MM-dd)
    const newDateStr = destination.droppableId.slice(-10);
    const newLocId = destination.droppableId.slice(0, destination.droppableId.length - 11);

    if (view === "employee") {
      updateShift.mutate({ id: shift.id, data: { ...shift, employee_id: newLocId, date: newDateStr } });
    } else {
      updateShift.mutate({ id: shift.id, data: { ...shift, location_id: newLocId, date: newDateStr } });
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

  // Navigation helpers per calView
  const goBack = () => {
    if (calView === "day") setDayDate(d => addDays(d, -1));
    else if (calView === "week") setWeekStart(w => subWeeks(w, 1));
    else setMonthDate(m => subMonths(m, 1));
  };
  const goForward = () => {
    if (calView === "day") setDayDate(d => addDays(d, 1));
    else if (calView === "week") setWeekStart(w => addWeeks(w, 1));
    else setMonthDate(m => addMonths(m, 1));
  };
  const goToday = () => {
    const today = new Date();
    setDayDate(today);
    setWeekStart(startOfWeek(today, { weekStartsOn: 0 }));
    setMonthDate(startOfMonth(today));
  };

  const dateRangeLabel = () => {
    if (calView === "day") return format(dayDate, "EEEE, MMMM d, yyyy");
    if (calView === "week") return `${format(days[0], "MMM d")} – ${format(days[6], "MMM d, yyyy")}`;
    return format(monthDate, "MMMM yyyy");
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd} enableMouseEvents>
      <div className="p-4 lg:p-8 space-y-5 max-w-full bg-white min-h-screen">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={goBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="text-xs font-semibold px-3" onClick={goToday}>
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Today
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={goForward}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h3 className="text-sm font-semibold text-slate-700 ml-1">{dateRangeLabel()}</h3>
          {calView !== "month" && conflictCount > 0 && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 gap-1">
              <AlertTriangle className="w-3 h-3" />
              {Math.ceil(conflictCount)} conflict{Math.ceil(conflictCount) !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Day / Week / Month toggle */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {[["day", "Day"], ["week", "Week"], ["month", "Month"]].map(([key, label]) => (
              <button key={key} onClick={() => setCalView(key)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${calView === key ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Location / Employee toggle (only in week/day) */}
          {calView !== "month" && (
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setView("location")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${view === "location" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                <MapPin className="w-3.5 h-3.5" /> Location
              </button>
              <button
                onClick={() => setView("employee")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${view === "employee" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                <Users className="w-3.5 h-3.5" /> Employee
              </button>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={() => setRecurringOpen(true)}>
            <Repeat className="w-4 h-4 mr-1" /> Recurring
          </Button>
          <Button
            size="sm"
            onClick={() => setSmartBuilderOpen(true)}
            className="bg-gradient-to-r from-[#0f6638] to-[#1a9c5b] hover:from-[#0a4f2b] hover:to-[#158a4e] text-white font-semibold gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" /> Auto Build Schedule
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

      {/* Onboarding hint */}
      <TooltipHint
        id="schedule-auto-build"
        message="💡 New here? Click Auto Build Schedule to generate a full compliant week's schedule in one click."
      />

      {/* Cert Expiry Banner */}
      <CertExpiryBanner certifications={certifications} employees={employees} weekDates={weekDates} />

      {/* Recurring shift result toast */}
      {recurringResult && (
        <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm ${recurringResult.failed > 0 ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"}`}>
          <span>
            {recurringResult.failed > 0
              ? `⚠️ ${recurringResult.succeeded}/${recurringResult.total} shifts created. ${recurringResult.failed} failed — please retry.`
              : `✅ ${recurringResult.succeeded} recurring shifts created successfully.`}
          </span>
          <button onClick={() => setRecurringResult(null)} className="text-gray-400 hover:text-gray-600 text-xs underline">Dismiss</button>
        </div>
      )}

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
      ) : calView === "day" ? (
        <DayView
          shifts={viewShifts}
          locations={activeLocations}
          day={dayDate}
          onShiftClick={handleShiftClick}
          onCellClick={handleCellClick}
          canDragDrop={canDragDrop}
        />
      ) : calView === "month" ? (
        <MonthView
          shifts={viewShifts}
          locations={activeLocations}
          monthDate={monthDate}
          onShiftClick={handleShiftClick}
          onCellClick={handleCellClick}
          canDragDrop={canDragDrop}
        />
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
      <SmartScheduleBuilder
        open={smartBuilderOpen}
        onOpenChange={setSmartBuilderOpen}
        employees={employees}
        locations={locations}
        certifications={certifications}
        availabilities={availabilities}
        existingShifts={shifts}
        onPublish={() => queryClient.invalidateQueries({ queryKey: ["shifts"] })}
      />
      </div>
      </DragDropContext>
      );
      }