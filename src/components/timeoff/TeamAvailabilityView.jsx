import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format, eachDayOfInterval, parseISO } from "date-fns";

export default function TeamAvailabilityView({
  requests,
  employees,
  dateRange,
}) {
  if (!dateRange?.start || !dateRange?.end) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Select a date range to view team availability</p>
      </div>
    );
  }

  const days = eachDayOfInterval({
    start: parseISO(dateRange.start),
    end: parseISO(dateRange.end),
  });

  const empMap = Object.fromEntries(employees.map((e) => [e.id, e]));

  return (
    <Card className="p-4 border-0 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-700">
                Employee
              </th>
              {days.map((day) => (
                <th
                  key={day.toISOString()}
                  className="text-center py-2 px-2 font-semibold text-gray-700"
                >
                  {format(day, "MMM d")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3 font-medium text-gray-900">
                  {emp.first_name} {emp.last_name}
                </td>
                {days.map((day) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const dayRequests = requests.filter((r) => {
                    if (r.employee_id !== emp.id || r.status !== "approved")
                      return false;
                    if (r.is_partial_day) {
                      return r.start_date === dayStr;
                    }
                    return (
                      dayStr >= r.start_date && dayStr <= r.end_date
                    );
                  });

                  return (
                    <td
                      key={`${emp.id}-${dayStr}`}
                      className="text-center py-3 px-2"
                    >
                      {dayRequests.length > 0 ? (
                        <Badge className="bg-orange-100 text-orange-700 text-xs">
                          {dayRequests[0].is_partial_day ? "Half" : "Off"}
                        </Badge>
                      ) : (
                        <span className="text-green-600 font-semibold">✓</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}