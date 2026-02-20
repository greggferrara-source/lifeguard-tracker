import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, ClipboardList, Droplets, Wrench, Users, CheckSquare, LogIn, LogOut, MapPin, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EmployeeDashboard() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list(),
  });

  const { data: clockEntries = [] } = useQuery({
    queryKey: ["clock-entries-today"],
    queryFn: () => base44.entities.ClockEntry.filter({ status: "clocked_in" }),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["my-assignments"],
    queryFn: () => base44.entities.Assignment.filter({ status: "pending" }),
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ["my-shifts"],
    queryFn: () => base44.entities.Shift.filter({ date: format(new Date(), "yyyy-MM-dd") }),
  });

  const activeClock = clockEntries.find(e => e.status === "clocked_in");
  const todayShifts = shifts.filter(s => s.status !== "cancelled");

  const clockIn = useMutation({
    mutationFn: (locationId) => base44.entities.ClockEntry.create({
      employee_id: user?.id,
      employee_name: user?.full_name,
      location_id: locationId,
      location_name: locations.find(l => l.id === locationId)?.name,
      clock_in: new Date().toISOString(),
      status: "clocked_in",
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clock-entries-today"] }),
  });

  const clockOut = useMutation({
    mutationFn: () => {
      const mins = Math.round((new Date() - new Date(activeClock.clock_in)) / 60000);
      return base44.entities.ClockEntry.update(activeClock.id, {
        clock_out: new Date().toISOString(),
        status: "clocked_out",
        total_minutes: mins,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clock-entries-today"] }),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const isAdminOrManager = user?.role === "admin" || user?.role === "manager";

  // Admin clock-in/out on behalf of an employee
  const [adminClockOpen, setAdminClockOpen] = useState(false);
  const [adminEmpId, setAdminEmpId] = useState("");
  const [adminLocationId, setAdminLocationId] = useState("");

  const adminClockIn = useMutation({
    mutationFn: () => {
      const emp = employees.find(e => e.id === adminEmpId);
      return base44.entities.ClockEntry.create({
        employee_id: adminEmpId,
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : "",
        location_id: adminLocationId,
        location_name: locations.find(l => l.id === adminLocationId)?.name,
        clock_in: new Date().toISOString(),
        status: "clocked_in",
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["clock-entries-today"] }); setAdminClockOpen(false); setAdminEmpId(""); setAdminLocationId(""); },
  });

  const adminClockOut = useMutation({
    mutationFn: (entry) => {
      const mins = Math.round((new Date() - new Date(entry.clock_in)) / 60000);
      return base44.entities.ClockEntry.update(entry.id, { clock_out: new Date().toISOString(), status: "clocked_out", total_minutes: mins });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clock-entries-today"] }),
  });

  const [clockLocationId, setClockLocationId] = useState("");

  const quickLinks = [
    { label: "Chemical Logs", icon: Droplets, page: "ChemicalLogs", color: "bg-blue-50 text-blue-600 border-blue-200" },
    { label: "Maintenance", icon: Wrench, page: "MaintenanceReports", color: "bg-orange-50 text-orange-600 border-orange-200" },
    { label: "Patron Count", icon: Users, page: "PatronCounts", color: "bg-purple-50 text-purple-600 border-purple-200" },
    { label: "Inspections", icon: ClipboardList, page: "Inspections", color: "bg-green-50 text-green-600 border-green-200" },
    { label: "Assignments", icon: CheckSquare, page: "Assignments", color: "bg-amber-50 text-amber-600 border-amber-200" },
    { label: "My Schedule", icon: Clock, page: "Schedule", color: "bg-gray-50 text-gray-600 border-gray-200" },
  ];

  const now = new Date();
  const elapsed = activeClock ? Math.round((now - new Date(activeClock.clock_in)) / 60000) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening"}, {user?.full_name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-gray-500 mt-1">{format(now, "EEEE, MMMM d, yyyy")}</p>
      </div>

      {/* Clock In/Out Card */}
      <Card className={`border-2 ${activeClock ? "border-green-300 bg-green-50" : "border-gray-200"}`}>
        <CardContent className="pt-5 pb-5">
          {activeClock ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="font-semibold text-green-800">Clocked In</p>
                  <p className="text-sm text-green-700">
                    {activeClock.location_name} · {Math.floor(elapsed / 60)}h {elapsed % 60}m
                  </p>
                  <p className="text-xs text-green-600">Since {format(new Date(activeClock.clock_in), "h:mm a")}</p>
                </div>
              </div>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white gap-2"
                onClick={() => clockOut.mutate()}
                disabled={clockOut.isPending}
              >
                <LogOut className="w-4 h-4" /> Clock Out
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <LogIn className="w-4 h-4 text-[#1a9c5b]" /> Clock In
              </p>
              <div className="flex gap-2">
                <select
                  value={clockLocationId}
                  onChange={e => setClockLocationId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">Select location...</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <Button
                  className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2"
                  onClick={() => clockIn.mutate(clockLocationId)}
                  disabled={!clockLocationId || clockIn.isPending}
                >
                  <LogIn className="w-4 h-4" /> Clock In
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Shifts */}
      {todayShifts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1a9c5b]" /> Today's Shifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayShifts.map(shift => (
                <div key={shift.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{shift.location_name || "Unknown"}</span>
                  </div>
                  <span className="text-gray-600">{shift.start_time} – {shift.end_time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Assignments */}
      {assignments.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-600" />
              {assignments.length} Pending Assignment{assignments.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assignments.slice(0, 3).map(a => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{a.title}</span>
                  <Badge className={a.priority === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                    {a.priority}
                  </Badge>
                </div>
              ))}
            </div>
            <Link to={createPageUrl("Assignments")}>
              <Button variant="outline" size="sm" className="mt-3 w-full">View All Assignments</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickLinks.map(({ label, icon: Icon, page, color }) => (
            <Link key={page} to={createPageUrl(page)}>
              <Card className={`border cursor-pointer hover:shadow-md transition-shadow ${color}`}>
                <CardContent className="pt-4 pb-4 flex flex-col items-center gap-2">
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium text-center">{label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}