import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Brain, MapPin, Clock, Users, CheckCircle, RefreshCw, Bell } from "lucide-react";

export default function GuardAIInsights() {
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState([]);
  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.filter({ status: "active" }),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list(),
  });

  const { data: clockEntries = [] } = useQuery({
    queryKey: ["clock-entries"],
    queryFn: () => base44.entities.ClockEntry.filter({ status: "clocked_in" }),
  });

  const { data: patronCounts = [] } = useQuery({
    queryKey: ["patron-counts"],
    queryFn: () => base44.entities.PatronCount.list("-created_date", 50),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["urgent-alerts"],
    queryFn: () => base44.entities.UrgentAlert.filter({ status: "active" }),
  });

  const analyzePatterns = async () => {
    setAnalyzing(true);
    try {
      const clockedInGuards = clockEntries.map(e => {
        const minutesSinceClockIn = Math.floor((Date.now() - new Date(e.clock_in).getTime()) / 60000);
        return {
          name: e.employee_name,
          location: e.location_name,
          minutesSinceClockIn,
          hasGPS: !!e.clock_in_latitude,
          verified: e.clock_in_verified,
        };
      });

      const locationSummary = locations.map(loc => {
        const guards = clockEntries.filter(e => e.location_id === loc.id);
        const recentPatrons = patronCounts.filter(p => p.location_id === loc.id).slice(0, 3);
        const avgPatrons = recentPatrons.length > 0
          ? Math.round(recentPatrons.reduce((s, p) => s + (p.count || 0), 0) / recentPatrons.length)
          : 0;
        return { name: loc.name, guardsOnDuty: guards.length, minRequired: loc.min_guards_required || 1, avgPatrons };
      });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI safety analyst for a lifeguard management system. Analyze this real-time data and provide actionable insights.

Guards currently clocked in: ${JSON.stringify(clockedInGuards)}
Location staffing summary: ${JSON.stringify(locationSummary)}
Active alerts: ${alerts.length}

Provide 3-5 specific insights covering:
1. Any guards who may need check-ins (clocked in >2 hours without GPS verification)
2. Understaffed locations relative to patron counts
3. Staffing repositioning recommendations
4. Any patterns of concern

Return JSON with this structure:
{
  "insights": [
    {
      "type": "warning|info|critical|suggestion",
      "title": "short title",
      "description": "detailed description",
      "location": "location name or null",
      "guard": "guard name or null",
      "action": "recommended action"
    }
  ],
  "overall_status": "good|caution|critical",
  "summary": "one sentence overall status"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: { type: "array", items: { type: "object" } },
            overall_status: { type: "string" },
            summary: { type: "string" },
          },
        },
      });

      setInsights(result);
    } finally {
      setAnalyzing(false);
    }
  };

  const typeConfig = {
    critical: { color: "bg-red-100 border-red-300 text-red-800", badge: "destructive", icon: AlertTriangle },
    warning: { color: "bg-orange-50 border-orange-200 text-orange-800", badge: "outline", icon: AlertTriangle },
    suggestion: { color: "bg-blue-50 border-blue-200 text-blue-800", badge: "secondary", icon: Brain },
    info: { color: "bg-green-50 border-green-200 text-green-800", badge: "outline", icon: CheckCircle },
  };

  const statusColor = {
    good: "bg-green-500",
    caution: "bg-orange-500",
    critical: "bg-red-500",
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" /> AI Guard Insights
          </h1>
          <p className="text-gray-500 text-sm mt-1">Pattern recognition and smart staffing recommendations</p>
        </div>
        <Button onClick={analyzePatterns} disabled={analyzing} className="bg-purple-600 hover:bg-purple-700">
          {analyzing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
          {analyzing ? "Analyzing..." : "Run Analysis"}
        </Button>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{clockEntries.length}</div>
              <div className="text-xs text-gray-500">Guards On Duty</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold">{locations.length}</div>
              <div className="text-xs text-gray-500">Active Locations</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Bell className="w-8 h-8 text-red-500" />
            <div>
              <div className="text-2xl font-bold">{alerts.length}</div>
              <div className="text-xs text-gray-500">Active Alerts</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Status */}
      {insights?.overall_status && (
        <Card className="border-2">
          <CardContent className="pt-4 pb-4 flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${statusColor[insights.overall_status]}`} />
            <div>
              <div className="font-semibold capitalize">{insights.overall_status === "good" ? "All Clear" : insights.overall_status === "caution" ? "Caution Advised" : "Immediate Attention Required"}</div>
              <div className="text-sm text-gray-600">{insights.summary}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights?.insights?.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">AI Recommendations</h2>
          {insights.insights.map((insight, i) => {
            const cfg = typeConfig[insight.type] || typeConfig.info;
            const Icon = cfg.icon;
            return (
              <Card key={i} className={`border ${cfg.color}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{insight.title}</span>
                        <Badge variant={cfg.badge} className="text-xs capitalize">{insight.type}</Badge>
                        {insight.location && <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{insight.location}</span>}
                        {insight.guard && <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" />{insight.guard}</span>}
                      </div>
                      <p className="text-sm mb-2">{insight.description}</p>
                      {insight.action && (
                        <div className="text-xs font-medium bg-white/50 rounded px-2 py-1 inline-block">
                          ➤ {insight.action}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : !analyzing && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="py-12 text-center">
            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Click "Run Analysis" to get AI-powered insights about your guards and staffing.</p>
          </CardContent>
        </Card>
      )}

      {/* Guards on duty detail */}
      {clockEntries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4" />Currently Clocked In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clockEntries.map((entry) => {
                const minutesOnDuty = Math.floor((Date.now() - new Date(entry.clock_in).getTime()) / 60000);
                const hoursOnDuty = Math.floor(minutesOnDuty / 60);
                const minsRemainder = minutesOnDuty % 60;
                const isLongShift = minutesOnDuty > 240;
                return (
                  <div key={entry.id} className={`flex items-center justify-between p-2 rounded-lg ${isLongShift ? "bg-orange-50" : "bg-gray-50"}`}>
                    <div>
                      <span className="font-medium text-sm">{entry.employee_name}</span>
                      <span className="text-gray-500 text-xs ml-2">{entry.location_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLongShift && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                      <span className="text-xs text-gray-600">{hoursOnDuty}h {minsRemainder}m</span>
                      <Badge variant={entry.clock_in_verified ? "default" : "outline"} className="text-xs">
                        {entry.clock_in_verified ? "GPS ✓" : "No GPS"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}