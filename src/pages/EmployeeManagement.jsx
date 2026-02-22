import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Award, Clock, TrendingUp, Download, Mail } from "lucide-react";

export default function EmployeeManagement() {
  const [tab, setTab] = useState("certifications");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list()
  });

  const { data: certifications = [] } = useQuery({
    queryKey: ["certifications"],
    queryFn: () => base44.entities.Certification.list()
  });

  const { data: performance = [] } = useQuery({
    queryKey: ["employee-performance"],
    queryFn: () => base44.entities.EmployeePerformance.list()
  });

  const { data: trainings = [] } = useQuery({
    queryKey: ["training-completions"],
    queryFn: () => base44.entities.TrainingCompletion.list()
  });

  // Filter and search
  const filtered = employees.filter(e =>
    e.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate expiring certifications (within 30 days)
  const today = new Date();
  const thirtyDaysOut = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringCerts = certifications.filter(c => {
    const expDate = new Date(c.expiry_date);
    return expDate > today && expDate <= thirtyDaysOut;
  });

  const expiredCerts = certifications.filter(c => {
    const expDate = new Date(c.expiry_date);
    return expDate <= today;
  });

  const tabs = [
    { id: "certifications", label: "Certifications & Compliance", icon: Award, count: expiringCerts.length + expiredCerts.length },
    { id: "training", label: "In-Service Training", icon: BookOpen, count: trainings.filter(t => !t.passed).length },
    { id: "performance", label: "Performance Insights", icon: TrendingUp, count: employees.length },
    { id: "compliance", label: "Compliance Reports", icon: FileText, count: 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Employee Management</h1>
        <p className="text-gray-600">Manage certifications, training, performance, and compliance</p>
      </div>

      {/* Key Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Expired Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{expiredCerts.length}</div>
            <p className="text-xs text-red-700 mt-1">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Expiring Soon (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{expiringCerts.length}</div>
            <p className="text-xs text-yellow-700 mt-1">Schedule renewals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="w-4 h-4" />
              Total Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a9c5b]">{employees.length}</div>
            <p className="text-xs text-gray-600 mt-1">Active employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                tab === t.id
                  ? "border-[#1a9c5b] text-[#1a9c5b]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {t.count > 0 && <span className="ml-1 text-xs font-bold">({t.count})</span>}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {tab === "certifications" && (
          <CertificationTab filtered={filtered} searchTerm={searchTerm} setSearchTerm={setSearchTerm} employees={employees} certifications={certifications} expiringCerts={expiringCerts} expiredCerts={expiredCerts} />
        )}
        {tab === "training" && (
          <TrainingTab filtered={filtered} searchTerm={searchTerm} setSearchTerm={setSearchTerm} trainings={trainings} />
        )}
        {tab === "performance" && (
          <PerformanceTab filtered={filtered} searchTerm={searchTerm} setSearchTerm={setSearchTerm} performance={performance} />
        )}
        {tab === "compliance" && (
          <ComplianceTab employees={employees} certifications={certifications} />
        )}
      </div>
    </div>
  );
}

function CertificationTab({ filtered, searchTerm, setSearchTerm, employees, certifications, expiringCerts, expiredCerts }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Button className="ml-auto bg-[#1a9c5b] hover:bg-[#158a4e]">
          <Mail className="w-4 h-4 mr-2" />
          Send Renewal Reminders
        </Button>
      </div>

      {expiredCerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Expired Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiredCerts.map(cert => {
                const emp = employees.find(e => e.id === cert.employee_id);
                return (
                  <div key={cert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100">
                    <div>
                      <p className="font-medium text-red-900">{emp?.first_name} {emp?.last_name}</p>
                      <p className="text-sm text-red-700">{cert.name} • Expired {new Date(cert.expiry_date).toLocaleDateString()}</p>
                    </div>
                    <Button variant="outline" size="sm">Renew</Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {expiringCerts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringCerts.map(cert => {
                const emp = employees.find(e => e.id === cert.employee_id);
                const daysUntil = Math.ceil((new Date(cert.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={cert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-100">
                    <div>
                      <p className="font-medium text-yellow-900">{emp?.first_name} {emp?.last_name}</p>
                      <p className="text-sm text-yellow-700">{cert.name} • Expires in {daysUntil} days</p>
                    </div>
                    <Button variant="outline" size="sm">Schedule Renewal</Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Certifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {certifications.slice(0, 10).map(cert => {
              const emp = employees.find(e => e.id === cert.employee_id);
              return (
                <div key={cert.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div>
                    <p className="font-medium">{emp?.first_name} {emp?.last_name}</p>
                    <p className="text-sm text-gray-600">{cert.name}</p>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(cert.expiry_date).toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrainingTab({ filtered, searchTerm, setSearchTerm, trainings }) {
  const pendingTrainings = trainings.filter(t => !t.passed);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>In-Service Training Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingTrainings.slice(0, 15).map(training => (
              <div key={training.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <p className="font-medium">{training.employee_name}</p>
                  <p className="text-sm text-gray-600">{training.module_title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{training.quiz_score || "0"}%</p>
                  <span className="text-xs text-gray-500">Attempt {training.attempts || 1}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PerformanceTab({ filtered, searchTerm, setSearchTerm, performance }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {performance.slice(0, 20).map(emp => (
          <Card key={emp.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{emp.employee_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Performance Rating</span>
                  <span className="text-sm font-bold">{emp.performance_rating || "—"}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-2">
                  <div className="bg-[#1a9c5b] h-2 rounded" style={{ width: `${(emp.performance_rating || 0) * 20}%` }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Shifts Worked</p>
                  <p className="font-bold">{emp.total_shifts_worked || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Attendance Rate</p>
                  <p className="font-bold">{emp.attendance_rate || 0}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Certifications</p>
                  <p className="font-bold">{emp.certifications_current || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Safety Violations</p>
                  <p className="font-bold text-red-600">{emp.safety_violations || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ComplianceTab({ employees, certifications }) {
  const handleGenerateReport = () => {
    alert("Compliance report generated. Download feature coming soon.");
  };

  const compliantCount = employees.filter(e => {
    const empCerts = certifications.filter(c => c.employee_id === e.id);
    return empCerts.every(c => new Date(c.expiry_date) > new Date());
  }).length;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0">
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Total Employees</p>
              <p className="text-3xl font-bold">{employees.length}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Fully Compliant</p>
              <p className="text-3xl font-bold text-green-600">{compliantCount}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Compliance Rate</p>
              <p className="text-3xl font-bold text-blue-600">{Math.round((compliantCount / employees.length) * 100)}%</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleGenerateReport} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
              <Download className="w-4 h-4 mr-2" />
              Generate Audit Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit-Ready Certifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {certifications.slice(0, 20).map(cert => (
              <div key={cert.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{cert.name}</p>
                  <p className="text-xs text-gray-600">ID: {cert.id}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  new Date(cert.expiry_date) > new Date()
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {new Date(cert.expiry_date) > new Date() ? "Valid" : "Expired"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { BookOpen, FileText } from "lucide-react";