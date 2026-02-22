import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingDown, AlertTriangle } from "lucide-react";

export default function IncidentTrendReport() {
  const [timeRange, setTimeRange] = useState("30");

  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => base44.entities.IncidentLog.list("-created_date", 500)
  });

  const { data: trends = [] } = useQuery({
    queryKey: ["trends"],
    queryFn: () => base44.entities.IncidentTrend.list("-created_date", 100)
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list()
  });

  const days = parseInt(timeRange);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const recentIncidents = incidents.filter(i => new Date(i.date) > cutoff);

  // Type breakdown
  const typeCount = {};
  recentIncidents.forEach(i => {
    typeCount[i.type] = (typeCount[i.type] || 0) + 1;
  });

  const typeData = Object.entries(typeCount).map(([type, count]) => ({ type, count }));

  // Severity breakdown
  const sevCount = {};
  recentIncidents.forEach(i => {
    sevCount[i.severity] = (sevCount[i.severity] || 0) + 1;
  });

  const sevData = Object.entries(sevCount).map(([sev, count]) => ({ severity: sev, count }));

  // Hourly hotspots
  const hourCount = {};
  recentIncidents.forEach(i => {
    const hour = new Date(`${i.date}T${i.time || '12:00'}`).getHours();
    hourCount[hour] = (hourCount[hour] || 0) + 1;
  });

  const hourData = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}:00`,
    incidents: hourCount[h] || 0
  }));

  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Incident Trends</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{recentIncidents.length}</div>
            <p className="text-sm text-gray-600 mt-1">Total Incidents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{(recentIncidents.length / days).toFixed(1)}</div>
            <p className="text-sm text-gray-600 mt-1">Per Day Avg</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">
              {recentIncidents.filter(i => i.severity === "critical").length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Critical Incidents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-600">
              {recentIncidents.filter(i => i.type === "rescue").length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Rescues</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Incident Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={sevData} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={100}>
                  {sevData.map((entry, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Incident Hotspots by Hour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}