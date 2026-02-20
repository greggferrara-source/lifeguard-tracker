import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

export default function ClockReport({ clockEntries, employees, locations, dateFrom, dateTo, locationFilter }) {
  const filtered = clockEntries.filter(e => {
    const d = e.clock_in?.split("T")[0];
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    if (locationFilter && e.location_id !== locationFilter) return false;
    return true;
  });

  // Hours per employee
  const empHours = {};
  const empEntries = {};
  for (const e of filtered) {
    const mins = e.total_minutes || 0;
    if (!empHours[e.employee_id]) { empHours[e.employee_id] = 0; empEntries[e.employee_id] = { name: e.employee_name, count: 0 }; }
    empHours[e.employee_id] += mins;
    empEntries[e.employee_id].count++;
  }

  const byEmployee = Object.entries(empHours).map(([id, mins]) => ({
    name: (empEntries[id]?.name || "?").split(" ")[0],
    fullName: empEntries[id]?.name || "?",
    hours: parseFloat((mins / 60).toFixed(1)),
    shifts: empEntries[id]?.count,
  })).sort((a, b) => b.hours - a.hours);

  // Hours per location
  const locHours = {};
  for (const e of filtered) {
    if (!locHours[e.location_name || "Unknown"]) locHours[e.location_name || "Unknown"] = 0;
    locHours[e.location_name || "Unknown"] += e.total_minutes || 0;
  }
  const byLocation = Object.entries(locHours).map(([name, mins]) => ({ name, hours: parseFloat((mins / 60).toFixed(1)) }));

  const totalHours = Object.values(empHours).reduce((a, b) => a + b, 0) / 60;
  const clockedIn = clockEntries.filter(e => e.status === "clocked_in").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Hours", value: totalHours.toFixed(1), icon: Clock },
          { label: "Clock Entries", value: filtered.length, icon: Users },
          { label: "Currently Clocked In", value: clockedIn, icon: Clock },
          { label: "Locations Active", value: byLocation.length, icon: MapPin },
        ].map((s, i) => (
          <div key={i} className="bg-gray-50 rounded-2xl p-5">
            <s.icon className="w-4 h-4 text-[#1a9c5b] mb-3" />
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6 border border-gray-100 shadow-none rounded-2xl">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Hours by Employee</h3>
          {byEmployee.length === 0 ? <p className="text-sm text-gray-400">No data for selected range</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byEmployee} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
                <Tooltip formatter={(v) => [`${v} hrs`]} />
                <Bar dataKey="hours" fill="#10b981" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card className="p-6 border border-gray-100 shadow-none rounded-2xl">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Hours by Location</h3>
          {byLocation.length === 0 ? <p className="text-sm text-gray-400">No data for selected range</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byLocation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} hrs`]} />
                <Bar dataKey="hours" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card className="p-6 border border-gray-100 shadow-none rounded-2xl">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Employee Clock Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 pb-2">Employee</th>
                <th className="text-right text-xs font-semibold text-gray-500 pb-2">Entries</th>
                <th className="text-right text-xs font-semibold text-gray-500 pb-2">Total Hours</th>
                <th className="text-right text-xs font-semibold text-gray-500 pb-2">Avg Hours/Entry</th>
              </tr>
            </thead>
            <tbody>
              {byEmployee.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2 font-medium text-gray-900">{r.fullName}</td>
                  <td className="py-2 text-right text-gray-600">{r.shifts}</td>
                  <td className="py-2 text-right text-gray-700 font-semibold">{r.hours} hrs</td>
                  <td className="py-2 text-right text-gray-500">{r.shifts ? (r.hours / r.shifts).toFixed(1) : 0} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}