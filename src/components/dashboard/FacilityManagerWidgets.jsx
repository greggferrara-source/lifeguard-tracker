import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, Droplets, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function FacilityManagerWidgets() {
  const { data: incidents = [] } = useQuery({
    queryKey: ["recent-incidents"],
    queryFn: () => base44.entities.IncidentLog.list("-created_date", 30)
  });

  const { data: checklists = [] } = useQuery({
    queryKey: ["recent-checklists"],
    queryFn: () => base44.entities.ChecklistSubmission.list("-created_date", 30)
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ["recent-inspections"],
    queryFn: () => base44.entities.InspectionReport.list("-created_date", 30)
  });

  const { data: chemical = [] } = useQuery({
    queryKey: ["recent-chemical"],
    queryFn: () => base44.entities.ChemicalLog.list("-created_date", 30)
  });

  // Calculate metrics
  const todayIncidents = incidents.filter(i => {
    const today = new Date().toISOString().split('T')[0];
    return i.date === today && i.status === "open";
  }).length;

  const failedChecklists = checklists.filter(c => c.status === "fail").length;
  const todayChecklists = checklists.filter(c => {
    const today = new Date().toISOString().split('T')[0];
    return c.date === today;
  }).length;

  const inspectionIssues = inspections.filter(i => i.issues_found > 0).length;
  const chemicalIssues = chemical.filter(c => c.status === "out_of_range").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Incidents Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Open Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{todayIncidents}</div>
          <p className="text-xs text-gray-500 mt-1">Today</p>
        </CardContent>
      </Card>

      {/* Checklists Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Checklists Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{todayChecklists}</div>
          <p className="text-xs text-gray-500 mt-1">{failedChecklists} failed</p>
        </CardContent>
      </Card>

      {/* Inspections Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            Inspections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{inspections.length}</div>
          <p className="text-xs text-gray-500 mt-1">{inspectionIssues} with issues</p>
        </CardContent>
      </Card>

      {/* Chemical Logs Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-500" />
            Chemical Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-cyan-600">{chemical.length}</div>
          <p className="text-xs text-gray-500 mt-1">{chemicalIssues} out of range</p>
        </CardContent>
      </Card>

      {/* Recent Incidents List */}
      {incidents.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incidents.slice(0, 5).map(incident => (
                <div key={incident.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <div>
                    <p className="font-medium text-gray-900">{incident.type}</p>
                    <p className="text-xs text-gray-500">{incident.date}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${incident.severity === "critical" ? "bg-red-100 text-red-700" : incident.severity === "serious" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {incident.severity}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Status */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Checklists Complete</span>
              <span className="text-sm font-bold text-green-600">{todayChecklists}/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(todayChecklists / 5) * 100}%` }}></div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-600">Documentation</span>
              <span className="text-sm font-bold text-blue-600">{Math.round((checklists.length / (incidents.length + checklists.length + inspections.length || 1)) * 100)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}