import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, Users, CalendarDays, RefreshCw, CheckCircle2,
  Zap, TrendingDown, MapPin, Clock
} from "lucide-react";

const riskConfig = {
  critical: { label: "Critical", color: "text-red-600", bg: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
  high: { label: "High Risk", color: "text-orange-600", bg: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  medium: { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
};

export default function StaffingForecast() {
  const [daysAhead, setDaysAhead] = useState("7");
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const runForecast = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("predictUnderstaffing", { days_ahead: Number(daysAhead) });
    setPredictions(res.data);
    setLoading(false);
  };

  const criticalCount = predictions?.predictions?.filter(p => p.risk === "critical").length || 0;
  const highCount = predictions?.predictions?.filter(p => p.risk === "high").length || 0;
  const mediumCount = predictions?.predictions?.filter(p => p.risk === "medium").length || 0;

  // Group by date
  const byDate = {};
  (predictions?.predictions || []).forEach(p => {
    if (!byDate[p.date]) byDate[p.date] = [];
    byDate[p.date].push(p);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-[#1a9c5b]" />
            Staffing Forecast
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            AI-powered prediction of upcoming understaffing risks based on schedules, time-off, and location requirements
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={daysAhead} onValueChange={setDaysAhead}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Next 7 days</SelectItem>
              <SelectItem value="14">Next 14 days</SelectItem>
              <SelectItem value="30">Next 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2"
            onClick={runForecast}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Analyzing..." : "Run Forecast"}
          </Button>
        </div>
      </div>

      {/* Initial state */}
      {!predictions && !loading && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="py-16 text-center">
            <Zap className="w-12 h-12 text-[#1a9c5b] mx-auto mb-4 opacity-60" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Run a Staffing Forecast</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
              Analyze upcoming schedules against location staffing requirements, approved time-off,
              and available staff to identify coverage gaps before they become problems.
            </p>
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2" onClick={runForecast}>
              <Zap className="w-4 h-4" /> Run Forecast Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {predictions && (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`rounded-xl border p-5 ${criticalCount > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
              <AlertTriangle className={`w-5 h-5 mb-2 ${criticalCount > 0 ? "text-red-500" : "text-gray-400"}`} />
              <p className={`text-3xl font-bold ${criticalCount > 0 ? "text-red-600" : "text-gray-400"}`}>{criticalCount}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Critical Gaps</p>
              <p className="text-[11px] text-gray-400">0 staff scheduled</p>
            </div>
            <div className={`rounded-xl border p-5 ${highCount > 0 ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}>
              <Users className={`w-5 h-5 mb-2 ${highCount > 0 ? "text-orange-500" : "text-gray-400"}`} />
              <p className={`text-3xl font-bold ${highCount > 0 ? "text-orange-600" : "text-gray-400"}`}>{highCount}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">High Risk Gaps</p>
              <p className="text-[11px] text-gray-400">Below minimum staffing</p>
            </div>
            <div className={`rounded-xl border p-5 ${mediumCount > 0 ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200"}`}>
              <Clock className={`w-5 h-5 mb-2 ${mediumCount > 0 ? "text-yellow-500" : "text-gray-400"}`} />
              <p className={`text-3xl font-bold ${mediumCount > 0 ? "text-yellow-600" : "text-gray-400"}`}>{mediumCount}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Medium Risk</p>
              <p className="text-[11px] text-gray-400">Open shifts unfilled</p>
            </div>
          </div>

          {/* All clear */}
          {predictions.predictions.length === 0 && (
            <Card>
              <CardContent className="py-14 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">All Clear!</h3>
                <p className="text-gray-500 text-sm">
                  No staffing issues detected for the next {daysAhead} days across {predictions.checked_locations} location(s).
                </p>
              </CardContent>
            </Card>
          )}

          {/* Grouped by date */}
          {Object.keys(byDate).sort().map(date => {
            const items = byDate[date];
            const d = new Date(date + "T12:00:00");
            const dateLabel = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
            const hasCritical = items.some(i => i.risk === "critical");
            return (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <h3 className="font-semibold text-gray-800">{dateLabel}</h3>
                  {hasCritical && <Badge className="bg-red-100 text-red-700 text-[10px]">Critical</Badge>}
                </div>
                <div className="space-y-3">
                  {items.map((p, i) => {
                    const cfg = riskConfig[p.risk];
                    return (
                      <div key={i} className={`rounded-xl border p-4 ${cfg.bg}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-semibold text-gray-900">{p.location_name}</span>
                                <Badge className={`text-[10px] ${cfg.badge}`}>{cfg.label}</Badge>
                              </div>
                              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {p.scheduled} scheduled / {p.required} required
                                </span>
                                {p.shortage > 0 && (
                                  <span className={`font-semibold ${cfg.color}`}>
                                    Short by {p.shortage}
                                  </span>
                                )}
                                {p.open_shifts > 0 && (
                                  <span className="text-yellow-600">{p.open_shifts} open shift(s)</span>
                                )}
                                <span className="text-gray-400">{p.available_pool} staff available</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <p className="text-xs text-gray-400 text-center">
            Forecast checked {predictions.checked_locations} active location(s) over {predictions.days_ahead} days.
            Last run: {new Date().toLocaleTimeString()}
          </p>
        </>
      )}
    </div>
  );
}