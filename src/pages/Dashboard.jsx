import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Users, MapPin, CalendarDays, Clock, ArrowRight, AlertTriangle,
  CheckCircle2, Plus, Send, Bell, TrendingUp, ArrowLeftRight
} from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BroadcastDialog from "@/components/dashboard/BroadcastDialog";

export default function Dashboard() {
  const today = new Date();
  const weekStart = format(startOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd");
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.list() });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });
  const { data: shifts = [] } = useQuery({ queryKey: ["shifts"], queryFn: () => base44.entities.Shift.list("-date", 200) });
  const { data: timeOffRequests = [] } = useQuery({ queryKey: ["timeoff"], queryFn: () => base44.entities.TimeOffRequest.filter({ status: "pending" }) });
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: () => base44.entities.Alert.list("-created_date", 50) });
  const { data: swapRequests = [] } = useQuery({ queryKey: ["shift-swaps-dash"], queryFn: () => base44.entities.ShiftSwapRequest.list("-created_date", 50) });

  const activeEmployees = employees.filter(e => e.status === "active");
  const activeLocations = locations.filter(l => l.status === "active");
  const todayStr = format(today, "yyyy-MM-dd");
  const todayShifts = shifts.filter(s => s.date === todayStr);
  const openShifts = shifts.filter(s => s.status === "open");
  const weekShifts = shifts.filter(s => s.date >= weekStart && s.date <= weekEnd);
  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const pendingSwaps = swapRequests.filter(s => s.status === "pending_employee" || s.status === "pending_manager");

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

      {/* Hero Section */}
      <div className="text-center mb-16">
        <p className="text-[#1a9c5b] font-semibold text-sm uppercase tracking-widest mb-5">
          {format(today, "EEEE, MMMM d, yyyy")}
        </p>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-5 leading-tight">
          {greeting}.
        </h1>
        <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
          Here's a live view of your team's schedule and activity.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link to={createPageUrl("Schedule")}>
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] rounded-full px-6 h-11 text-sm font-semibold shadow-sm">
              <CalendarDays className="w-4 h-4 mr-2" /> View Schedule
            </Button>
          </Link>
          <Button
            variant="outline"
            className="rounded-full px-6 h-11 text-sm font-semibold border-gray-200"
            onClick={() => setBroadcastOpen(true)}
          >
            <Send className="w-4 h-4 mr-2" /> Message Team
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {(openShifts.length > 0 || unresolvedAlerts.length > 0 || pendingSwaps.length > 0) && (
        <div className="mb-10 bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-900">Attention needed</p>
            <p className="text-amber-700 text-sm mt-0.5 leading-relaxed">
              {openShifts.length > 0 && `${openShifts.length} open shift${openShifts.length > 1 ? "s" : ""} need coverage. `}
              {unresolvedAlerts.length > 0 && `${unresolvedAlerts.length} unresolved alert${unresolvedAlerts.length > 1 ? "s" : ""}. `}
              {pendingSwaps.length > 0 && `${pendingSwaps.length} shift swap${pendingSwaps.length > 1 ? "s" : ""} pending review.`}
            </p>
          </div>
          <Link to={createPageUrl("Alerts")} className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
            View <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {[
          { label: "Active Guards", value: activeEmployees.length, sub: `of ${employees.length} total`, icon: Users, color: "text-[#1a9c5b]", bg: "bg-[#f0faf5]" },
          { label: "Today's Shifts", value: todayShifts.length, sub: `${todayShifts.filter(s => s.status === "scheduled").length} confirmed`, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Locations", value: activeLocations.length, sub: `${locations.length} total`, icon: MapPin, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Week Hours", value: Math.round(totalWeekHours), sub: `${weekShifts.length} shifts`, icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-colors">
            <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1.5">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column content */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Upcoming Shifts */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Shifts</h2>
            <Link to={createPageUrl("Schedule")} className="text-sm font-semibold text-[#1a9c5b] hover:underline flex items-center gap-1">
              Full schedule <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {upcomingShifts.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-10 text-center">
              <CalendarDays className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">No upcoming shifts scheduled</p>
              <Link to={createPageUrl("Schedule")}>
                <Button size="sm" className="mt-4 bg-[#1a9c5b] hover:bg-[#158a4e] rounded-full text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add a shift
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingShifts.map(shift => (
                <div key={shift.id} className="flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all">
                  <div className="w-9 h-9 rounded-full bg-[#1a9c5b]/10 flex items-center justify-center text-sm font-bold text-[#1a9c5b] flex-shrink-0">
                    {(shift.employee_name || "?")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{shift.employee_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{shift.location_name} · {shift.start_time}–{shift.end_time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-gray-200 text-gray-500 rounded-full font-medium flex-shrink-0">{shift.date}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-7">

          {/* Pending Swaps */}
          {pendingSwaps.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Shift Swaps</h2>
                <Link to={createPageUrl("ShiftSwaps")} className="text-sm font-semibold text-[#1a9c5b] hover:underline flex items-center gap-1">
                  Review <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-2">
                {pendingSwaps.slice(0, 2).map(swap => (
                  <div key={swap.id} className="flex items-center gap-3.5 p-3.5 rounded-xl border border-orange-100 bg-orange-50/50">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <ArrowLeftRight className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{swap.requester_employee_name} ↔ {swap.target_employee_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{swap.requester_shift_date}</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 rounded-full text-xs">Pending</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Off Requests */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Time Off</h2>
              <Link to={createPageUrl("TimeOff")} className="text-sm font-semibold text-[#1a9c5b] hover:underline flex items-center gap-1">
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {timeOffRequests.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-7 text-center">
                <CheckCircle2 className="w-7 h-7 text-[#1a9c5b]/30 mx-auto mb-2" />
                <p className="text-gray-400 text-sm font-medium">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {timeOffRequests.slice(0, 3).map(req => (
                  <div key={req.id} className="flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-all">
                    <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-sm font-bold text-amber-700 flex-shrink-0">
                      {(req.employee_name || "?")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{req.employee_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{req.start_date} – {req.end_date}</p>
                    </div>
                    <Badge className="bg-amber-50 text-amber-600 border-amber-200 rounded-full text-xs">Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Add Shift", page: "Schedule", icon: CalendarDays },
                { label: "Add Employee", page: "Employees", icon: Users },
                { label: "View Reports", page: "Reports", icon: TrendingUp },
                { label: "View Alerts", page: "Alerts", icon: Bell, badge: unresolvedAlerts },
              ].map((action, i) => (
                <Link
                  key={i}
                  to={createPageUrl(action.page)}
                  className="flex items-center gap-2.5 p-3.5 rounded-xl border border-gray-100 hover:border-[#1a9c5b]/30 hover:bg-[#f0faf5] transition-all group"
                >
                  <action.icon className="w-4 h-4 text-gray-400 group-hover:text-[#1a9c5b] transition-colors" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
                  {action.badge > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">{action.badge > 9 ? "9+" : action.badge}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BroadcastDialog open={broadcastOpen} onOpenChange={setBroadcastOpen} employees={employees} />
    </div>
  );
}