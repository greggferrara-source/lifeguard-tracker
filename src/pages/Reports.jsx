import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { format, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Download, Users, Clock, MapPin, TrendingUp } from "lucide-react";

const COLORS = ["#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];

export default function Reports() {
  const [tab, setTab] = useState("week");
  const today = new Date();

  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.list() });
  const { data: shifts = [] } = useQuery({ queryKey: ["shifts"], queryFn: () => base44.entities.Shift.list("-date", 1000) });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });
  const { data: timeOff = [] } = useQuery({ queryKey: ["timeoff-all"], queryFn: () => base44.entities.TimeOffRequest.list("-created_date", 200) });

  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");
  const monthStartStr = format(monthStart, "yyyy-MM-dd");
  const monthEndStr = format(monthEnd, "yyyy-MM-dd");

  const rangeShifts = shifts.filter(s => {
    if (tab === "week") return s.date >= weekStartStr && s.date <= weekEndStr;
    return s.date >= monthStartStr && s.date <= monthEndStr;
  });

  function calcHours(s) {
    if (!s.start_time || !s.end_time) return 0;
    const [sh, sm] = s.start_time.split(":").map(Number);
    const [eh, em] = s.end_time.split(":").map(Number);
    return Math.max(0, (eh + em / 60) - (sh + sm / 60));
  }

  // Hours by employee
  const hoursByEmployee = {};
  for (const s of rangeShifts.filter(s => s.employee_id && s.status !== "cancelled")) {
    if (!hoursByEmployee[s.employee_name]) hoursByEmployee[s.employee_name] = 0;
    hoursByEmployee[s.employee_name] += calcHours(s);
  }
  const employeeData = Object.entries(hoursByEmployee)
    .map(([name, hours]) => ({ name: name.split(" ")[0], hours: parseFloat(hours.toFixed(1)) }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 10);

  // Shifts by location
  const shiftsByLocation = {};
  for (const s of rangeShifts.filter(s => s.status !== "cancelled")) {
    if (!shiftsByLocation[s.location_name]) shiftsByLocation[s.location_name] = 0;
    shiftsByLocation[s.location_name]++;
  }
  const locationData = Object.entries(shiftsByLocation).map(([name, count]) => ({ name, count }));

  // Shifts by status
  const statusCount = { scheduled: 0, open: 0, completed: 0, cancelled: 0, no_show: 0 };
  for (const s of rangeShifts) statusCount[s.status] = (statusCount[s.status] || 0) + 1;
  const statusData = Object.entries(statusCount).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  // Daily shift count for week
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const dateStr = format(d, "yyyy-MM-dd");
    const dayShifts = shifts.filter(s => s.date === dateStr && s.status !== "cancelled");
    return {
      day: format(d, "EEE"),
      scheduled: dayShifts.filter(s => s.status === "scheduled").length,
      open: dayShifts.filter(s => s.status === "open").length,
    };
  });

  // Payroll estimate
  const payroll = rangeShifts
    .filter(s => s.employee_id && s.status !== "cancelled")
    .reduce((sum, s) => {
      const emp = employees.find(e => e.id === s.employee_id);
      const rate = emp?.hourly_rate || 0;
      return sum + calcHours(s) * rate;
    }, 0);

  const totalHours = rangeShifts.filter(s => s.employee_id && s.status !== "cancelled").reduce((sum, s) => sum + calcHours(s), 0);
  const openShiftCount = rangeShifts.filter(s => s.status === "open").length;
  const fillRate = rangeShifts.length > 0 ? Math.round(((rangeShifts.length - openShiftCount) / rangeShifts.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-2">Schedule performance and workforce insights</p>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-slate-100">
            <TabsTrigger value="week" className="text-xs">This Week</TabsTrigger>
            <TabsTrigger value="month" className="text-xs">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Hours", value: totalHours.toFixed(0), icon: Clock, sub: "staffed hours" },
          { label: "Est. Payroll", value: `$${payroll.toFixed(0)}`, icon: TrendingUp, sub: "this period" },
          { label: "Fill Rate", value: `${fillRate}%`, icon: Users, sub: `${openShiftCount} open shifts` },
          { label: "Total Shifts", value: rangeShifts.length, icon: MapPin, sub: `across ${locations.length} locations` },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-50 rounded-2xl p-6">
            <stat.icon className="w-5 h-5 text-[#1a9c5b] mb-4" />
            <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm font-medium text-gray-500 mt-2">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6 border border-gray-100 shadow-none rounded-2xl">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Daily Shift Coverage (This Week)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="scheduled" fill="#0ea5e9" name="Scheduled" radius={[3,3,0,0]} />
              <Bar dataKey="open" fill="#f59e0b" name="Open" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border border-gray-100 shadow-none rounded-2xl">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Hours by Employee</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={employeeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
              <Tooltip />
              <Bar dataKey="hours" fill="#10b981" name="Hours" radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Shifts by Location</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={locationData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {locationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Shift Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Employee Hours Table */}
      <Card className="p-5 border-0 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Employee Hours & Pay Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 pb-2">Employee</th>
                <th className="text-left text-xs font-semibold text-slate-500 pb-2">Role</th>
                <th className="text-right text-xs font-semibold text-slate-500 pb-2">Shifts</th>
                <th className="text-right text-xs font-semibold text-slate-500 pb-2">Hours</th>
                <th className="text-right text-xs font-semibold text-slate-500 pb-2">Rate</th>
                <th className="text-right text-xs font-semibold text-slate-500 pb-2">Est. Pay</th>
              </tr>
            </thead>
            <tbody>
              {employees.filter(e => e.status === "active").map(emp => {
                const empShifts = rangeShifts.filter(s => s.employee_id === emp.id && s.status !== "cancelled");
                const hours = empShifts.reduce((sum, s) => sum + calcHours(s), 0);
                const pay = hours * (emp.hourly_rate || 0);
                if (empShifts.length === 0) return null;
                const roleLabels = { lifeguard: "Lifeguard", head_lifeguard: "Head LG", supervisor: "Supervisor", manager: "Manager" };
                return (
                  <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-2 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: emp.color || "#0ea5e9" }}>
                          {emp.first_name?.[0]}{emp.last_name?.[0]}
                        </div>
                        {emp.first_name} {emp.last_name}
                      </div>
                    </td>
                    <td className="py-2 text-xs text-slate-500">{roleLabels[emp.role] || emp.role}</td>
                    <td className="py-2 text-right text-slate-700">{empShifts.length}</td>
                    <td className="py-2 text-right text-slate-700">{hours.toFixed(1)}</td>
                    <td className="py-2 text-right text-slate-500">${emp.hourly_rate || 0}/hr</td>
                    <td className="py-2 text-right font-semibold text-slate-900">${pay.toFixed(0)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td colSpan={3} className="py-2 font-semibold text-slate-900">Total</td>
                <td className="py-2 text-right font-semibold">{totalHours.toFixed(1)}</td>
                <td></td>
                <td className="py-2 text-right font-semibold text-cyan-700">${payroll.toFixed(0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}