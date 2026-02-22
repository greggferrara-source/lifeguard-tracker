import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import EmployeeProfileCard from "@/components/employees/EmployeeProfileCard";
import OnboardingProgressCard from "@/components/onboarding/OnboardingProgressCard";

export default function EmployeeProfilePage() {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: employee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => base44.entities.Employee.read(employeeId),
    enabled: !!employeeId
  });

  const { data: skills = [] } = useQuery({
    queryKey: ['employee-skills', employeeId],
    queryFn: () => base44.entities.EmployeeSkill.filter({ employee_id: employeeId }),
    enabled: !!employeeId
  });

  const { data: clockEntries = [] } = useQuery({
    queryKey: ['employee-clock-entries', employeeId],
    queryFn: () => base44.entities.ClockEntry.filter(
      { employee_id: employeeId },
      '-clock_in',
      30
    ),
    enabled: !!employeeId
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ['employee-shifts', employeeId],
    queryFn: () => base44.entities.Shift.filter(
      { employee_id: employeeId },
      '-shift_date',
      20
    ),
    enabled: !!employeeId
  });

  const { data: onboarding } = useQuery({
    queryKey: ['employee-onboarding', employeeId],
    queryFn: () => base44.entities.OnboardingWorkflow.filter(
      { employee_id: employeeId },
      '-created_at',
      1
    ),
    enabled: !!employeeId,
    select: (data) => data?.[0]
  });

  if (!employeeId || !employee) {
    return <div className="p-6">Employee not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Employees')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{employee.full_name}</h1>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <EmployeeProfileCard employeeId={employeeId} />
            {onboarding && <OnboardingProgressCard workflow={onboarding} />}
          </div>

          {/* Tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="history">Work History</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Work Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="text-xs text-blue-600">Total Hours</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {(clockEntries.reduce((sum, e) => sum + (e.total_minutes || 0), 0) / 60).toFixed(1)}h
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded">
                        <p className="text-xs text-green-600">Clock Entries</p>
                        <p className="text-2xl font-bold text-green-900">{clockEntries.length}</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded">
                        <p className="text-xs text-purple-600">Skills</p>
                        <p className="text-2xl font-bold text-purple-900">{skills.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Shifts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {shifts.length === 0 ? (
                      <p className="text-sm text-gray-500">No shifts scheduled</p>
                    ) : (
                      <div className="space-y-2">
                        {shifts.map(shift => (
                          <div key={shift.id} className="p-3 bg-gray-50 rounded">
                            <p className="font-medium text-sm">{shift.location_name}</p>
                            <p className="text-xs text-gray-600">
                              {shift.shift_date} • {shift.shift_start} - {shift.shift_end}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Clock Entry History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {clockEntries.length === 0 ? (
                      <p className="text-sm text-gray-500">No clock entries</p>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {clockEntries.map(entry => (
                          <div key={entry.id} className="p-3 border rounded">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">{entry.location_name}</p>
                                <p className="text-xs text-gray-600">
                                  {new Date(entry.clock_in).toLocaleString()}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-green-600">
                                {entry.total_minutes ? `${(entry.total_minutes / 60).toFixed(1)}h` : 'Active'}
                              </span>
                            </div>
                            {entry.clock_in_verified && (
                              <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                GPS Verified
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}