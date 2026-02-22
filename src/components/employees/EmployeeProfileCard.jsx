import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Award, Clock, Edit2 } from "lucide-react";

export default function EmployeeProfileCard({ employeeId, onEdit }) {
  const { data: employee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => base44.entities.Employee.read(employeeId)
  });

  const { data: skills = [] } = useQuery({
    queryKey: ['employee-skills', employeeId],
    queryFn: () => base44.entities.EmployeeSkill.filter({ employee_id: employeeId })
  });

  const { data: clockEntries = [] } = useQuery({
    queryKey: ['employee-clock-entries', employeeId],
    queryFn: () => base44.entities.ClockEntry.filter(
      { employee_id: employeeId },
      '-clock_in',
      10
    )
  });

  if (!employee) return null;

  const totalHours = clockEntries.reduce((sum, entry) => sum + (entry.total_minutes || 0), 0) / 60;
  const verifiedSkills = skills.filter(s => s.verified).length;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{employee.full_name}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{employee.role || 'Employee'}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onEdit?.()}>
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {employee.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{employee.email}</span>
            </div>
          )}
          {employee.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{employee.phone}</span>
            </div>
          )}
          {employee.location_id && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{employee.location_name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      {skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4" />
              Skills & Certifications ({verifiedSkills}/{skills.length} verified)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {skills.map(skill => (
                <div key={skill.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{skill.skill_name}</p>
                    {skill.certification_number && (
                      <p className="text-xs text-gray-500">Cert: {skill.certification_number}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{skill.proficiency_level}</Badge>
                    {skill.verified && <Badge className="bg-green-100 text-green-800">Verified</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Work Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Recent Entries</p>
              <p className="text-2xl font-bold">{clockEntries.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}