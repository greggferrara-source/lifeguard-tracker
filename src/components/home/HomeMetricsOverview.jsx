import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Clock, AlertTriangle, Users, ArrowRight, Loader2 } from 'lucide-react';

export default function HomeMetricsOverview() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

  const { data: swapRequests = [], isLoading: swapsLoading } = useQuery({
    queryKey: ['swaps-overview'],
    queryFn: () => base44.entities.ShiftSwapRequest.list('-created_date', 50),
  });

  const { data: clockEntries = [] } = useQuery({
    queryKey: ['clockEntries-overview'],
    queryFn: () => base44.entities.ClockEntry.list('-created_date', 500),
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ['shifts-overview'],
    queryFn: () => base44.entities.Shift.list('-created_date', 500),
  });

  // Calculate metrics
  const pendingSwaps = useMemo(
    () => swapRequests.filter(s => s.status === 'pending_employee' || s.status === 'pending_manager').length,
    [swapRequests]
  );

  const weekClockEntries = useMemo(() => {
    return clockEntries.filter(c => {
      const clockDate = new Date(c.clock_in);
      return clockDate >= weekStart && clockDate <= weekEnd;
    });
  }, [clockEntries, weekStart, weekEnd]);

  const totalWeeklyHours = useMemo(() => {
    return weekClockEntries.reduce((sum, entry) => {
      if (entry.total_minutes) return sum + (entry.total_minutes / 60);
      return sum;
    }, 0).toFixed(1);
  }, [weekClockEntries]);

  const unstaffedShifts = useMemo(() => {
    const weekShifts = shifts.filter(s => {
      const shiftDate = new Date(s.date);
      return shiftDate >= weekStart && shiftDate <= weekEnd;
    });
    return weekShifts.filter(s => s.status === 'open' || !s.employee_id).length;
  }, [shifts, weekStart, weekEnd]);

  if (swapsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Swaps */}
        <Card className={pendingSwaps > 0 ? 'border-orange-200 bg-orange-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pending Swap Requests</p>
                <p className="text-3xl font-bold text-slate-900">{pendingSwaps}</p>
              </div>
              <Badge variant={pendingSwaps > 0 ? 'default' : 'secondary'}>
                {pendingSwaps > 0 ? 'Action Needed' : 'All Clear'}
              </Badge>
            </div>
            {pendingSwaps > 0 && (
              <Link to={createPageUrl('ShiftSwaps')} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700">
                Review Requests <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Weekly Hours */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Hours Worked This Week</p>
                <p className="text-3xl font-bold text-slate-900">{totalWeeklyHours}h</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
            <p className="text-xs text-slate-500 mt-2">{format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d')}</p>
          </CardContent>
        </Card>

        {/* Unstaffed Shifts */}
        <Card className={unstaffedShifts > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Open / Unstaffed Shifts</p>
                <p className="text-3xl font-bold text-slate-900">{unstaffedShifts}</p>
              </div>
              <Badge variant={unstaffedShifts > 0 ? 'destructive' : 'secondary'}>
                {unstaffedShifts > 0 ? 'Alert' : 'Full'}
              </Badge>
            </div>
            {unstaffedShifts > 0 && (
              <Link to={createPageUrl('Schedule')} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700">
                Fill Shifts <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link to={createPageUrl('AdminMetricsDashboard')}>
          <Button variant="outline" size="sm">
            View Detailed Metrics
          </Button>
        </Link>
        <Link to={createPageUrl('EquipmentTracking')}>
          <Button variant="outline" size="sm">
            Equipment Status
          </Button>
        </Link>
      </div>
    </div>
  );
}