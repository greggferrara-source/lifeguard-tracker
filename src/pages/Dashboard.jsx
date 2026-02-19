import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, MapPin, CalendarDays, Clock } from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import StatCard from "@/components/dashboard/StatCard";
import UpcomingShifts from "@/components/dashboard/UpcomingShifts";
import OpenShiftsAlert from "@/components/dashboard/OpenShiftsAlert";

export default function Dashboard() {
  const today = new Date();
  const weekStart = format(startOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd");

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list(),
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => base44.entities.Shift.list("-date", 100),
  });

  const { data: timeOffRequests = [] } = useQuery({
    queryKey: ["timeoff"],
    queryFn: () => base44.entities.TimeOffRequest.filter({ status: "pending" }),
  });

  const activeEmployees = employees.filter(e => e.status === "active");
  const activeLocations = locations.filter(l => l.status === "active");
  const todayShifts = shifts.filter(s => s.date === format(today, "yyyy-MM-dd"));
  const openShifts = shifts.filter(s => s.status === "open");

  const weekShifts = shifts.filter(s => s.date >= weekStart && s.date <= weekEnd);
  const totalWeekHours = weekShifts.reduce((sum, s) => {
    if (!s.start_time || !s.end_time) return sum;
    const [sh, sm] = s.start_time.split(":").map(Number);
    const [eh, em] = s.end_time.split(":").map(Number);
    return sum + (eh + em / 60) - (sh + sm / 60);
  }, 0);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Good {today.getHours() < 12 ? "morning" : today.getHours() < 17 ? "afternoon" : "evening"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {format(today, "EEEE, MMMM d, yyyy")} · Here's your overview
        </p>
      </div>

      {/* Open Shifts Alert */}
      <OpenShiftsAlert count={openShifts.length} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Guards"
          value={activeEmployees.length}
          subtitle={`${employees.length} total employees`}
          icon={Users}
          gradient="from-cyan-500 to-blue-600"
          delay={0}
        />
        <StatCard
          title="Today's Shifts"
          value={todayShifts.length}
          subtitle={`${todayShifts.filter(s => s.status === "scheduled").length} confirmed`}
          icon={CalendarDays}
          gradient="from-emerald-500 to-teal-600"
          delay={0.05}
        />
        <StatCard
          title="Locations"
          value={activeLocations.length}
          subtitle={`${locations.length} total`}
          icon={MapPin}
          gradient="from-violet-500 to-purple-600"
          delay={0.1}
        />
        <StatCard
          title="Week Hours"
          value={totalWeekHours.toFixed(0)}
          subtitle={`${weekShifts.length} shifts this week`}
          icon={Clock}
          gradient="from-orange-500 to-rose-600"
          delay={0.15}
        />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <UpcomingShifts shifts={shifts.filter(s => s.date >= format(today, "yyyy-MM-dd"))} />

        {/* Pending Time Off */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Pending Time Off Requests</h3>
          <div className="space-y-2">
            {timeOffRequests.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">No pending requests</p>
            )}
            {timeOffRequests.slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center text-xs font-bold text-cyan-700">
                  {(req.employee_name || "?")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{req.employee_name}</p>
                  <p className="text-xs text-slate-500">{req.start_date} – {req.end_date}</p>
                </div>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}