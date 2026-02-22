import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Plus, AlertTriangle, CheckCircle2, TrendingUp, Calendar, Download, Zap } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";

export default function PoolTestReporting() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("dashboard");
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");
  const [daysBack, setDaysBack] = useState(30);

  const { data: testLogs = [] } = useQuery({
    queryKey: ["pool-test-logs"],
    queryFn: () => base44.entities.PoolTestLog.list("-test_date")
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list()
  });

  const { data: testStandards = [] } = useQuery({
    queryKey: ["pool-test-standards"],
    queryFn: () => base44.entities.PoolTestStandard.list()
  });

  const filtered = testLogs.filter(log => {
    if (locationFilter && log.location_id !== locationFilter) return false;
    const logDate = parseISO(log.test_date);
    const cutoffDate = subDays(new Date(), daysBack);
    return logDate >= cutoffDate;
  });

  const outOfRangeLogs = filtered.filter(log => log.out_of_range);
  const passRate = filtered.length > 0 ? ((filtered.length - outOfRangeLogs.length) / filtered.length * 100).toFixed(1) : 100;
  const recentAlerts = outOfRangeLogs.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Pool Test Reporting</h1>
        <Button onClick={() => setShowTestDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Log Pool Test
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-end">
        <div>
          <label className="text-sm font-medium block mb-2">Location</label>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Period</label>
          <select
            value={daysBack}
            onChange={(e) => setDaysBack(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={365}>Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filtered.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{passRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              Out of Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{outOfRangeLogs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Last Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{filtered.length > 0 ? filtered[0].test_date : "No data"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {[
          { id: "dashboard", label: "Dashboard" },
          { id: "trends", label: "Trends" },
          { id: "history", label: "Test History" },
          { id: "alerts", label: `Alerts (${recentAlerts.length})` }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "dashboard" && <DashboardTab filtered={filtered} locations={locations} />}
      {tab === "trends" && <TrendsTab filtered={filtered} />}
      {tab === "history" && <HistoryTab filtered={filtered} />}
      {tab === "alerts" && <AlertsTab alerts={recentAlerts} />}

      {/* Dialogs */}
      <PoolTestDialog open={showTestDialog} onOpenChange={setShowTestDialog} locations={locations} testStandards={testStandards} />
    </div>
  );
}

function DashboardTab({ filtered, locations }) {
  const batchStats = locations.map(loc => {
    const locTests = filtered.filter(t => t.location_id === loc.id);
    const outOfRange = locTests.filter(t => t.out_of_range);
    return {
      location: loc.name,
      tests: locTests.length,
      outOfRange: outOfRange.length,
      rate: locTests.length > 0 ? ((locTests.length - outOfRange.length) / locTests.length * 100).toFixed(0) : 100
    };
  }).filter(s => s.tests > 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Compliance by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {batchStats.map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{stat.location}</p>
                  <p className="text-sm text-gray-600">{stat.tests} tests • {stat.outOfRange} out of range</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{stat.rate}%</div>
                  <p className="text-xs text-gray-600">Compliant</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Test Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.slice(0, 4).map(log => (
              <div key={log.id} className={`p-3 border rounded-lg ${log.out_of_range ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{log.location_name}</p>
                    <p className="text-sm text-gray-600">{log.test_date} {log.test_time}</p>
                    {log.out_of_range && (
                      <div className="mt-1 text-xs text-orange-700">
                        <p>⚠️ {log.out_of_range_parameters?.join(", ")}</p>
                      </div>
                    )}
                  </div>
                  {log.out_of_range ? (
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrendsTab({ filtered }) {
  // Group by date for trend analysis
  const trendData = {};
  filtered.forEach(log => {
    if (!trendData[log.test_date]) {
      trendData[log.test_date] = { date: log.test_date, tests: 0, passed: 0, failed: 0, avgChlorine: 0, avgPH: 0, chlorineSum: 0, phSum: 0 };
    }
    trendData[log.test_date].tests++;
    if (!log.out_of_range) trendData[log.test_date].passed++;
    else trendData[log.test_date].failed++;
    if (log.chlorine_free) {
      trendData[log.test_date].chlorineSum += log.chlorine_free;
    }
    if (log.ph) {
      trendData[log.test_date].phSum += log.ph;
    }
  });

  const chartData = Object.values(trendData).map(d => ({
    ...d,
    avgChlorine: (d.chlorineSum / d.tests).toFixed(2),
    avgPH: (d.phSum / d.tests).toFixed(2)
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="passed" fill="#10b981" name="Passed" />
                <Bar dataKey="failed" fill="#f97316" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="avgChlorine" stroke="#3b82f6" name="Avg Free Chlorine (ppm)" />
                <Line yAxisId="right" type="monotone" dataKey="avgPH" stroke="#8b5cf6" name="Avg pH" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HistoryTab({ filtered }) {
  const [search, setSearch] = React.useState("");

  const results = filtered.filter(log =>
    log.location_name?.toLowerCase().includes(search.toLowerCase()) ||
    log.tested_by_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by location or staff..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <div className="space-y-2">
        {results.map(log => (
          <Card key={log.id}>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{log.location_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Test Date/Time</p>
                  <p className="font-semibold">{log.test_date} {log.test_time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={log.out_of_range ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}>
                    {log.out_of_range ? "Out of Range" : "Compliant"}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Free Chlorine</p>
                  <p className="font-semibold">{log.chlorine_free} ppm</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">pH</p>
                  <p className="font-semibold">{log.ph}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="font-semibold">{log.temperature}°F</p>
                </div>

                {log.out_of_range && (
                  <div className="md:col-span-3">
                    <p className="text-sm text-gray-600">Action Taken</p>
                    <p className="text-sm">{log.action_taken || "No action recorded"}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AlertsTab({ alerts }) {
  return (
    <div className="space-y-2">
      {alerts.length > 0 ? (
        alerts.map(alert => (
          <Card key={alert.id} className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <p className="font-bold text-orange-900">{alert.location_name}</p>
                  </div>
                  <p className="text-sm text-orange-800 mt-1">
                    {alert.out_of_range_parameters?.join(", ")} out of range
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    {alert.test_date} {alert.test_time}
                  </p>
                </div>
                <Button variant="outline" size="sm">Review</Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="bg-green-50">
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-700 font-medium">All tests within compliance range</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PoolTestDialog({ open, onOpenChange, locations, testStandards }) {
  const qc = useQueryClient();
  const [locationId, setLocationId] = React.useState("");
  const [standard, setStandard] = React.useState("MAHC");
  const [formData, setFormData] = React.useState({
    chlorine_free: "",
    chlorine_total: "",
    ph: "",
    alkalinity: "",
    calcium_hardness: "",
    cyanuric_acid: "",
    temperature: "",
    notes: "",
    action_taken: ""
  });

  const create = useMutation({
    mutationFn: (data) => base44.entities.PoolTestLog.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pool-test-logs"] });
      onOpenChange(false);
      setFormData({
        chlorine_free: "", chlorine_total: "", ph: "", alkalinity: "",
        calcium_hardness: "", cyanuric_acid: "", temperature: "", notes: "", action_taken: ""
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!locationId) {
      alert("Please select a location");
      return;
    }

    const location = locations.find(l => l.id === locationId);
    const outOfRangeParams = [];

    // Basic MAHC compliance checks
    if (formData.chlorine_free && (formData.chlorine_free < 1 || formData.chlorine_free > 3)) outOfRangeParams.push("Free Chlorine");
    if (formData.ph && (formData.ph < 7.2 || formData.ph > 7.8)) outOfRangeParams.push("pH");
    if (formData.alkalinity && (formData.alkalinity < 80 || formData.alkalinity > 120)) outOfRangeParams.push("Alkalinity");

    create.mutate({
      location_id: locationId,
      location_name: location?.name,
      test_date: format(new Date(), "yyyy-MM-dd"),
      test_time: format(new Date(), "HH:mm"),
      tested_by_email: "staff@example.com",
      tested_by_name: "Current User",
      ...formData,
      out_of_range: outOfRangeParams.length > 0,
      out_of_range_parameters: outOfRangeParams,
      test_standard: standard
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Pool Test</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Location *</label>
              <select
                required
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">Select location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Standard</label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="MAHC">MAHC</option>
                <option value="local_guidelines">Local Guidelines</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Free Chlorine (ppm)</label>
              <Input type="number" step="0.1" value={formData.chlorine_free} onChange={(e) => setFormData({...formData, chlorine_free: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Total Chlorine (ppm)</label>
              <Input type="number" step="0.1" value={formData.chlorine_total} onChange={(e) => setFormData({...formData, chlorine_total: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">pH</label>
              <Input type="number" step="0.1" value={formData.ph} onChange={(e) => setFormData({...formData, ph: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Temperature (°F)</label>
              <Input type="number" step="0.1" value={formData.temperature} onChange={(e) => setFormData({...formData, temperature: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Alkalinity (ppm)</label>
              <Input type="number" step="1" value={formData.alkalinity} onChange={(e) => setFormData({...formData, alkalinity: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Calcium Hardness (ppm)</label>
              <Input type="number" step="1" value={formData.calcium_hardness} onChange={(e) => setFormData({...formData, calcium_hardness: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Cyanuric Acid (ppm)</label>
              <Input type="number" step="1" value={formData.cyanuric_acid} onChange={(e) => setFormData({...formData, cyanuric_acid: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Notes</label>
            <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Corrective Action (if needed)</label>
            <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} value={formData.action_taken} onChange={(e) => setFormData({...formData, action_taken: e.target.value})} />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={create.isPending}>
              {create.isPending ? "Logging..." : "Log Test"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}