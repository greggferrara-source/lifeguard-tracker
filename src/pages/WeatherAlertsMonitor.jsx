import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Cloud, Droplets, Wind, Zap, CheckCircle2, MapPin } from "lucide-react";

export default function WeatherAlertsMonitor() {
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list()
  });

  const { data: weatherAlerts = [] } = useQuery({
    queryKey: ["weather-alerts"],
    queryFn: () => base44.entities.WeatherAlert.list("-issued_at", 100)
  });

  const { data: eventAlerts = [] } = useQuery({
    queryKey: ["event-alerts"],
    queryFn: () => base44.entities.EventAlert.list("-event_date", 50)
  });

  const activeWeatherAlerts = weatherAlerts.filter(a => !a.acknowledged && new Date() < new Date(a.expires_at));
  const upcomingEvents = eventAlerts.filter(e => new Date(e.event_date) >= new Date());

  const severityColors = {
    minor: 'text-blue-600',
    moderate: 'text-orange-600',
    severe: 'text-red-600'
  };

  const severityBgColors = {
    minor: 'bg-blue-50 border-blue-200',
    moderate: 'bg-orange-50 border-orange-200',
    severe: 'bg-red-50 border-red-200'
  };

  const impactColors = {
    none: 'bg-gray-100 text-gray-800',
    advisory: 'bg-blue-100 text-blue-800',
    limited_operations: 'bg-orange-100 text-orange-800',
    closure_recommended: 'bg-red-100 text-red-800'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Weather & Events Monitor</h1>
        <p className="text-gray-500 mt-1">Real-time weather alerts and local event impacts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Weather Alerts</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{activeWeatherAlerts.length}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Events</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{upcomingEvents.length}</p>
              </div>
              <Cloud className="w-5 h-5 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Monitored Locations</p>
                <p className="text-3xl font-bold text-[#1a9c5b] mt-1">{locations.length}</p>
              </div>
              <MapPin className="w-5 h-5 text-[#1a9c5b] opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Weather Alerts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Active Weather Alerts</h2>
        {activeWeatherAlerts.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">No active weather alerts</p>
            </CardContent>
          </Card>
        ) : (
          activeWeatherAlerts.map(alert => (
            <Card key={alert.id} className={`border-2 ${severityBgColors[alert.severity]}`}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${severityColors[alert.severity]}`}>
                      {alert.alert_type === 'severe_thunderstorm' && <Zap className="w-5 h-5" />}
                      {alert.alert_type === 'heavy_rain' && <Droplets className="w-5 h-5" />}
                      {alert.alert_type === 'wind' && <Wind className="w-5 h-5" />}
                      {!['severe_thunderstorm', 'heavy_rain', 'wind'].includes(alert.alert_type) && <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 capitalize">{alert.alert_type.replace(/_/g, ' ')}</h3>
                      <p className="text-sm text-gray-700 mt-1">{alert.location_name}</p>
                      <p className="text-xs text-gray-600 mt-2">{alert.description}</p>
                    </div>
                  </div>
                  <Badge className={impactColors[alert.impact_on_operations]}>
                    {alert.impact_on_operations.replace(/_/g, ' ')}
                  </Badge>
                </div>
                {alert.recommended_action && (
                  <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                    <p className="text-xs font-medium text-gray-900">Recommended Action:</p>
                    <p className="text-xs text-gray-700 mt-1">{alert.recommended_action}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upcoming Events */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Events (Staffing Impact)</h2>
        {upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center text-gray-500">
              <Cloud className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No upcoming events</p>
            </CardContent>
          </Card>
        ) : (
          upcomingEvents.map(event => (
            <Card key={event.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{event.event_name}</h3>
                    <p className="text-sm text-gray-700 mt-1">{event.location_name}</p>
                  </div>
                  <Badge className={
                    event.impact_level === 'high' ? 'bg-red-100 text-red-800' :
                    event.impact_level === 'moderate' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {event.impact_level} impact
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600">Date & Time</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{event.event_date} at {event.event_time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Extra Patrons Expected</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">+{event.estimated_extra_patrons}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Recommended Staff</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">+{event.recommended_staffing_increase}</p>
                  </div>
                </div>
                {!event.staffing_planned && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    ⚠️ Staffing not yet planned for this event
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}