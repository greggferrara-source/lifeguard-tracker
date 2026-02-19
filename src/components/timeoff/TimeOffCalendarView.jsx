import React, { useMemo } from "react";
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";

export default function TimeOffCalendarView({ requests = [], currentDate = new Date() }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const approvedRequests = requests.filter(r => r.status === "approved");

  const daysWithTimeOff = useMemo(() => {
    const map = {};
    approvedRequests.forEach(request => {
      const start = new Date(request.start_date);
      const end = new Date(request.end_date);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = format(new Date(d), "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push({
          employee: request.employee_name,
          type: request.reason || "Time Off",
          isPartial: request.is_partial_day
        });
      }
    });
    return map;
  }, [approvedRequests]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarIcon className="w-5 h-5 text-[#1a9c5b]" />
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentDate, "MMMM yyyy")}
        </h3>
      </div>

      <div className="space-y-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const dateKey = format(day, "yyyy-MM-dd");
            const timeOffOnDay = daysWithTimeOff[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={dateKey}
                className={`min-h-20 p-2 rounded-lg border-2 transition-all ${
                  isToday
                    ? "border-[#1a9c5b] bg-[#f0faf5]"
                    : isCurrentMonth
                    ? "border-gray-200 bg-white"
                    : "border-gray-100 bg-gray-50 opacity-50"
                }`}
              >
                <p className={`text-sm font-semibold ${isCurrentMonth ? "text-gray-900" : "text-gray-400"}`}>
                  {format(day, "d")}
                </p>
                
                {timeOffOnDay.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {timeOffOnDay.slice(0, 2).map((timeOff, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-2 py-0.5 rounded ${
                          timeOff.isPartial
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                        title={timeOff.employee}
                      >
                        {timeOff.isPartial ? "½ day" : "Off"}
                      </div>
                    ))}
                    {timeOffOnDay.length > 2 && (
                      <p className="text-xs text-gray-500">+{timeOffOnDay.length - 2} more</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
          <span className="text-sm text-gray-600">Full Day Off</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" />
          <span className="text-sm text-gray-600">Partial Day</span>
        </div>
      </div>
    </Card>
  );
}