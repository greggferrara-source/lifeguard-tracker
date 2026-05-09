import { DashboardSkeleton } from "@/components/ui/PageSkeleton";
import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, startOfWeek, endOfWeek, isAfter, addDays, isBefore } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminMetricsDashboard() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
  const thirtyDaysLater = addDays(now, 30);

  // Fetch all required data
  const { data: shifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => base44.entities.Shift.list('-created_date', 500),
  });

  const { data: clockEntries = [] } = useQuery({
    queryKey: ['clockEntries'],
    queryFn: () => base44.entities.ClockEntry.list('-created_date', 500),
  });

  const { data: certs = [] } = useQuery({
    queryKey: ['certs'],
    queryFn: () => base44.entities.Certification.list('-created_date', 500),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 500),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list('-created_date', 100),
  });

  // Calculate metrics
  const weekShifts = useMemo(() => shifts.filter(s => {
    const shiftDate = new Date(s.date);
    return shiftDate >= weekStart && shiftDate <= weekEnd;
  }), [shifts, weekStart, weekEnd]);

  const weekClockEntries = useMemo(() => clockEntries.filter(c => {
    const clockDate = new Date(c.clock_in);
    return clockDate >= weekStart && clockDate <= weekEnd;
  }), [clockEntries, weekStart, weekEnd]);

  const totalWeeklyHours = useMemo(() => {
    return weekClockEntries.reduce((sum, entry) => {
      if (entry.total_minutes) return sum + (entry.total_minutes / 60);
      return sum;
    }, 0).toFixed(2);
  }, [weekClockEntries]);

  const overtimeHours = useMemo(() => {
    const empHours = {};
    weekClockEntries.forEach(entry => {
      if (entry.employee_id) {
        empHours[entry.employee_id] = (empHours[entry.employee_id] || 0) + (entry.total_minutes || 0) / 60;
      }
    });
    return Object.values(empHours).reduce((sum, hrs) => sum + Math.max(0, hrs - 40), 0).toFixed(2);
  }, [weekClockEntries]);

  const shiftFillRate = useMemo(() => {
    if (weekShifts.length === 0) return 0;
    const filled = weekShifts.filter(s => s.status === 'completed' || (s.status === 'scheduled' && s.employee_id)).length;
    return ((filled / weekShifts.length) * 100).toFixed(1);
  }, [weekShifts]);

  const openShifts = useMemo(() => weekShifts.filter(s => s.status === 'open').length, [weekShifts]);

  const expiringCerts = useMemo(() => {
    return certs.filter(c => {
      const expiry = new Date(c.expiry_date);
      return isAfter(expiry, now) && isBefore(expiry, thirtyDaysLater);
    });
  }, [certs, now, thirtyDaysLater]);

  const weeklyLaborCost = useMemo(() => {
    let cost = 0;
    weekClockEntries.forEach(entry => {
      const emp = employees.find(e => e.id === entry.employee_id);
      if (emp?.hourly_rate && entry.total_minutes) {
        cost += (emp.hourly_rate * (entry.total_minutes / 60));
      }
    });
    return cost.toFixed(2);
  }, [weekClockEntries, employees]);

  // Chart data
  const shiftFillData = useMemo(() => {
    const locShifts = {};
    weekShifts.forEach(s => {
      if (!locShifts[s.location_id]) locShifts[s.location_id] = { filled: 0, open: 0, name: s.location_name };
      if (s.status === 'open') locShifts[s.location_id].open++;
      else locShifts[s.location_id].filled++;
    });
    return Object.values(locShifts).map(d => ({
      name: d.name,
      Filled: d.filled,
      Open: d.open,
    }));
  }, [weekShifts]);

  const certExpiryData = useMemo(() => {
    const grouped = {};
    expiringCerts.forEach(c => {
      grouped[c.certification_type] = (grouped[c.certification_type] || 0) + 1;
    });
    return Object.entries(grouped).map(([type, count]) => ({
      name: type,
      count,
    }));
  }, [expiringCerts]);

  if (shiftsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold mb-1">Admin Metrics Dashboard</h1>
        <p className="text-slate-600">Week of {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Weekly Labor Cost</p>
                <p className="text-2xl font-bold">${weeklyLaborCost}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Hours Worked</p>
                <p className="text-2xl font-bold">{totalWeeklyHours}h</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Overtime Hours</p>
                <p className="text-2xl font-bold">{overtimeHours}h</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Shift Fill Rate</p>
                <p className="text-2xl font-bold">{shiftFillRate}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shift Fill Rate by Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shift Fill Rate by Location</CardTitle>
          </CardHeader>
          <CardContent>
            {shiftFillData.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No shifts this week</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shiftFillData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Filled" stackId="a" fill="#10b981" />
                  <Bar dataKey="Open" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Certifications Expiring Soon */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Certifications Expiring (Next 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {certExpiryData.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No expirations coming up</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={certExpiryData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {certExpiryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expiring Certifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Employees with Expiring Certifications</CardTitle>
        </CardHeader>
        <CardContent>
          {expiringCerts.length === 0 ? (
            <p className="text-slate-500 text-center py-6">No certifications expiring in the next 30 days</p>
          ) : (
            <div className="space-y-3">
              {expiringCerts.map(cert => {
                const emp = employees.find(e => e.id === cert.employee_id);
                const daysUntilExpiry = Math.ceil((new Date(cert.expiry_date) - now) / (1000 * 60 * 60 * 24));
                return (
                  <div key={cert.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium">{emp?.name || 'Unknown Employee'}</p>
                      <p className="text-sm text-slate-600">{cert.certification_type} • Expires {format(new Date(cert.expiry_date), 'MMM d, yyyy')}</p>
                    </div>
                    <Badge variant={daysUntilExpiry <= 7 ? 'destructive' : 'default'}>
                      {daysUntilExpiry} days
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-slate-700">
            <strong>{weekShifts.length}</strong> shifts scheduled this week | <strong>{openShifts}</strong> open shifts | <strong>{expiringCerts.length}</strong> certifications expiring soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}