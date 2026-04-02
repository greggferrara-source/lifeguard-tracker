import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Clock, CheckCircle2, AlertTriangle, Loader2,
  Navigation, LogIn, LogOut, RefreshCw, ShieldCheck
} from "lucide-react";
import { format, parseISO } from "date-fns";

const GEOFENCE_BUFFER_METERS = 50; // extra tolerance beyond location's configured radius

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function StatusBadge({ status }) {
  const map = {
    scheduled: "bg-blue-100 text-blue-700",
    in_progress: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-500",
    open: "bg-amber-100 text-amber-700",
    no_show: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-400",
  };
  return (
    <Badge className={`${map[status] || "bg-gray-100 text-gray-500"} text-[10px] capitalize border-0`}>
      {status?.replace("_", " ")}
    </Badge>
  );
}

export default function GeofenceCheckIn() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const [gps, setGps] = useState(null); // { lat, lon, accuracy }
  const [gpsError, setGpsError] = useState(null);
  const [locating, setLocating] = useState(false);
  const [actionResult, setActionResult] = useState(null); // { type: 'success'|'error', message }
  const [processingShiftId, setProcessingShiftId] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
    enabled: !!user,
  });

  const myEmployee = employees.find(
    e => e.email?.toLowerCase() === user?.email?.toLowerCase()
  );

  const { data: todayShifts = [], isLoading: loadingShifts, refetch } = useQuery({
    queryKey: ["my-shifts-today", myEmployee?.id],
    queryFn: () => base44.entities.Shift.filter({ employee_id: myEmployee.id, date: today }),
    enabled: !!myEmployee?.id,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list(),
  });

  const locationMap = Object.fromEntries(locations.map(l => [l.id, l]));

  const getGPS = useCallback(() => {
    setLocating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGps({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setLocating(false);
      },
      err => {
        setGpsError(err.message || "Could not get location. Please enable GPS.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    if (user) getGPS();
  }, [user]);

  const checkInMutation = useMutation({
    mutationFn: async ({ shift, action }) => {
      const loc = locationMap[shift.location_id];
      if (!loc?.latitude || !loc?.longitude) {
        throw new Error("This location has no GPS coordinates configured. Ask your manager to set them up.");
      }

      const radius = (loc.geofence_radius_meters || 100) + GEOFENCE_BUFFER_METERS;
      const distance = haversineDistance(gps.lat, gps.lon, loc.latitude, loc.longitude);

      if (distance > radius) {
        throw new Error(
          `You're ${Math.round(distance)}m from ${loc.name} (allowed radius: ${Math.round(radius)}m). Move closer to check ${action === "checkin" ? "in" : "out"}.`
        );
      }

      const now = new Date().toISOString();
      const updateData = action === "checkin"
        ? {
          status: "in_progress",
          checkin_time: now,
          checkin_latitude: gps.lat,
          checkin_longitude: gps.lon,
          checkin_accuracy_meters: Math.round(gps.accuracy),
          checkin_distance_meters: Math.round(distance),
        }
        : {
          status: "completed",
          checkout_time: now,
          checkout_latitude: gps.lat,
          checkout_longitude: gps.lon,
          checkout_accuracy_meters: Math.round(gps.accuracy),
          checkout_distance_meters: Math.round(distance),
        };

      await base44.entities.Shift.update(shift.id, updateData);

      // Also create a ClockEntry log
      if (action === "checkin") {
        await base44.entities.ClockEntry.create({
          employee_id: myEmployee.id,
          employee_name: `${myEmployee.first_name} ${myEmployee.last_name}`,
          employee_email: myEmployee.email,
          location_id: shift.location_id,
          location_name: shift.location_name,
          shift_id: shift.id,
          shift_start: shift.start_time,
          shift_end: shift.end_time,
          shift_date: shift.date,
          clock_in: now,
          clock_in_latitude: gps.lat,
          clock_in_longitude: gps.lon,
          clock_in_verified: true,
          clock_in_distance_meters: Math.round(distance),
          status: "clocked_in",
        });
      } else {
        // Update existing clock entry
        const entries = await base44.entities.ClockEntry.filter({ shift_id: shift.id, status: "clocked_in" });
        if (entries[0]) {
          const clockIn = new Date(entries[0].clock_in);
          const totalMins = Math.round((new Date(now) - clockIn) / 60000);
          await base44.entities.ClockEntry.update(entries[0].id, {
            clock_out: now,
            clock_out_latitude: gps.lat,
            clock_out_longitude: gps.lon,
            clock_out_verified: true,
            clock_out_distance_meters: Math.round(distance),
            status: "clocked_out",
            total_minutes: totalMins,
          });
        }
      }

      return { distance: Math.round(distance), loc: loc.name, action };
    },
    onSuccess: (data) => {
      setActionResult({
        type: "success",
        message: data.action === "checkin"
          ? `Checked in at ${data.loc} (${data.distance}m away)`
          : `Checked out from ${data.loc} — shift complete!`,
      });
      setProcessingShiftId(null);
      queryClient.invalidateQueries({ queryKey: ["my-shifts-today"] });
      refetch();
    },
    onError: (err) => {
      setActionResult({ type: "error", message: err.message });
      setProcessingShiftId(null);
    },
  });

  const handleAction = (shift, action) => {
    if (!gps) { getGPS(); return; }
    setProcessingShiftId(shift.id);
    setActionResult(null);
    checkInMutation.mutate({ shift, action });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96 p-6">
        <div className="text-center text-gray-400">
          <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="font-medium">Please log in to use Geofence Check-In</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Check In / Out</h1>
        <p className="text-sm text-gray-500 mt-0.5">GPS-verified shift check-in for {format(new Date(), "EEEE, MMM d")}</p>
      </div>

      {/* GPS Status */}
      <Card className={`border ${gps ? "border-green-200 bg-green-50/40" : gpsError ? "border-red-200 bg-red-50/40" : "border-gray-200"}`}>
        <CardContent className="py-3 flex items-center gap-3">
          {locating ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
          ) : gps ? (
            <Navigation className="w-4 h-4 text-green-600 flex-shrink-0" />
          ) : (
            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            {locating && <p className="text-sm text-blue-600 font-medium">Getting your location…</p>}
            {gps && !locating && (
              <>
                <p className="text-sm text-green-700 font-medium">Location acquired</p>
                <p className="text-xs text-green-600">±{Math.round(gps.accuracy)}m accuracy</p>
              </>
            )}
            {gpsError && !locating && (
              <>
                <p className="text-sm text-red-600 font-medium">Location unavailable</p>
                <p className="text-xs text-red-500 truncate">{gpsError}</p>
              </>
            )}
            {!gps && !gpsError && !locating && (
              <p className="text-sm text-gray-500">GPS not yet acquired</p>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={getGPS} disabled={locating} className="flex-shrink-0">
            <RefreshCw className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} />
          </Button>
        </CardContent>
      </Card>

      {/* Action Result */}
      {actionResult && (
        <div className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${actionResult.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {actionResult.type === "success"
            ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            : <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          <p>{actionResult.message}</p>
        </div>
      )}

      {/* Today's Shifts */}
      {loadingShifts ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        </div>
      ) : !myEmployee ? (
        <Card className="border border-amber-200 bg-amber-50/40">
          <CardContent className="py-6 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-amber-800">No employee profile found</p>
            <p className="text-xs text-amber-600 mt-1">Ask your manager to add you as an employee</p>
          </CardContent>
        </Card>
      ) : todayShifts.length === 0 ? (
        <Card className="border border-gray-100">
          <CardContent className="py-10 text-center text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No shifts scheduled for today</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {todayShifts.map(shift => {
            const loc = locationMap[shift.location_id];
            const isProcessing = processingShiftId === shift.id;
            const canCheckIn = shift.status === "scheduled" || shift.status === "open";
            const canCheckOut = shift.status === "in_progress";
            const distance = gps && loc?.latitude && loc?.longitude
              ? Math.round(haversineDistance(gps.lat, gps.lon, loc.latitude, loc.longitude))
              : null;
            const radius = (loc?.geofence_radius_meters || 100) + GEOFENCE_BUFFER_METERS;
            const withinFence = distance !== null && distance <= radius;

            return (
              <Card key={shift.id} className="border border-gray-100">
                <CardContent className="py-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{shift.location_name || "Unknown Location"}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {shift.start_time} – {shift.end_time}
                        {shift.checkin_time && (
                          <span className="ml-2 text-green-600">
                            · Checked in {format(parseISO(shift.checkin_time), "h:mm a")}
                          </span>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={shift.status} />
                  </div>

                  {/* Distance indicator */}
                  {distance !== null && (canCheckIn || canCheckOut) && (
                    <div className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md ${withinFence ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        {distance}m from {loc?.name || "location"}
                        {withinFence
                          ? ` · Within range (${Math.round(radius)}m)`
                          : ` · Too far — need to be within ${Math.round(radius)}m`}
                      </span>
                    </div>
                  )}

                  {!loc?.latitude && (canCheckIn || canCheckOut) && (
                    <p className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-md">
                      ⚠ Location has no GPS coordinates set — check-in verification unavailable
                    </p>
                  )}

                  {/* Action Buttons */}
                  {canCheckIn && (
                    <Button
                      className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] gap-2"
                      onClick={() => handleAction(shift, "checkin")}
                      disabled={isProcessing || locating || !gps}
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                      {isProcessing ? "Verifying location…" : "Check In"}
                    </Button>
                  )}
                  {canCheckOut && (
                    <Button
                      className="w-full gap-2"
                      variant="outline"
                      onClick={() => handleAction(shift, "checkout")}
                      disabled={isProcessing || locating || !gps}
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                      {isProcessing ? "Verifying location…" : "Check Out"}
                    </Button>
                  )}
                  {shift.status === "completed" && (
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Shift complete
                      {shift.checkout_time && (
                        <span className="text-gray-400 font-normal">· Out at {format(parseISO(shift.checkout_time), "h:mm a")}</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}