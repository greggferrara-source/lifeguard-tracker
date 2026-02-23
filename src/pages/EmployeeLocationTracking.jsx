import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Map, AlertTriangle, CheckCircle } from "lucide-react";
import EmployeeLocationMap from "@/components/gps/EmployeeLocationMap";
import GeofenceAlerts from "@/components/gps/GeofenceAlerts";
import CoverageHeatmap from "@/components/gps/CoverageHeatmap";

export default function EmployeeLocationTrackingPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Fetch all employees with GPS tracking enabled
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-with-gps'],
    queryFn: () => base44.entities.Employee.filter({ gps_tracking_enabled: true })
  });

  // Fetch active employees currently on shift
  const { data: activeLocations = [] } = useQuery({
    queryKey: ['active-locations'],
    queryFn: () => base44.entities.EmployeeLocationTracking.filter({}, '-timestamp', 100),
    refetchInterval: 5000
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations-tracking'],
    queryFn: () => base44.entities.Location.filter({ status: 'active' }),
  });

  const { data: clockEntries = [] } = useQuery({
    queryKey: ['clock-entries-live'],
    queryFn: () => base44.entities.ClockEntry.filter({ status: 'clocked_in' }),
    refetchInterval: 15000,
  });

  const uniqueEmployees = [...new Map(
    activeLocations.map(loc => [loc.employee_id, { 
      id: loc.employee_id, 
      name: loc.employee_name,
      location: loc.location_name,
      timestamp: loc.timestamp
    }])
  ).values()];

  const selectedEmployee = selectedEmployeeId ? 
    employees.find(e => e.id === selectedEmployeeId) : 
    null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Employee Location Tracking</h1>
          <p className="text-gray-600 mt-1">Real-time GPS tracking for opted-in employees</p>
        </div>

        {/* Coverage summary pills */}
        <div className="flex gap-3 mb-4 flex-wrap">
          {[
            { label: "On Duty", value: clockEntries.length, color: "bg-green-100 text-green-800" },
            { label: "Locations Active", value: locations.filter(l => clockEntries.some(e => e.location_id === l.id)).length, color: "bg-blue-100 text-blue-800" },
            { label: "Uncovered Zones", value: locations.filter(l => !clockEntries.some(e => e.location_id === l.id)).length, color: "bg-red-100 text-red-800" },
          ].map(s => (
            <div key={s.label} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${s.color}`}>
              {s.value} {s.label}
            </div>
          ))}
        </div>

        <Tabs defaultValue="heatmap" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="heatmap"><Map className="w-3.5 h-3.5 mr-1" />Coverage Map</TabsTrigger>
            <TabsTrigger value="map">Live Tracking</TabsTrigger>
            <TabsTrigger value="list">Active Guards</TabsTrigger>
          </TabsList>

          {/* Coverage Heatmap Tab */}
          <TabsContent value="heatmap" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Zone Coverage Heatmap</CardTitle>
                <p className="text-xs text-gray-500">Shows staffing coverage across all active locations in real-time</p>
              </CardHeader>
              <CardContent>
                <CoverageHeatmap locations={locations} activeLocations={activeLocations} clockEntries={clockEntries} />
              </CardContent>
            </Card>
            {/* Uncovered zones alert */}
            {locations.filter(l => !clockEntries.some(e => e.location_id === l.id)).length > 0 && (
              <Card className="border-red-300 bg-red-50">
                <CardContent className="py-3">
                  <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                    <AlertTriangle className="w-4 h-4" /> Uncovered Zones
                  </div>
                  <div className="space-y-1">
                    {locations.filter(l => !clockEntries.some(e => e.location_id === l.id)).map(loc => (
                      <div key={loc.id} className="text-sm text-red-600 flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> {loc.name} — no guard on duty
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Live Tracking Tab */}
          <TabsContent value="map" className="space-y-4">
            {selectedEmployee ? (
              <div className="space-y-4">
                <button 
                  onClick={() => setSelectedEmployeeId(null)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Back to list
                </button>
                <EmployeeLocationMap employeeId={selectedEmployee.id} />
                <GeofenceAlerts employeeId={selectedEmployee.id} />
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Select an employee from the list to view their location</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Active Guards Tab */}
          <TabsContent value="list" className="space-y-4">
            {uniqueEmployees.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No active GPS tracking</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {uniqueEmployees.map(emp => (
                  <Card 
                    key={emp.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedEmployeeId(emp.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{emp.name}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {emp.location}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Updated {new Date(emp.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}