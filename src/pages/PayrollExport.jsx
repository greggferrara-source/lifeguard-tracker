import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Users, DollarSign, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";

function calcShiftHours(shift) {
  if (!shift.start_time || !shift.end_time) return 0;
  const [sh, sm] = shift.start_time.split(":").map(Number);
  const [eh, em] = shift.end_time.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60; // overnight
  return mins / 60;
}

function downloadCSV(rows, filename) {
  const header = ["Employee Name", "Email", "Role", "Location", "Date", "Start Time", "End Time", "Hours", "Hourly Rate ($)", "Gross Pay ($)", "Shift Status"];
  const lines = [header, ...rows].map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function PayrollExport() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(format(firstOfMonth, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me().catch(() => null) });
  const { data: shifts = [], isLoading: loadingShifts } = useQuery({
    queryKey: ["shifts-payroll"],
    queryFn: () => base44.entities.Shift.list("-date", 2000),
  });
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list(),
  });

  const isAdmin = ["admin", "site_owner", "enterprise_admin", "enterprise_site_owner", "manager"].includes(user?.role);

  const empMap = useMemo(() => {
    const m = {};
    employees.forEach(e => { m[e.id] = e; });
    return m;
  }, [employees]);

  const filtered = useMemo(() => {
    if (!startDate || !endDate) return [];
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));

    return shifts.filter(s => {
      if (!s.date) return false;
      if (!isWithinInterval(parseISO(s.date), { start, end })) return false;
      if (locationFilter !== "all" && s.location_id !== locationFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      return true;
    });
  }, [shifts, startDate, endDate, locationFilter, statusFilter]);

  // Aggregate per employee
  const summary = useMemo(() => {
    const byEmp = {};
    filtered.forEach(s => {
      const emp = empMap[s.employee_id];
      const key = s.employee_id || s.employee_name || "unassigned";
      if (!byEmp[key]) {
        byEmp[key] = {
          name: s.employee_name || emp?.first_name + " " + emp?.last_name || "Unknown",
          email: emp?.email || "—",
          role: emp?.role || "—",
          hourlyRate: emp?.hourly_rate || 0,
          shifts: [],
          totalHours: 0,
          grossPay: 0,
        };
      }
      const hours = calcShiftHours(s);
      byEmp[key].shifts.push(s);
      byEmp[key].totalHours += hours;
      byEmp[key].grossPay += hours * (emp?.hourly_rate || 0);
    });
    return Object.values(byEmp).sort((a, b) => a.name.localeCompare(b.name));
  }, [filtered, empMap]);

  const totals = useMemo(() => ({
    hours: summary.reduce((a, e) => a + e.totalHours, 0),
    pay: summary.reduce((a, e) => a + e.grossPay, 0),
    shifts: filtered.length,
  }), [summary, filtered]);

  const handleExport = () => {
    const rows = [];
    filtered.forEach(s => {
      const emp = empMap[s.employee_id];
      const hours = calcShiftHours(s);
      const rate = emp?.hourly_rate || 0;
      rows.push([
        s.employee_name || (emp ? `${emp.first_name} ${emp.last_name}` : "Unassigned"),
        emp?.email || "",
        emp?.role || "",
        s.location_name || "",
        s.date,
        s.start_time,
        s.end_time,
        hours.toFixed(2),
        rate.toFixed(2),
        (hours * rate).toFixed(2),
        s.status,
      ]);
    });
    rows.sort((a, b) => a[0].localeCompare(b[0]) || a[3].localeCompare(b[3]));
    downloadCSV(rows, `payroll_${startDate}_to_${endDate}.csv`);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center text-gray-400">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="font-medium">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Export</h1>
          <p className="text-sm text-gray-500 mt-0.5">Aggregate shift hours and rates for payout calculations</p>
        </div>
        <Button
          className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2"
          onClick={handleExport}
          disabled={filtered.length === 0}
        >
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-gray-100">
        <CardContent className="py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Start Date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">End Date</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Location</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Shift Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border border-gray-100">
          <CardContent className="py-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-500 bg-blue-50 rounded-lg p-1.5 flex-shrink-0" />
            <div>
              <p className="text-xl font-bold text-gray-900">{totals.hours.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Total Hours</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100">
          <CardContent className="py-4 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500 bg-green-50 rounded-lg p-1.5 flex-shrink-0" />
            <div>
              <p className="text-xl font-bold text-gray-900">${totals.pay.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-500">Gross Payroll</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100">
          <CardContent className="py-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-500 bg-purple-50 rounded-lg p-1.5 flex-shrink-0" />
            <div>
              <p className="text-xl font-bold text-gray-900">{summary.length}</p>
              <p className="text-xs text-gray-500">Employees ({totals.shifts} shifts)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Employee Breakdown */}
      <Card className="border border-gray-100">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-semibold text-gray-700">Employee Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingShifts ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="w-5 h-5 animate-spin text-gray-300" />
            </div>
          ) : summary.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No shifts found for selected filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Employee</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Role</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Shifts</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Hours</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Rate/hr</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Gross Pay</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 pr-4">Rate Set</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((emp, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{emp.role.replace("_", " ")}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{emp.shifts.length}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{emp.totalHours.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">${emp.hourlyRate.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-700">${emp.grossPay.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right pr-4">
                        {emp.hourlyRate > 0
                          ? <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">✓ Set</Badge>
                          : <Badge className="bg-amber-100 text-amber-600 border-amber-200 text-[10px]">Missing</Badge>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td className="px-4 py-3 font-bold text-gray-900" colSpan={3}>Totals</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{totals.hours.toFixed(2)}</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-right font-bold text-green-700">${totals.pay.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Missing Rate Warning */}
      {summary.some(e => e.hourlyRate === 0) && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Some employees are missing an hourly rate. Set rates in Employee Management for accurate gross pay calculations.
          </p>
        </div>
      )}
    </div>
  );
}