import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, isPast, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar, Clock, MapPin, AlertTriangle, CheckCircle2, ArrowLeftRight,
  Plus, ChevronRight, Loader2
} from 'lucide-react';
import TimeOffDialog from '@/components/timeoff/TimeOffDialog';
import AvailabilityDialog from '@/components/availability/AvailabilityDialog';
import ShiftSwapDialog from '@/components/schedule/ShiftSwapDialog';

export default function EmployeeShiftDashboard() {
  const [timeOffOpen, setTimeOffOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapShift, setSwapShift] = useState(null);

  // Get current user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Get employee record for current user
  const { data: employee, isLoading: empLoading } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const emps = await base44.entities.Employee.filter({ email: user.email }, '-created_date', 1);
      return emps?.[0] || null;
    },
    enabled: !!user?.email,
  });

  // Get all shifts for this employee
  const { data: shifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ['myShifts', employee?.id],
    queryFn: () => base44.entities.Shift.filter({ employee_id: employee.id }, '-date', 100),
    enabled: !!employee?.id,
    refetchInterval: 60000,
  });

  // Get time off requests for this employee
  const { data: timeOffRequests = [] } = useQuery({
    queryKey: ['myTimeOff', employee?.id],
    queryFn: () => base44.entities.TimeOffRequest.filter({ employee_id: employee.id }, '-created_date', 50),
    enabled: !!employee?.id,
  });

  // Get shift swap requests (both initiated and received)
  const { data: swapRequests = [] } = useQuery({
    queryKey: ['mySwaps', employee?.id],
    queryFn: async () => {
      if (!employee?.id) return [];
      const initiated = await base44.entities.ShiftSwapRequest.filter({ initiator_id: employee.id }, '-created_date', 50);
      const received = await base44.entities.ShiftSwapRequest.filter({ target_id: employee.id }, '-created_date', 50);
      return [...initiated, ...received];
    },
    enabled: !!employee?.id,
  });

  // Get availability records
  const { data: availability = [] } = useQuery({
    queryKey: ['myAvailability', employee?.id],
    queryFn: () => base44.entities.EmployeeAvailability.filter({ employee_id: employee.id }, '-created_date', 50),
    enabled: !!employee?.id,
  });

  // Get locations for display
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list('-created_date', 100),
  });

  const locationMap = useMemo(() => Object.fromEntries(locations.map(l => [l.id, l])), [locations]);

  // Split shifts into upcoming and past
  const today = new Date().toISOString().split('T')[0];
  const upcomingShifts = useMemo(
    () => shifts.filter(s => s.date >= today && s.status !== 'cancelled').sort((a, b) => new Date(a.date) - new Date(b.date)),
    [shifts, today]
  );

  const pastShifts = useMemo(
    () => shifts.filter(s => s.date < today).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [shifts, today]
  );

  // Active swaps and time off
  const pendingSwaps = swapRequests.filter(s => s.status === 'pending_employee' || s.status === 'pending_manager');
  const activeTimeOff = timeOffRequests.filter(t => t.status === 'approved' && new Date(t.start_date) >= new Date());

  if (userLoading || empLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 text-center text-slate-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Employee record not found. Please contact your manager.</p>
      </div>
    );
  }

  const ShiftCard = ({ shift, isPast = false }) => {
    const location = locationMap[shift.location_id];
    const shiftDate = new Date(shift.date);
    const isUpcomingSoon = !isPast && new Date(shift.date) <= addDays(new Date(), 3);

    return (
      <Card className={`${isPast ? 'opacity-60' : ''} ${isUpcomingSoon && !isPast ? 'border-blue-200 bg-blue-50' : ''}`}>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold">{format(shiftDate, 'EEEE, MMM d, yyyy')}</span>
                  {isToday(shiftDate) && <Badge className="bg-green-100 text-green-700">Today</Badge>}
                  {isUpcomingSoon && !isPast && <Badge className="bg-blue-100 text-blue-700">Soon</Badge>}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 ml-6">
                  <Clock className="w-3.5 h-3.5" />
                  {shift.start_time} – {shift.end_time}
                </div>
              </div>
              <Badge variant={isPast ? 'secondary' : 'default'}>
                {shift.status}
              </Badge>
            </div>

            {location && (
              <div className="flex items-start gap-2 text-sm text-slate-600 ml-6">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">{location.name}</p>
                  {location.address && <p className="text-xs text-slate-500">{location.address}</p>}
                </div>
              </div>
            )}

            {!isPast && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSwapShift(shift);
                    setSwapOpen(true);
                  }}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />
                  Request Swap
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold mb-1">My Shift Dashboard</h1>
        <p className="text-slate-600">Manage your shifts, availability, and time off</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{upcomingShifts.length}</div>
              <p className="text-sm text-slate-600">Upcoming Shifts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{pendingSwaps.length}</div>
              <p className="text-sm text-slate-600">Pending Swaps</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{activeTimeOff.length}</div>
              <p className="text-sm text-slate-600">Approved Time Off</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="swaps">Swaps</TabsTrigger>
          <TabsTrigger value="timeoff">Time Off</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        {/* Upcoming Shifts */}
        <TabsContent value="upcoming" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Upcoming Shifts</h2>
          </div>
          {shiftsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : upcomingShifts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-slate-500">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No upcoming shifts scheduled</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingShifts.map(shift => (
                <ShiftCard key={shift.id} shift={shift} isPast={false} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Shift Swaps */}
        <TabsContent value="swaps" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Shift Swap Requests</h2>
            <Button
              size="sm"
              onClick={() => {
                setSwapShift(upcomingShifts[0] || null);
                setSwapOpen(true);
              }}
              disabled={upcomingShifts.length === 0}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Request
            </Button>
          </div>
          {swapRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-slate-500">
                <ArrowLeftRight className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No swap requests yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {swapRequests.map(swap => (
                <Card key={swap.id} className={swap.status === 'approved' ? 'border-green-200 bg-green-50' : swap.status === 'rejected' ? 'border-red-200 bg-red-50' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{swap.from_shift_date} • {swap.from_shift_start_time}</p>
                        <p className="text-sm text-slate-600">→ {swap.to_shift_date} • {swap.to_shift_start_time}</p>
                      </div>
                      <Badge variant={swap.status === 'approved' ? 'default' : 'secondary'}>
                        {swap.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Time Off */}
        <TabsContent value="timeoff" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Time Off Requests</h2>
            <Button size="sm" onClick={() => setTimeOffOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Request Time Off
            </Button>
          </div>
          {timeOffRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-slate-500">
                <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No time off requests yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {timeOffRequests.map(req => (
                <Card key={req.id} className={req.status === 'approved' ? 'border-green-200 bg-green-50' : req.status === 'rejected' ? 'border-red-200 bg-red-50' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{format(new Date(req.start_date), 'MMM d')} – {format(new Date(req.end_date), 'MMM d, yyyy')}</p>
                        {req.reason && <p className="text-sm text-slate-600">{req.reason}</p>}
                      </div>
                      <Badge variant={req.status === 'approved' ? 'default' : 'secondary'}>
                        {req.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Availability */}
        <TabsContent value="availability" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Availability</h2>
            <Button size="sm" onClick={() => setAvailabilityOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Update Availability
            </Button>
          </div>
          {availability.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-slate-500">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No availability set yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {availability.map(avail => (
                <Card key={avail.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{avail.day_of_week}</p>
                        <p className="text-sm text-slate-600">{avail.start_time} – {avail.end_time}</p>
                      </div>
                      <Badge variant={avail.available ? 'default' : 'secondary'}>
                        {avail.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Past Shifts */}
      <div className="border-t border-slate-200 pt-6">
        <h2 className="text-xl font-semibold mb-4">Past Shifts</h2>
        {pastShifts.length === 0 ? (
          <p className="text-slate-500 text-sm">No past shifts</p>
        ) : (
          <div className="space-y-3">
            {pastShifts.slice(0, 5).map(shift => (
              <ShiftCard key={shift.id} shift={shift} isPast={true} />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <TimeOffDialog open={timeOffOpen} onOpenChange={setTimeOffOpen} employee={employee} />
      <AvailabilityDialog open={availabilityOpen} onOpenChange={setAvailabilityOpen} employee={employee} />
      {swapShift && (
        <ShiftSwapDialog
          open={swapOpen}
          onOpenChange={setSwapOpen}
          shift={swapShift}
          employee={employee}
        />
      )}
    </div>
  );
}