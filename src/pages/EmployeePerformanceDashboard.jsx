import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import { Star, TrendingUp, AlertTriangle, Award } from "lucide-react";

export default function EmployeePerformanceDashboard() {
  const [sortBy, setSortBy] = useState("rating");

  const { data: performances = [] } = useQuery({
    queryKey: ["performances"],
    queryFn: () => base44.entities.EmployeePerformance.list()
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["badges"],
    queryFn: () => base44.entities.EmployeeBadge.list()
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list()
  });

  const sorted = [...performances].sort((a, b) => {
    if (sortBy === "rating") return b.performance_rating - a.performance_rating;
    if (sortBy === "hours") return b.total_hours - a.total_hours;
    if (sortBy === "attendance") return b.attendance_rate - a.attendance_rate;
    return 0;
  });

  const topPerformers = sorted.slice(0, 10);
  const avgRating = (performances.reduce((sum, p) => sum + (p.performance_rating || 0), 0) / performances.length).toFixed(1);
  const avgAttendance = (performances.reduce((sum, p) => sum + (p.attendance_rate || 0), 0) / performances.length).toFixed(0);

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-blue-600";
    if (rating >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Employee Performance</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{avgRating}</div>
            <p className="text-sm text-gray-600 mt-1">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{avgAttendance}%</div>
            <p className="text-sm text-gray-600 mt-1">Avg Attendance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{performances.filter(p => p.certifications_expiring > 0).length}</div>
            <p className="text-sm text-gray-600 mt-1">Expiring Certs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{badges.length}</div>
            <p className="text-sm text-gray-600 mt-1">Total Badges Earned</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        {["rating", "hours", "attendance"].map(opt => (
          <button
            key={opt}
            onClick={() => setSortBy(opt)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${sortBy === opt ? "bg-green-600 text-white" : "bg-gray-100"}`}
          >
            Sort by {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {topPerformers.map((perf) => {
          const empBadges = badges.filter(b => b.employee_id === perf.employee_id);
          return (
            <Card key={perf.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{perf.employee_name}</h3>
                      <span className={`text-2xl font-bold ${getRatingColor(perf.performance_rating)}`}>
                        {perf.performance_rating ? perf.performance_rating.toFixed(1) : "N/A"}
                      </span>
                      {Array.from({ length: Math.round(perf.performance_rating || 0) }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>Shifts: <span className="font-semibold">{perf.total_shifts_worked}</span></div>
                      <div>Hours: <span className="font-semibold">{perf.total_hours}</span></div>
                      <div>Attendance: <span className="font-semibold">{perf.attendance_rate}%</span></div>
                      <div>Incidents: <span className="font-semibold">{perf.incidents_responded_to}</span></div>
                    </div>
                    {perf.certifications_expiring > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-yellow-600 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        {perf.certifications_expiring} cert(s) expiring soon
                      </div>
                    )}
                    {empBadges.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {empBadges.slice(0, 5).map((badge) => (
                          <Badge key={badge.id} variant="secondary" className="text-xs">
                            {badge.badge_icon} {badge.badge_name}
                          </Badge>
                        ))}
                        {empBadges.length > 5 && <Badge variant="outline">+{empBadges.length - 5}</Badge>}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-2">Reliability Score</div>
                    <div className="text-3xl font-bold text-green-600">{perf.reliability_score || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}