import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default function MobileClockInWithGPS({ employeeId, onSuccess }) {
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [clockedInShift, setClockedInShift] = useState(null);

  const { data: todayShifts = [] } = useQuery({
    queryKey: ['today-shifts', employeeId],
    queryFn: () => base44.entities.Shift.filter({
      employee_id: employeeId,
      shift_date: new Date().toISOString().split('T')[0]
    })
  });

  const { data: activeClock } = useQuery({
    queryKey: ['active-clock', employeeId],
    queryFn: () => base44.entities.ClockEntry.filter({
      employee_id: employeeId,
      status: 'clocked_in'
    }, '', 1)
  });

  useEffect(() => {
    if (activeClock && activeClock.length > 0) {
      setClockedInShift(activeClock[0]);
    }
  }, [activeClock]);

  const requestGPS = () => {
    setGpsLoading(true);
    setGpsError(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setGpsLoading(false);
        },
        (error) => {
          setGpsError(error.message || 'Unable to access GPS');
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsError('GPS not available on this device');
      setGpsLoading(false);
    }
  };

  const clockInMutation = useMutation({
    mutationFn: async (shift) => {
      if (!gpsLocation) throw new Error('GPS location required');

      // Verify GPS location
      const verification = await base44.functions.invoke('verifyGPSLocation', {
        employee_id: employeeId,
        location_id: shift.location_id,
        latitude: gpsLocation.latitude,
        longitude: gpsLocation.longitude,
        shift_id: shift.id
      });

      if (!verification.verified) {
        throw new Error(verification.message);
      }

      // Create clock entry
      const clockEntry = await base44.entities.ClockEntry.create({
        employee_id: employeeId,
        employee_name: shift.employee_name,
        location_id: shift.location_id,
        location_name: shift.location_name,
        shift_id: shift.id,
        clock_in: new Date().toISOString(),
        clock_in_latitude: gpsLocation.latitude,
        clock_in_longitude: gpsLocation.longitude,
        clock_in_verified: true,
        clock_in_distance_meters: verification.distance_meters,
        status: 'clocked_in'
      });

      return clockEntry;
    },
    onSuccess: () => {
      setGpsLocation(null);
      onSuccess?.();
    }
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      if (!gpsLocation) throw new Error('GPS location required');
      if (!clockedInShift) throw new Error('No active clock-in found');

      const now = new Date();
      const clockInTime = new Date(clockedInShift.clock_in);
      const totalMinutes = Math.round((now - clockInTime) / 60000);

      await base44.entities.ClockEntry.update(clockedInShift.id, {
        clock_out: now.toISOString(),
        clock_out_latitude: gpsLocation.latitude,
        clock_out_longitude: gpsLocation.longitude,
        clock_out_verified: true,
        status: 'clocked_out',
        total_minutes: totalMinutes
      });
    },
    onSuccess: () => {
      setGpsLocation(null);
      setClockedInShift(null);
      onSuccess?.();
    }
  });

  const upcomingShift = todayShifts?.[0];

  return (
    <div className="space-y-4 p-4">
      {/* GPS Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#1a9c5b]" />
            GPS Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gpsLocation ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold">Location Acquired</span>
              </div>
              <p className="text-xs text-green-700">
                Lat: {gpsLocation.latitude.toFixed(6)}, Lon: {gpsLocation.longitude.toFixed(6)}
              </p>
              <p className="text-xs text-green-700">Accuracy: ±{Math.round(gpsLocation.accuracy)}m</p>
            </div>
          ) : gpsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold">GPS Error</span>
              </div>
              <p className="text-xs text-red-700">{gpsError}</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Location not yet acquired</p>
            </div>
          )}

          <Button
            onClick={requestGPS}
            disabled={gpsLoading}
            variant="outline"
            className="w-full"
          >
            {gpsLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Get Current Location
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Clock In */}
      {!clockedInShift && upcomingShift && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1a9c5b]" />
              Clock In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-blue-900">{upcomingShift.location_name}</p>
              <p className="text-xs text-blue-800 mt-1">
                {upcomingShift.shift_start} - {upcomingShift.shift_end}
              </p>
            </div>

            <Button
              onClick={() => clockInMutation.mutate(upcomingShift)}
              disabled={!gpsLocation || clockInMutation.isPending}
              className="w-full bg-[#1a9c5b] hover:bg-[#158a4e]"
            >
              {clockInMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Verifying Location...
                </>
              ) : (
                'Clock In'
              )}
            </Button>

            {clockInMutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-700">{clockInMutation.error?.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Clock Out */}
      {clockedInShift && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Clocked In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-green-900">{clockedInShift.location_name}</p>
              <p className="text-xs text-green-800 mt-1">
                Since {new Date(clockedInShift.clock_in).toLocaleTimeString()}
              </p>
            </div>

            <Button
              onClick={() => clockOutMutation.mutate()}
              disabled={!gpsLocation || clockOutMutation.isPending}
              variant="destructive"
              className="w-full"
            >
              {clockOutMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Clocking Out...
                </>
              ) : (
                'Clock Out'
              )}
            </Button>

            {clockOutMutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-700">{clockOutMutation.error?.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}