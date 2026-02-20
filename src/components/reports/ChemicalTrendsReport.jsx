import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const statusColor = { pass: "bg-green-100 text-green-700", requires_action: "bg-yellow-100 text-yellow-700", critical: "bg-red-100 text-red-700" };

const PH_IDEAL = [7.2, 7.8];
const CL_IDEAL = [1.0, 3.0];

export default function ChemicalTrendsReport({ chemicalLogs, locations, dateFrom, dateTo, locationFilter }) {
  const filtered = chemicalLogs.filter(l => {
    if (dateFrom && l.date < dateFrom) return false;
    if (dateTo && l.date > dateTo) return false;
    if (locationFilter && l.location_id !== locationFilter) return false;
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const chartData = filtered.map(l => ({
    date: l.date,
    label: `${l.date} ${l.time || ""}`.trim(),
    ph: l.ph_level,
    chlorine: l.free_chlorine,
    alkalinity: l.alkalinity,
    temp: l.temperature_f,
  }));

  // Stats
  const phAvg = filtered.length ? (filtered.reduce((a, b) => a + (b.ph_level || 0), 0) / filtered.length).toFixed(2) : "—";
  const clAvg = filtered.length ? (filtered.reduce((a, b) => a + (b.free_chlorine || 0), 0) / filtered.length).toFixed(2) : "—";
  const criticalCount = filtered.filter(l => l.status === "critical").length;
  const actionCount = filtered.filter(l => l.status === "requires_action").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Logs", value: filtered.length, sub: "entries" },
          { label: "Avg pH", value: phAvg, sub: `ideal: ${PH_IDEAL[0]}–${PH_IDEAL[1]}` },
          { label: "Avg Free Chlorine", value: clAvg, sub: `ideal: ${CL_IDEAL[0]}–${CL_IDEAL[1]} ppm` },
          { label: "Critical Readings", value: criticalCount, sub: `${actionCount} require action` },
        ].map((s, i) => (
          <div key={i} className="bg-gray-50 rounded-2xl p-5">
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs font-medium text-gray-600 mt-1">{s.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <Card className="p-6 border border-gray-100 shadow-none rounded-2xl">
        <h3 className="text-base font-semibold text-gray-900 mb-4">pH Level Trend</h3>
        {chartData.length === 0 ? <p className="text-sm text-gray-400">No data for selected range</p> : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[6.5, 8.5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="ph" stroke="#0ea5e9" dot={false} strokeWidth={2} name="pH" />
            </LineChart>
          </ResponsiveContainer>
        )}
        <div className="flex gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-green-400" /> Ideal: {PH_IDEAL[0]}–{PH_IDEAL[1]}</span>
        </div>
      </Card>

      <Card className="p-6 border border-gray-100 shadow-none rounded-2xl">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Chlorine & Alkalinity Trend</h3>
        {chartData.length === 0 ? <p className="text-sm text-gray-400">No data for selected range</p> : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="chlorine" stroke="#10b981" dot={false} strokeWidth={2} name="Free Chlorine" />
              <Line type="monotone" dataKey="alkalinity" stroke="#8b5cf6" dot={false} strokeWidth={2} name="Alkalinity" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-6 border border-gray-100 shadow-none rounded-2xl">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Log Entries</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Date", "Location", "pH", "Free Cl", "Alkalinity", "Temp (°F)", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...filtered].reverse().slice(0, 20).map((l, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-1.5 pr-3 text-gray-700">{l.date}</td>
                  <td className="py-1.5 pr-3 text-gray-600">{l.location_name}</td>
                  <td className="py-1.5 pr-3">{l.ph_level ?? "—"}</td>
                  <td className="py-1.5 pr-3">{l.free_chlorine ?? "—"}</td>
                  <td className="py-1.5 pr-3">{l.alkalinity ?? "—"}</td>
                  <td className="py-1.5 pr-3">{l.temperature_f ?? "—"}</td>
                  <td className="py-1.5">
                    <Badge className={`text-[10px] rounded-full ${statusColor[l.status] || "bg-gray-100"}`}>{l.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}