import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";

function getDateLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEE, MMM d");
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-700",
  open: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-500",
  no_show: "bg-red-100 text-red-700",
};

export default function UpcomingShifts({ shifts }) {
  const upcomingShifts = shifts
    .filter(s => s.status !== "cancelled")
    .sort((a, b) => `${a.date}${a.start_time}`.localeCompare(`${b.date}${b.start_time}`))
    .slice(0, 8);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Upcoming Shifts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {upcomingShifts.length === 0 && (
          <p className="text-sm text-slate-400 py-4 text-center">No upcoming shifts</p>
        )}
        {upcomingShifts.map((shift) => (
          <div
            key={shift.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
          >
            <div
              className="w-1 h-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: shift.color || "#0ea5e9" }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900 truncate">
                  {shift.employee_name || "Open Shift"}
                </span>
                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${statusColors[shift.status] || ""}`}>
                  {shift.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {shift.start_time} – {shift.end_time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {shift.location_name || "—"}
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400 flex-shrink-0">
              {getDateLabel(shift.date)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}