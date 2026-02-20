import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import {
  CalendarDays,
  Clock,
  Users,
  AlertTriangle,
  BarChart2,
  ArrowRight,
  Shield,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => base44.entities.Shift.list("-created_date", 100),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.list("-created_date", 100),
  });

  const { data: timeOffRequests = [] } = useQuery({
    queryKey: ["time-off"],
    queryFn: () => base44.entities.TimeOffRequest.list("-created_date", 100),
  });

  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length;
  const pendingTimeOff = timeOffRequests.filter(
    (r) => r.status === "pending"
  ).length;
  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const openShifts = shifts.filter((s) => s.status === "open").length;

  const isAdmin = user?.role === "admin";

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="px-6 py-20 sm:py-28 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Shift scheduling
          <br />
          made simple.
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Organize your team, manage schedules, and keep everyone aligned. All
          in one calm, organized place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl("Schedule")}>
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white px-8 py-6 text-lg rounded-xl h-auto">
              View Schedule
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to={createPageUrl("Employees")}>
            <Button
              variant="outline"
              className="px-8 py-6 text-lg rounded-xl h-auto border-2 border-gray-300 hover:border-gray-400"
            >
              Manage Team
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {activeEmployees}
            </div>
            <p className="text-gray-600">Active Team Members</p>
          </div>
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {openShifts}
            </div>
            <p className="text-gray-600">Open Shifts</p>
          </div>
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {pendingTimeOff}
            </div>
            <p className="text-gray-600">Time Off Requests</p>
          </div>
          {isAdmin && (
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {unresolvedAlerts}
              </div>
              <p className="text-gray-600">Unresolved Alerts</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">
          Everything you need to run your shifts
        </h2>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Schedule */}
          <Link
            to={createPageUrl("Schedule")}
            className="group p-8 rounded-xl border border-gray-200 hover:border-[#1a9c5b] hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#f0faf5] rounded-lg flex items-center justify-center group-hover:bg-[#1a9c5b] transition-colors">
                <CalendarDays className="w-6 h-6 text-[#1a9c5b] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Schedule</h3>
                <p className="text-gray-600 mt-1">
                  View shifts by week, location, or employee
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Build schedules with templates, spot conflicts instantly, and swap
              shifts on the fly.
            </p>
            <div className="flex items-center text-[#1a9c5b] font-medium group-hover:gap-2 transition-all">
              Open Schedule <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Employees */}
          <Link
            to={createPageUrl("Employees")}
            className="group p-8 rounded-xl border border-gray-200 hover:border-[#1a9c5b] hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#f0faf5] rounded-lg flex items-center justify-center group-hover:bg-[#1a9c5b] transition-colors">
                <Users className="w-6 h-6 text-[#1a9c5b] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Team</h3>
                <p className="text-gray-600 mt-1">
                  Manage profiles, roles, and certifications
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Keep employee info organized with certifications, availability
              settings, and availability windows.
            </p>
            <div className="flex items-center text-[#1a9c5b] font-medium group-hover:gap-2 transition-all">
              Manage Team <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Time Off */}
          <Link
            to={createPageUrl("TimeOff")}
            className="group p-8 rounded-xl border border-gray-200 hover:border-[#1a9c5b] hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#f0faf5] rounded-lg flex items-center justify-center group-hover:bg-[#1a9c5b] transition-colors">
                <Clock className="w-6 h-6 text-[#1a9c5b] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Time Off
                </h3>
                <p className="text-gray-600 mt-1">
                  Approve or deny time off requests
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Handle vacation and leave requests in one place with clear
              visibility into who's away.
            </p>
            <div className="flex items-center text-[#1a9c5b] font-medium group-hover:gap-2 transition-all">
              Manage Time Off <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Reports */}
          <Link
            to={createPageUrl("Reports")}
            className="group p-8 rounded-xl border border-gray-200 hover:border-[#1a9c5b] hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#f0faf5] rounded-lg flex items-center justify-center group-hover:bg-[#1a9c5b] transition-colors">
                <BarChart2 className="w-6 h-6 text-[#1a9c5b] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Reports</h3>
                <p className="text-gray-600 mt-1">
                  Track hours, coverage, and staffing
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              See KPIs, generate attendance reports, and monitor staffing levels
              across locations.
            </p>
            <div className="flex items-center text-[#1a9c5b] font-medium group-hover:gap-2 transition-all">
              View Reports <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="mt-12 pt-12 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Admin & Oversight
            </h3>
            <div className="grid md:grid-cols-2 gap-12">
              <Link
                to={createPageUrl("Alerts")}
                className="group p-8 rounded-xl border border-gray-200 hover:border-red-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-500 transition-colors">
                    <AlertTriangle className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">
                      Alerts
                    </h4>
                    <p className="text-gray-600 mt-1">
                      Admin-only monitoring and issues
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Review understaffing, conflicts, certification expirations,
                  and other critical issues.
                </p>
                <div className="flex items-center text-red-600 font-medium group-hover:gap-2 transition-all">
                  View Alerts <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>

              <Link
                to={createPageUrl("Notifications")}
                className="group p-8 rounded-xl border border-gray-200 hover:border-[#1a9c5b] hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#f0faf5] rounded-lg flex items-center justify-center group-hover:bg-[#1a9c5b] transition-colors">
                    <Zap className="w-6 h-6 text-[#1a9c5b] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Notifications
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Email and SMS campaign history
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Send broadcast messages, track notification delivery, and
                  review communication logs.
                </p>
                <div className="flex items-center text-[#1a9c5b] font-medium group-hover:gap-2 transition-all">
                  Manage Notifications <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Why ShiftGuard */}
      <section className="px-6 py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Why ShiftGuard?
          </h2>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#1a9c5b] rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Real-time insight
                </h3>
                <p className="text-gray-600">
                  See your schedule, open shifts, and staffing gaps at a glance.
                  No digging through spreadsheets.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#1a9c5b] rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Peace of mind
                </h3>
                <p className="text-gray-600">
                  Automated alerts for conflicts, understaffing, and missing
                  certifications keep you ahead.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#1a9c5b] rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Calm, organized
                </h3>
                <p className="text-gray-600">
                  A clean, intuitive interface that doesn't overwhelm. Everyone
                  can focus on their work.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#1a9c5b] rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Control shift coverage
                </h3>
                <p className="text-gray-600">
                  Easily swap shifts, handle time off requests, and manage your
                  team in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to simplify?</h2>
        <p className="text-xl text-gray-600 mb-10">
          Get your team organized and your schedule running smoothly.
        </p>
        <Link to={createPageUrl("Schedule")}>
          <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white px-8 py-6 text-lg rounded-xl h-auto">
            Start Scheduling Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </section>

      <DashboardFooter />
    </div>
  );
}