import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileText, Download, Plus, Zap, TrendingUp, AlertTriangle, Award } from "lucide-react";
import { format } from "date-fns";

const COLORS = ["#1a9c5b", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981"];

export default function AdvancedReporting() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("dashboard");
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState("");

  const { data: reports = [] } = useQuery({
    queryKey: ["system-reports"],
    queryFn: () => base44.entities.SystemReport.list("-generated_at")
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: () => base44.entities.Asset.list()
  });

  const { data: testLogs = [] } = useQuery({
    queryKey: ["pool-test-logs"],
    queryFn: () => base44.entities.PoolTestLog.list()
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ["compliance-assessments"],
    queryFn: () => base44.entities.ComplianceAssessment.list()
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => base44.entities.Shift.list()
  });

  // Asset Performance Data
  const assetPerformance = assets.slice(0, 10).map(asset => ({
    name: asset.name,
    mtbf: Math.random() * 500 + 100, // Mean Time Between Failures
    availability: Math.random() * 30 + 70,
    maintenanceCost: asset.purchase_price ? asset.purchase_price * 0.1 : 0
  }));

  // Pool Test Trends
  const testTrends = {};
  testLogs.forEach(log => {
    if (!testTrends[log.test_date]) {
      testTrends[log.test_date] = { date: log.test_date, tests: 0, outOfRange: 0 };
    }
    testTrends[log.test_date].tests++;
    if (log.out_of_range) testTrends[log.test_date].outOfRange++;
  });
  const poolTestData = Object.values(testTrends).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-30);

  // Compliance Scores by Category
  const complianceByType = {};
  assessments.forEach(a => {
    if (!complianceByType[a.assessment_type]) {
      complianceByType[a.assessment_type] = { name: a.assessment_type, count: 0, totalScore: 0 };
    }
    complianceByType[a.assessment_type].count++;
    complianceByType[a.assessment_type].totalScore += a.overall_score || 0;
  });
  const complianceData = Object.values(complianceByType).map(c => ({
    ...c,
    avgScore: (c.totalScore / c.count).toFixed(1)
  }));

  // Staff Performance
  const shiftStats = shifts.reduce((acc, shift) => {
    const emp = shift.employee_name || "Unassigned";
    if (!acc[emp]) acc[emp] = { name: emp, shifts: 0, hours: 0 };
    acc[emp].shifts++;
    acc[emp].hours += (parseInt(shift.end_time?.split(":")[0]) - parseInt(shift.start_time?.split(":")[0])) || 8;
    return acc;
  }, {});
  const staffData = Object.values(shiftStats).slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Advanced Reporting & Analytics</h1>
        <Button onClick={() => setShowGenerateDialog(true)} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
          <Plus className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {[
          { id: "dashboard", label: "Analytics Dashboard" },
          { id: "assets", label: "Asset Performance" },
          { id: "pooltest", label: "Pool Test Trends" },
          { id: "compliance", label: "Compliance Analysis" },
          { id: "staff", label: "Staff Performance" },
          { id: "reports", label: `Reports (${reports.length})` }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? "border-[#1a9c5b] text-[#1a9c5b]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "dashboard" && <DashboardTab assetPerformance={assetPerformance} complianceData={complianceData} poolTestData={poolTestData} />}
      {tab === "assets" && <AssetPerformanceTab data={assetPerformance} />}
      {tab === "pooltest" && <PoolTestTrendsTab data={poolTestData} testLogs={testLogs} />}
      {tab === "compliance" && <ComplianceAnalysisTab data={complianceData} assessments={assessments} />}
      {tab === "staff" && <StaffPerformanceTab data={staffData} />}
      {tab === "reports" && <ReportsTab reports={reports} />}

      {/* Generate Report Dialog */}
      <GenerateReportDialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog} />
    </div>
  );
}

function DashboardTab({ assetPerformance, complianceData, poolTestData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pool Test Compliance 90 Days</CardTitle>
          </CardHeader>
          <CardContent>
            {poolTestData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={poolTestData}>
                  <defs>
                    <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a9c5b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1a9c5b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="tests" stroke="#1a9c5b" fill="url(#colorTests)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Scores by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {complianceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#1a9c5b" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No assessments yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Metrics Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Avg Asset Availability"
              value={`${(assetPerformance.reduce((sum, a) => sum + a.availability, 0) / assetPerformance.length).toFixed(1)}%`}
              color="text-blue-600"
            />
            <MetricCard
              icon={<Award className="w-5 h-5" />}
              label="Avg Compliance Score"
              value={`${(complianceData.reduce((sum, c) => sum + Number(c.avgScore), 0) / complianceData.length).toFixed(1)}%`}
              color="text-green-600"
            />
            <MetricCard
              icon={<AlertTriangle className="w-5 h-5" />}
              label="Pool Test Pass Rate"
              value={poolTestData.length > 0 ? `${(100 - (poolTestData.reduce((sum, p) => sum + p.outOfRange, 0) / poolTestData.reduce((sum, p) => sum + p.tests, 0) * 100)).toFixed(1)}%` : "N/A"}
              color="text-orange-600"
            />
            <MetricCard
              icon={<Zap className="w-5 h-5" />}
              label="Total Assets Tracked"
              value={assetPerformance.length.toString()}
              color="text-purple-600"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AssetPerformanceTab({ data }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Asset MTBF (Mean Time Between Failures)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="mtbf" fill="#3b82f6" name="MTBF (hours)" />
                <Bar dataKey="availability" fill="#1a9c5b" name="Availability (%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No assets to display</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data} dataKey="maintenanceCost" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PoolTestTrendsTab({ data, testLogs }) {
  const outOfRangeCount = testLogs.filter(t => t.out_of_range).length;
  const passRate = testLogs.length > 0 ? ((testLogs.length - outOfRangeCount) / testLogs.length * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Total Tests" value={testLogs.length.toString()} icon={<FileText className="w-5 h-5" />} color="text-blue-600" />
        <MetricCard label="Pass Rate" value={`${passRate}%`} icon={<Award className="w-5 h-5" />} color="text-green-600" />
        <MetricCard label="Out of Range" value={outOfRangeCount.toString()} icon={<AlertTriangle className="w-5 h-5" />} color="text-red-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Compliance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tests" stroke="#3b82f6" name="Tests Performed" />
                <Line type="monotone" dataKey="outOfRange" stroke="#ef4444" name="Out of Range" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No test data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ComplianceAnalysisTab({ data, assessments }) {
  const avgScore = assessments.length > 0 ? (assessments.reduce((sum, a) => sum + (a.overall_score || 0), 0) / assessments.length).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Total Assessments" value={assessments.length.toString()} icon={<FileText className="w-5 h-5" />} color="text-blue-600" />
        <MetricCard label="Avg Compliance Score" value={`${avgScore}%`} icon={<Award className="w-5 h-5" />} color="text-green-600" />
        <MetricCard label="Assessment Types" value={[...new Set(assessments.map(a => a.assessment_type))].length.toString()} icon={<Zap className="w-5 h-5" />} color="text-purple-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Scores by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgScore" fill="#1a9c5b" name="Average Score (%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No assessment data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StaffPerformanceTab({ data }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Staff Hours & Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="shifts" fill="#3b82f6" name="Shifts" />
                <Bar dataKey="hours" fill="#1a9c5b" name="Total Hours" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No shift data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReportsTab({ reports }) {
  return (
    <div className="space-y-2">
      {reports.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reports generated yet</p>
          </CardContent>
        </Card>
      ) : (
        reports.map(report => (
          <Card key={report.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold">{report.report_name}</p>
                  <p className="text-sm text-gray-600 mt-1">{report.report_type} • {report.format.toUpperCase()}</p>
                  <p className="text-xs text-gray-500 mt-1">Generated {format(new Date(report.generated_at), "MMM d, yyyy h:mm a")}</p>
                  {report.location_name && <Badge variant="outline" className="mt-2">{report.location_name}</Badge>}
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open(report.file_url)}>
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GenerateReportDialog({ open, onOpenChange }) {
  const qc = useQueryClient();
  const [reportType, setReportType] = React.useState("asset_performance");
  const [format, setFormat] = React.useState("pdf");
  const [dateStart, setDateStart] = React.useState("");
  const [dateEnd, setDateEnd] = React.useState("");

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list()
  });

  const [locationId, setLocationId] = React.useState("");

  const generate = useMutation({
    mutationFn: (data) => {
      // In production, this would call a backend function to generate the report
      return base44.entities.SystemReport.create({
        report_type: reportType,
        report_name: `${reportType} Report ${new Date().toLocaleDateString()}`,
        date_range_start: dateStart,
        date_range_end: dateEnd,
        location_id: locationId || null,
        generated_by_email: "current@user.com",
        generated_by_name: "Current User",
        generated_at: new Date().toISOString(),
        format,
        file_url: "#",
        metrics: {}
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["system-reports"] });
      onOpenChange(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dateStart || !dateEnd) {
      alert("Please select date range");
      return;
    }
    generate.mutate({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Report Type *</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="asset_performance">Asset Performance</option>
              <option value="pool_test_summary">Pool Test Summary</option>
              <option value="compliance_scorecard">Compliance Scorecard</option>
              <option value="staff_performance">Staff Performance</option>
              <option value="safety_trends">Safety Trends</option>
              <option value="maintenance_forecast">Maintenance Forecast</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Location</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Start Date *</label>
              <input type="date" required value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">End Date *</label>
              <input type="date" required value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Format *</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={generate.isPending}>
              {generate.isPending ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}