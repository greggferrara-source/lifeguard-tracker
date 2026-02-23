import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChevronLeft, ChevronRight, CalendarDays, Plus, Trash2, Zap,
  CheckCircle2, AlertTriangle, Loader, Users, Clock, MapPin, X
} from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AutoShiftPlanner() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [slots, setSlots] = useState([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [newSlot, setNewSlot] = useState({
    location_id: "",
    start_time: "08:00",
    end_time: "16:00",
    days: []
  });

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekStartStr = format(weekStart, "yyyy-MM-dd");

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list()
  });
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.filter({ status: "active" })
  });
  const { data: existingShifts = [] } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => base44.entities.Shift.list("-date", 500)
  });

  const activeLocations = locations.filter(l => l.status === "active" || !l.status);

  const weekShifts = useMemo(
    () => existingShifts.filter(s => {
      const weekDates = days.map(d => format(d, "yyyy-MM-dd"));
      return weekDates.includes(s.date);
    }),
    [existingShifts, days]
  );

  const toggleDay = (dayIdx) => {
    setNewSlot(prev => ({
      ...prev,
      days: prev.days.includes(dayIdx)
        ? prev.days.filter(d => d !== dayIdx)
        : [...prev.days, dayIdx]
    }));
  };

  const handleAddSlot = () => {
    if (!newSlot.location_id || newSlot.days.length === 0) return;
    const location = activeLocations.find(l => l.id === newSlot.location_id);
    const expanded = newSlot.days.map(dayIdx => ({
      id: `${Date.now()}-${dayIdx}`,
      date: format(addDays(weekStart, dayIdx), "yyyy-MM-dd"),
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
      location_id: newSlot.location_id,
      location_name: location?.name || ""
    }));
    setSlots(prev => [...prev, ...expanded]);
    setNewSlot({ location_id: newSlot.location_id, start_time: newSlot.start_time, end_time: newSlot.end_time, days: [] });
  };

  const handleRemoveSlot = (id) => setSlots(prev => prev.filter(s => s.id !== id));

  const handleAutoAssign = async () => {
    if (slots.length === 0) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("autoAssignShifts", {
        week_start: weekStartStr,
        shift_slots: slots.map(({ id, ...s }) => s)
      });
      setResult(res.data);
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setSlots([]);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setRunning(false);
    }
  };

  // Group slots by location for summary
  const slotsByLocation = useMemo(() => {
    const map = {};
    slots.forEach(s => {
      if (!map[s.location_id]) map[s.location_id] = [];
      map[s.location_id].push(s);
    });
    return map;
  }, [slots]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="w-7 h-7 text-[#1a9c5b]" />
              Auto Shift Planner
            </h1>
            <p className="text-gray-600 mt-1">Define shifts you need, and let the system assign eligible employees automatically.</p>
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
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
            <Users className="w-3.5 h-3.5" /> {employees.length} eligible employees
            <span className="mx-1">·</span>
            <MapPin className="w-3.5 h-3.5" /> {activeLocations.length} locations
          </div>
        </div>

        {/* Result Banner */}
        {result && (
          <div className={`rounded-xl p-4 border flex items-start gap-3 ${result.error ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
            {result.error ? (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              {result.error ? (
                <p className="text-red-800 font-medium">{result.error}</p>
              ) : (
                <>
                  <p className="text-green-800 font-semibold">
                    ✅ {result.assigned} shift{result.assigned !== 1 ? "s" : ""} auto-assigned successfully!
                  </p>
                  {result.unassigned > 0 && (
                    <p className="text-yellow-700 text-sm mt-1">
                      ⚠️ {result.unassigned} slot{result.unassigned !== 1 ? "s" : ""} could not be filled — no eligible employees available.
                    </p>
                  )}
                </>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setResult(null)}><X className="w-4 h-4" /></Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Slot Builder */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add Shift Slots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Location</Label>
                  <Select value={newSlot.location_id} onValueChange={(v) => setNewSlot({ ...newSlot, location_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeLocations.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Start</Label>
                    <Input type="time" value={newSlot.start_time} onChange={e => setNewSlot({ ...newSlot, start_time: e.target.value })} />
                  </div>
                  <div>
                    <Label>End</Label>
                    <Input type="time" value={newSlot.end_time} onChange={e => setNewSlot({ ...newSlot, end_time: e.target.value })} />
                  </div>
                </div>

                <div>
                  <Label>Days</Label>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {DAYS.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleDay(idx)}
                        className={`w-9 h-9 rounded-lg text-xs font-semibold border transition-all ${
                          newSlot.days.includes(idx)
                            ? "bg-[#1a9c5b] text-white border-[#1a9c5b]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#1a9c5b]"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleAddSlot}
                  disabled={!newSlot.location_id || newSlot.days.length === 0}
                  className="w-full bg-[#1a9c5b] hover:bg-[#158a4e]"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add {newSlot.days.length > 0 ? `${newSlot.days.length} slot${newSlot.days.length !== 1 ? "s" : ""}` : "Slots"}
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardContent className="pt-4 pb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Slots to fill</span>
                  <span className="font-bold">{slots.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Existing this week</span>
                  <span className="font-bold">{weekShifts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Available staff</span>
                  <span className="font-bold">{employees.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Slots Preview */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Shift Slots to Plan ({slots.length})</CardTitle>
                  {slots.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setSlots([])} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {slots.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No slots added yet. Use the panel on the left to define shifts you need filled.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {Object.entries(slotsByLocation).map(([locId, locSlots]) => {
                      const loc = activeLocations.find(l => l.id === locId);
                      return (
                        <div key={locId}>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{loc?.name || locId}</p>
                          {locSlots.map(slot => (
                            <div
                              key={slot.id}
                              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mb-1 border border-gray-100"
                            >
                              <div className="flex items-center gap-3 text-sm">
                                <span className="font-medium text-gray-700 w-12">
                                  {format(new Date(slot.date + "T00:00:00"), "EEE")}
                                </span>
                                <span className="text-gray-500">{format(new Date(slot.date + "T00:00:00"), "MMM d")}</span>
                                <Badge variant="outline" className="text-xs font-normal">
                                  {slot.start_time} – {slot.end_time}
                                </Badge>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveSlot(slot.id)} className="h-7 w-7">
                                <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Auto Assign Button */}
            {slots.length > 0 && (
              <Button
                onClick={handleAutoAssign}
                disabled={running}
                className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] h-12 text-base font-semibold shadow-lg"
              >
                {running ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Assigning {slots.length} shifts...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Auto-Assign {slots.length} Shift{slots.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}