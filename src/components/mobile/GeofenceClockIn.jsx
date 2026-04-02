import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut, MapPin, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

// Calculate distance in meters between two GPS coordinates
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const GEOFENCE_RADIUS_METERS = 200;

export default function GeofenceClockIn({
  clockedIn,
  selectedLocation,
  locations,
  onClockIn,
  onClockOut,
  disabled = false,
}) {
  const [gpsStatus, setGpsStatus] = useState("idle"); // idle | checking | ok | outside | error | unsupported
  const [gpsData, setGpsData] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);

  const location = locations.find(l => l.id === selectedLocation);

  const checkGeofence = () => {
    if (!navigator.geolocation) {
      setGpsStatus("unsupported");
      return;
    }
    if (!location?.latitude || !location?.longitude) {
      // No geofence configured — skip check
      setGpsStatus("ok");
      setGpsData({ lat: null, lng: null });
      return;
    }
    setGpsStatus("checking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const dist = haversineDistance(lat, lng, parseFloat(location.latitude), parseFloat(location.longitude));
        setDistance(Math.round(dist));
        setGpsData({ lat, lng, distance: Math.round(dist), verified: dist <= GEOFENCE_RADIUS_METERS });
        setGpsStatus(dist <= GEOFENCE_RADIUS_METERS ? "ok" : "outside");
      },
      () => {
        setGpsStatus("error");
        setGpsData({ lat: null, lng: null, verified: false });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (selectedLocation && !clockedIn) {
      setGpsStatus("idle");
      setGpsData(null);
      setDistance(null);
    }
  }, [selectedLocation]);

  const handleClockIn = async () => {
    setLoading(true);
    await onClockIn(gpsData);
    setLoading(false);
  };

  const handleClockOut = async () => {
    setLoading(true);
    const pos = await new Promise(res => {
      if (!navigator.geolocation) return res({ lat: null, lng: null });
      navigator.geolocation.getCurrentPosition(
        p => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => res({ lat: null, lng: null }),
        { timeout: 5000 }
      );
    });
    await onClockOut(pos);
    setLoading(false);
    setGpsStatus("idle");
    setGpsData(null);
  };

  // --- Clocked Out View ---
  if (!clockedIn) {
    return (
      <div className="space-y-3">
        {/* Geofence check step */}
        {location?.latitude && location?.longitude && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <MapPin className="w-3.5 h-3.5" /> Geofence Check
              </div>
              {gpsStatus === "ok" && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                  <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> In Range
                </Badge>
              )}
              {gpsStatus === "outside" && (
                <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                  <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> {distance}m away
                </Badge>
              )}
              {gpsStatus === "error" && (
                <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-[10px]">GPS Error</Badge>
              )}
            </div>

            {gpsStatus === "idle" && (
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs"
                onClick={checkGeofence}
                disabled={!selectedLocation}
              >
                <MapPin className="w-3.5 h-3.5 mr-1" /> Verify My Location
              </Button>
            )}
            {gpsStatus === "checking" && (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Getting GPS…
              </div>
            )}
            {gpsStatus === "outside" && (
              <p className="text-xs text-red-600 mt-1">
                You are {distance}m from <strong>{location.name}</strong>. Move within {GEOFENCE_RADIUS_METERS}m to clock in.
              </p>
            )}
            {gpsStatus === "ok" && (
              <p className="text-xs text-green-600 mt-1">Location verified — you're within range of {location.name}.</p>
            )}
          </div>
        )}

        <Button
          onClick={handleClockIn}
          disabled={
            disabled ||
            !selectedLocation ||
            loading ||
            (location?.latitude && location?.longitude && gpsStatus !== "ok" && gpsStatus !== "unsupported" && gpsStatus !== "error")
          }
          className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] h-14 text-base font-semibold gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogIn className="w-5 h-5" />
          )}
          {gpsStatus === "idle" && location?.latitude ? "Verify Location First" : "Clock In"}
        </Button>

        {(!location?.latitude || !location?.longitude) && selectedLocation && (
          <p className="text-xs text-gray-400 text-center">No geofence configured for this location</p>
        )}
      </div>
    );
  }

  // --- Clocked In View ---
  return (
    <Button
      onClick={handleClockOut}
      variant="destructive"
      disabled={loading}
      className="w-full h-14 text-base font-semibold gap-2"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
      Clock Out
    </Button>
  );
}