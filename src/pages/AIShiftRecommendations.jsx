import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Sparkles, AlertTriangle, CheckCircle2, Info, RefreshCw, CalendarDays, Users, Clock, Zap } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import RecommendationInsightsPanel from "@/components/shifts/RecommendationInsightsPanel";
import RecommendationSlotCard from "@/components/shifts/RecommendationSlotCard";

const PRIORITY_STYLES = {
  high: "border-l-4 border-red-400 bg-red-50",
  medium: "border-l-4 border-amber-400 bg-amber-50",
  low: "border-l-4 border-green-400 bg-green-50",
};

function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(weekStart + "T00:00:00"), i);
    return { date: format(d, "yyyy-MM-dd"), label: format(d, "EEE d") };
  });
}

export default function AIShiftRecommendations() {
  const queryClient = useQueryClient();
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [weekStart, setWeekStart] = useState(() => {
    const mon = startOfWeek(new Date(), { weekStartsOn: 1 });
    return format(mon, "yyyy-MM-dd");
  });
  const [slots, setSlots] = useState([]);
  const [insights, setInsights] = useState([]);
  const [riskFlags, setRiskFlags] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [published, setPublished] = useState([]);

  const { data: locations = [] } = useQuery({
    queryKey: ["locations-active"],
    queryFn: () => base44.entities.Location.filter({ status: "active" }),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees-active"],
    queryFn: () => base44.entities.Employee.filter({ status: "active" }),
  });

  const handleGenerate = async () => {
    if (!selectedLocationId) return;
    setGenerating(true);
    setSlots([]);
    setInsights([]);
    setRiskFlags([]);
    setPublished([]);
    try {
      const res = await base44.functions.invoke("getShiftRecommendations", {
        location_id: selectedLocationId,
        week_start: weekStart,
      });
      const data = res.data;
      const slotsWithIds = (data.slots || []).map((s, i) => ({
        ...s,
        _id: `slot-${i}`,
        assigned_employee_id: null,
        assigned_employee_name: null,
      }));
      setSlots(slotsWithIds);
      setInsights(data.insights || []);
      setRiskFlags(data.risk_flags || []);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;

    // draggableId = employee id, droppableId = slot _id
    const slotId = destination.droppableId;
    const empId = draggableId;
    const emp = employees.find((e) => e.id === empId);

    setSlots((prev) =>
      prev.map((s) =>
        s._id === slotId
          ? { ...s, assigned_employee_id: empId, assigned_employee_name: emp ? `${emp.first_name} ${emp.last_name}` : "" }
          : s
      )
    );
  }, [employees]);

  const handlePublish = async () => {
    const toPublish = slots.filter((s) => s.assigned_employee_id && !published.includes(s._id));
    if (!toPublish.length) return;
    setPublishLoading(true);
    try {
      await Promise.all(
        toPublish.map((s) =>
          base44.entities.Shift.create({
            date: s.date,
            start_time: s.start_time,
            end_time: s.end_time,
            employee_id: s.assigned_employee_id,
            employee_name: s.assigned_employee_name,
            location_id: s.location_id,
            location_name: s.location_name,
            status: "scheduled",
            notes: `AI Recommended: ${s.reason}`,
          })
        )
      );
      setPublished(toPublish.map((s) => s._id));
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    } finally {
      setPublishLoading(false);
    }
  };

  const weekDays = getWeekDays(weekStart);
  const locationEmployees = selectedLocationId
    ? employees.filter((e) => !e.location_id || e.location_id === selectedLocationId)
    : employees;
  const assignedCount = slots.filter((s) => s.assigned_employee_id).length;
  const publishedCount = published.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-[#1a9c5b]" />
              AI Shift Recommendations
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Generate optimal shift assignments using historical data, then drag-and-drop employees onto slots.
            </p>
          </div>
          {assignedCount > 0 && (
            <Button
              className="bg-[#1a9c5b] hover:bg-[#158a4e]"
              onClick={handlePublish}
              disabled={publishLoading || publishedCount === assignedCount}
            >
              {publishLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              {publishedCount === assignedCount && assignedCount > 0
                ? `Published (${publishedCount})`
                : `Publish ${assignedCount} Shifts`}
            </Button>
          )}
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Location</label>
                <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location..." />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Week Starting</label>
                <input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <Button
                className="bg-[#1a9c5b] hover:bg-[#158a4e] h-9"
                onClick={handleGenerate}
                disabled={!selectedLocationId || generating}
              >
                {generating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {generating ? "Analyzing..." : "Generate Recommendations"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Insights & Risk Flags */}
        {(insights.length > 0 || riskFlags.length > 0) && (
          <RecommendationInsightsPanel insights={insights} riskFlags={riskFlags} />
        )}

        {/* Main DnD area */}
        {slots.length > 0 && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Employee Pool */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#1a9c5b]" />
                      Staff Pool
                    </CardTitle>
                    <p className="text-xs text-gray-500">Drag employees onto shift slots</p>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                    <Droppable droppableId="employee-pool" isDropDisabled>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[40px]">
                          {locationEmployees.map((emp, index) => (
                            <Draggable key={emp.id} draggableId={emp.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-grab active:cursor-grabbing transition-shadow ${
                                    snapshot.isDragging
                                      ? "shadow-lg bg-white border-[#1a9c5b]"
                                      : "bg-white border-gray-200 hover:border-[#1a9c5b]/50"
                                  }`}
                                >
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                    style={{ backgroundColor: emp.color || "#1a9c5b" }}
                                  >
                                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-900 truncate">
                                      {emp.first_name} {emp.last_name}
                                    </p>
                                    <p className="text-[10px] text-gray-400 capitalize">{emp.role?.replace("_", " ")}</p>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>

              {/* Calendar Grid */}
              <div className="lg:col-span-3 overflow-x-auto">
                <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                  {weekDays.map((day) => {
                    const daySlots = slots.filter((s) => s.date === day.date);
                    return (
                      <div key={day.date} className="space-y-2">
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-700">{day.label.split(" ")[0]}</p>
                          <p className="text-lg font-extrabold text-gray-900">{day.label.split(" ")[1]}</p>
                        </div>
                        {daySlots.length === 0 ? (
                          <div className="rounded-lg border-2 border-dashed border-gray-200 h-16 flex items-center justify-center">
                            <p className="text-[10px] text-gray-300">No slots</p>
                          </div>
                        ) : (
                          daySlots.map((slot) => (
                            <Droppable key={slot._id} droppableId={slot._id}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`rounded-lg transition-all ${
                                    snapshot.isDraggingOver
                                      ? "ring-2 ring-[#1a9c5b] ring-offset-1"
                                      : ""
                                  } ${PRIORITY_STYLES[slot.priority] || PRIORITY_STYLES.low}`}
                                >
                                  <RecommendationSlotCard
                                    slot={slot}
                                    isPublished={published.includes(slot._id)}
                                  />
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DragDropContext>
        )}

        {/* Empty state */}
        {!generating && slots.length === 0 && (
          <Card className="py-20 text-center border-dashed">
            <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Select a location and generate AI recommendations</p>
            <p className="text-gray-400 text-sm mt-1">
              The AI will analyze historical patterns, patron loads, and incidents to suggest optimal staffing.
            </p>
          </Card>
        )}

        {generating && (
          <Card className="py-20 text-center">
            <Sparkles className="w-10 h-10 text-[#1a9c5b] mx-auto mb-4 animate-pulse" />
            <p className="text-gray-700 font-semibold">Analyzing staffing patterns...</p>
            <p className="text-gray-400 text-sm mt-1">This may take a few seconds</p>
          </Card>
        )}
      </div>
    </div>
  );
}