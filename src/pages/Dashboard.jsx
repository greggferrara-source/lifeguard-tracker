import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, MapPin, CalendarDays, Clock, ArrowRight, AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function Dashboard() {
  const today = new Date();
  const weekStart = format(startOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd");

  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.list() });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });
  const { data: shifts = [] } = useQuery({ queryKey: ["shifts"], queryFn: () => base44.entities.Shift.list("-date", 200) });
  const { data: timeOffRequests = [] } = useQuery({ queryKey: ["timeoff"], queryFn: () => base44.entities.TimeOffRequest.filter({ status: "pending" }) });
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: () => base44.entities.Alert.list("-created_date", 50) });

  const activeEmployees = employees.filter(e => e.status === "active");
  const activeLocations = locations.filter(l => l.status === "active");
  const todayStr = format(today, "yyyy-MM-dd");
  const todayShifts = shifts.filter(s => s.date === todayStr);
  const openShifts = shifts.filter(s => s.status === "open");
  const weekShifts = shifts.filter(s => s.date >= weekStart && s.date <= weekEnd);
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  const totalWeekHours = weekShifts.reduce((sum, s) => {
    if (!s.start_time || !s.end_time) return sum;
    const [sh, sm] = s.start_time.split(":").map(Number);
    const [eh, em] = s.end_time.split(":").map(Number);
    return sum + (eh + em / 60) - (sh + sm / 60);
  }, 0);

  const upcomingShifts = shifts
    .filter(s => s.date >= todayStr && s.employee_id && s.status === "scheduled")
    .slice(0, 6);

  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Hero Section */}
      <div className="text-center mb-20">
        <p className="text-[#1a9c5b] font-semibold text-base mb-4">{format(today, "EEEE, MMMM d, yyyy")}</p>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight mb-6">
          {greeting}.
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
          Here's everything happening with your team today.
        </p>
      </div>

      {/* Alert Banner */}
      {(openShifts.length > 0 || unresolvedAlerts.length > 0) && (
        <div className="mb-12 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900 text-lg">Attention needed</p>
            <p className="text-amber-700 mt-1">
              {openShifts.length > 0 && `${openShifts.length} open shift${openShifts.length > 1 ? "s" : ""} need coverage. `}
              {unresolvedAlerts.length > 0 && `${unresolvedAlerts.length} unresolved alert${unresolvedAlerts.length > 1 ? "s" : ""} awaiting review.`}
            </p>
          </div>
          <Link to={createPageUrl("Alerts")} className="text-sm font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 flex-shrink-0">
            View alerts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { label: "Active Guards", value: activeEmployees.length, sub: `${employees.length} total`, icon: Users },
          { label: "Today's Shifts", value: todayShifts.length, sub: `${todayShifts.filter(s => s.status === "scheduled").length} confirmed`, icon: CalendarDays },
          { label: "Locations", value: activeLocations.length, sub: `${locations.length} total`, icon: MapPin },
          { label: "Week Hours", value: totalWeekHours.toFixed(0), sub: `${weekShifts.length} shifts`, icon: Clock },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-5 h-5 text-[#1a9c5b]" />
            </div>
            <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm font-medium text-gray-500 mt-2">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column content */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Upcoming Shifts */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Shifts</h2>
            <Link to={createPageUrl("Schedule")} className="text-sm font-semibold text-[#1a9c5b] hover:underline flex items-center gap-1">
              View schedule <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {upcomingShifts.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-10 text-center">
              <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No upcoming shifts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingShifts.map(shift => (
                <div key={shift.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#1a9c5b]/10 flex items-center justify-center text-sm font-bold text-[#1a9c5b]">
                    {(shift.employee_name || "?")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{shift.employee_name}</p>
                    <p className="text-xs text-gray-500">{shift.location_name} · {shift.start_time}–{shift.end_time}</p>
                  </div>
                  <p className="text-xs font-medium text-gray-400 flex-shrink-0">{shift.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Time Off Requests */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Time Off</h2>
              <Link to={createPageUrl("TimeOff")} className="text-sm font-semibold text-[#1a9c5b] hover:underline flex items-center gap-1">
                Manage <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {timeOffRequests.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 font-medium text-sm">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {timeOffRequests.slice(0, 3).map(req => (
                  <div key={req.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">
                      {(req.employee_name || "?")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{req.employee_name}</p>
                      <p className="text-xs text-gray-500">{req.start_date} – {req.end_date}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: "Add a new shift", page: "Schedule", icon: CalendarDays },
                { label: "Add an employee", page: "Employees", icon: Users },
                { label: "View reports", page: "Reports", icon: BarChart2 ?? MapPin },
              ].map((action, i) => (
                <Link
                  key={i}
                  to={createPageUrl(action.page)}
                  className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors group"
                >
                  <action.icon className="w-4 h-4 text-[#1a9c5b]" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-[#1a9c5b] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}