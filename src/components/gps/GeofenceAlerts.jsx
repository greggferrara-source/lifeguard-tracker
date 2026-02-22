import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function GeofenceAlerts({ employeeId, limit = 20 }) {
  const { data: alerts = [] } = useQuery({
    queryKey: ['geofence-alerts', employeeId],
    queryFn: () => base44.entities.EmployeeLocationTracking.filter(
      {
        employee_id: employeeId,
        event_type: { $in: ['geofence_entry', 'geofence_exit'] }
      },
      '-timestamp',
      limit
    )
  });

  const eventIcons = {
    geofence_entry: LogIn,
    geofence_exit: LogOut
  };

  const eventColors = {
    geofence_entry: 'bg-green-50 border-green-200',
    geofence_exit: 'bg-orange-50 border-orange-200'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Geofence Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500">No geofence events today</p>
        ) : (
          <div className="space-y-2">
            {alerts.map(alert => {
              const Icon = eventIcons[alert.event_type];
              return (
                <div key={alert.id} className={`p-3 rounded-lg border ${eventColors[alert.event_type]}`}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {alert.event_type === 'geofence_entry' ? 'Arrived at' : 'Left'} {alert.location_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(alert.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}