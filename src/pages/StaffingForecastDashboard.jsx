import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { AlertTriangle, TrendingDown, Zap } from "lucide-react";

export default function StaffingForecastDashboard() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { data: forecasts = [] } = useQuery({
    queryKey: ["forecasts"],
    queryFn: () => base44.entities.StaffingForecast.list("-created_date", 100)
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list()
  });

  const locForecasts = selectedLocation
    ? forecasts.filter(f => f.location_id === selectedLocation)
    : forecasts;

  const highRisk = locForecasts.filter(f => f.risk_level === "high");
  const mediumRisk = locForecasts.filter(f => f.risk_level === "medium");
  const totalShortage = locForecasts.reduce((sum, f) => sum + Math.max(0, f.predicted_shortage || 0), 0);

  // Chart data
  const chartData = locForecasts
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 7)
    .map(f => ({
      date: f.date.slice(5),
      required: f.required_staff,
      scheduled: f.scheduled_staff,
      shortage: f.predicted_shortage
    }));

  const getRiskColor = (level) => {
    if (level === "high") return "bg-red-100 text-red-800";
    if (level === "medium") return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Staffing Forecast</h1>

      {locations.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedLocation(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${!selectedLocation ? "bg-green-600 text-white" : "bg-gray-100"}`}
          >
            All Locations
          </button>
          {locations.map(loc => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(loc.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedLocation === loc.id ? "bg-green-600 text-white" : "bg-gray-100"}`}
            >
              {loc.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">{highRisk.length}</div>
            <p className="text-sm text-gray-600">High Risk Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-600">{mediumRisk.length}</div>
            <p className="text-sm text-gray-600">Medium Risk Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-orange-600">{totalShortage}</div>
            <p className="text-sm text-gray-600">Total Staff Needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{locForecasts.length}</div>
            <p className="text-sm text-gray-600">Forecasted Periods</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>7-Day Staffing Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="required" fill="#8b5cf6" name="Required Staff" />
                <Bar dataKey="scheduled" fill="#10b981" name="Scheduled Staff" />
                <Bar dataKey="shortage" fill="#ef4444" name="Shortage" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {highRisk.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              High Risk Days
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highRisk.slice(0, 5).map((forecast) => (
              <div key={forecast.id} className="border-l-4 border-red-500 pl-4 py-2">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold">{forecast.location_name} - {forecast.date}</h4>
                    <p className="text-sm text-gray-700">{forecast.shift_start_time} - {forecast.shift_end_time}</p>
                  </div>
                  <Badge variant="destructive">{forecast.risk_level.toUpperCase()}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                  <div><span className="text-gray-600">Required:</span> <span className="font-semibold">{forecast.required_staff}</span></div>
                  <div><span className="text-gray-600">Scheduled:</span> <span className="font-semibold">{forecast.scheduled_staff}</span></div>
                  <div className="text-red-600"><span>Shortage:</span> <span className="font-semibold">{forecast.predicted_shortage}</span></div>
                </div>
                <p className="text-sm text-gray-700 font-semibold">{forecast.recommended_action}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}