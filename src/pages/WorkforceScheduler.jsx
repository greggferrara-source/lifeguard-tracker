import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft, ChevronRight, CalendarDays, MapPin, Users, AlertTriangle,
  CheckCircle2, TrendingUp, Download
} from "lucide-react";
import LocationCoverageCard from "@/components/scheduler/LocationCoverageCard";
import StaffingHeatmap from "@/components/scheduler/StaffingHeatmap";
import QuickShiftAssigner from "@/components/scheduler/QuickShiftAssigner";

export default function WorkforceScheduler() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [assignerOpen, setAssignerOpen] = useState(false);
  const [assignerTarget, setAssignerTarget] = useState({ location: null, date: "" });
  const [locationFilter, setLocationFilter] = useState("all");

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekDates = days.map(d => format(d, "yyyy-MM-dd"));

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => base44.entities.Shift.list("-date", 500)
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list()
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list()
  });

  const createShift = useMutation({
    mutationFn: (data) => base44.entities.Shift.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shifts"] })
  });

  const weekShifts = useMemo(
    () => shifts.filter(s => weekDates.includes(s.date)),
    [shifts, weekDates]
  );

  const activeLocations = useMemo(
    () => locations.filter(l => l.status === "active" || !l.status),
    [locations]
  );

  const filteredLocations = locationFilter === "all"
    ? activeLocations
    : activeLocations.filter(l => l.type === locationFilter);

  const locationTypes = [...new Set(activeLocations.map(l => l.type).filter(Boolean))];

  // --- Summary Stats ---
  const totalShiftsNeeded = useMemo(() => {
    return activeLocations.reduce((sum, loc) => sum + (loc.min_guards_required || 1) * 7, 0);
  }, [activeLocations]);

  const totalCovered = useMemo(() => {
    let covered = 0;
    activeLocations.forEach(loc => {
      weekDates.forEach(date => {
        const staffed = weekShifts.filter(s => s.location_id === loc.id && s.date === date && s.employee_id && s.status !== "cancelled").length;
        if (staffed >= (loc.min_guards_required || 1)) covered++;
      });
    });
    return covered;
  }, [activeLocations, weekShifts, weekDates]);

  const totalSlots = activeLocations.length * 7;
  const coverageRate = totalSlots > 0 ? Math.round((totalCovered / totalSlots) * 100) : 0;

  const understaffedLocations = useMemo(() => {
    return activeLocations.filter(loc =>
      weekDates.some(date => {
        const staffed = weekShifts.filter(s => s.location_id === loc.id && s.date === date && s.employee_id && s.status !== "cancelled").length;
        return staffed < (loc.min_guards_required || 1);
      })
    ).length;
  }, [activeLocations, weekShifts, weekDates]);

  const handleAddShift = (location, date) => {
    setAssignerTarget({ location, date });
    setAssignerOpen(true);
  };

  const handleShiftSaved = async (shiftData) => {
    await createShift.mutateAsync(shiftData);
  };

  const handleExport = () => {
    const rows = [["Location", "Date", "Employee", "Start", "End", "Status"]];
    weekShifts.forEach(s => {
      const loc = locations.find(l => l.id === s.location_id);
      const emp = employees.find(e => e.id === s.employee_id);
      rows.push([
        loc?.name || s.location_name || "",
        s.date,
        emp ? `${emp.first_name} ${emp.last_name}` : s.employee_name || "Open",
        s.start_time || "",
        s.end_time || "",
        s.status || "scheduled"
      ]);
    });

    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schedule-${weekDates[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workforce Scheduler</h1>
            <p className="text-gray-600 mt-1">Multi-location staffing overview and shift management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center gap-3 bg-white rounded-xl border p-3 shadow-sm">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))}>
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Today
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold text-gray-700">
            {format(days[0], "MMM d")} – {format(days[6], "MMM d, yyyy")}
          </span>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Locations</p>
                  <p className="text-2xl font-bold text-gray-900">{activeLocations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Coverage Rate</p>
                  <p className={`text-2xl font-bold ${coverageRate >= 80 ? "text-green-600" : coverageRate >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                    {coverageRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Understaffed</p>
                  <p className="text-2xl font-bold text-red-600">{understaffedLocations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Shifts This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{weekShifts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Filter */}
        {locationTypes.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={locationFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setLocationFilter("all")}
              className={locationFilter === "all" ? "bg-[#1a9c5b] hover:bg-[#158a4e]" : ""}
            >
              All ({activeLocations.length})
            </Button>
            {locationTypes.map(type => (
              <Button
                key={type}
                variant={locationFilter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setLocationFilter(type)}
                className={locationFilter === type ? "bg-[#1a9c5b] hover:bg-[#158a4e] capitalize" : "capitalize"}
              >
                {type} ({activeLocations.filter(l => l.type === type).length})
              </Button>
            ))}
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="cards">
          <TabsList>
            <TabsTrigger value="cards">Location Cards</TabsTrigger>
            <TabsTrigger value="heatmap">Coverage Heatmap</TabsTrigger>
          </TabsList>

          {/* Location Cards View */}
          <TabsContent value="cards" className="mt-4">
            {filteredLocations.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-gray-400">
                  <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No active locations found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredLocations.map(location => (
                  <LocationCoverageCard
                    key={location.id}
                    location={location}
                    shifts={weekShifts}
                    employees={employees}
                    days={days}
                    onAddShift={handleAddShift}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Heatmap View */}
          <TabsContent value="heatmap" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Staffing Heatmap — staffed/total shifts per day</CardTitle>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" /> Meeting minimum</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Below minimum</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 border border-gray-200 inline-block" /> No shifts</span>
                </div>
              </CardHeader>
              <CardContent>
                <StaffingHeatmap
                  locations={filteredLocations}
                  shifts={weekShifts}
                  days={days}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Shift Assigner */}
      <QuickShiftAssigner
        open={assignerOpen}
        onOpenChange={setAssignerOpen}
        location={assignerTarget.location}
        date={assignerTarget.date}
        employees={employees}
        existingShifts={weekShifts}
        onSave={handleShiftSaved}
      />
    </div>
  );
}