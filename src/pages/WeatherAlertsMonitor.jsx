import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap, Thermometer, Wind, Cloud } from "lucide-react";

export default function WeatherAlertsMonitor() {
  const { data: alerts = [] } = useQuery({
    queryKey: ["weather-alerts"],
    queryFn: () => base44.entities.WeatherAlert.filter({ status: "active" }),
    refetchInterval: 300000 // 5 minutes
  });

  const activeAlerts = alerts.filter(a => a.status === "active");
  const critical = activeAlerts.filter(a => a.severity === "critical");
  const warnings = activeAlerts.filter(a => a.severity === "warning");

  const getAlertIcon = (type) => {
    switch (type) {
      case "lightning":
        return <Zap className="w-6 h-6 text-yellow-500" />;
      case "extreme_heat":
        return <Thermometer className="w-6 h-6 text-red-500" />;
      case "high_wind":
        return <Wind className="w-6 h-6 text-blue-500" />;
      default:
        return <Cloud className="w-6 h-6 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "evacuate":
        return "bg-red-100 text-red-800";
      case "close_pool":
        return "bg-red-50 text-red-700";
      case "reduce_operations":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Weather Alerts</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">{critical.length}</div>
            <p className="text-sm text-gray-600">Critical Alerts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-600">{warnings.length}</div>
            <p className="text-sm text-gray-600">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{activeAlerts.length}</div>
            <p className="text-sm text-gray-600">Active Alerts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600">Last Updated</div>
            <div className="text-lg font-semibold">
              {new Date().toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {critical.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {critical.map((alert) => (
              <div key={alert.id} className="border-l-4 border-red-500 pl-4 py-2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.alert_type)}
                    <div>
                      <h4 className="font-bold text-gray-900">{alert.location_name}</h4>
                      <p className="text-sm text-gray-700">{alert.condition_description}</p>
                    </div>
                  </div>
                  <Badge className={getActionColor(alert.recommended_action)}>
                    {alert.recommended_action.replace(/_/g, " ").toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {alert.temperature !== undefined && (
                    <div><span className="text-gray-600">Temp:</span> <span className="font-semibold">{alert.temperature}°F</span></div>
                  )}
                  {alert.wind_speed !== undefined && (
                    <div><span className="text-gray-600">Wind:</span> <span className="font-semibold">{alert.wind_speed} mph</span></div>
                  )}
                  {alert.humidity !== undefined && (
                    <div><span className="text-gray-600">Humidity:</span> <span className="font-semibold">{alert.humidity}%</span></div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {warnings.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Warnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {warnings.map((alert) => (
              <div key={alert.id} className="border-l-4 border-yellow-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.alert_type)}
                    <div>
                      <h4 className="font-bold text-gray-900">{alert.location_name}</h4>
                      <p className="text-sm text-gray-700">{alert.condition_description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{alert.alert_type.replace(/_/g, " ").toUpperCase()}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeAlerts.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-600">No active weather alerts. All systems operational.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}