import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Users, Shield, Sun, Wind, AlertTriangle, Eye, Clock } from "lucide-react";
import { format } from "date-fns";

const UV_RISK = [
  { max: 2, label: "Low", color: "bg-green-500", advice: "No protection needed" },
  { max: 5, label: "Moderate", color: "bg-yellow-400", advice: "Sunscreen recommended" },
  { max: 7, label: "High", color: "bg-orange-500", advice: "SPF 30+ required" },
  { max: 10, label: "Very High", color: "bg-red-500", advice: "Extra precautions" },
  { max: 99, label: "Extreme", color: "bg-purple-600", advice: "Avoid midday sun" },
];

const CROWD_LEVELS = [
  { max: 30, label: "Low", color: "text-green-600", bg: "bg-green-100", desc: "Plenty of space available" },
  { max: 60, label: "Moderate", color: "text-yellow-700", bg: "bg-yellow-100", desc: "Moderate crowd levels" },
  { max: 80, label: "Busy", color: "text-orange-700", bg: "bg-orange-100", desc: "Facility is busy" },
  { max: 100, label: "At Capacity", color: "text-red-700", bg: "bg-red-100", desc: "Near or at capacity" },
];

function getCrowdLevel(pct) {
  return CROWD_LEVELS.find(c => pct <= c.max) || CROWD_LEVELS[CROWD_LEVELS.length - 1];
}
function getUVRisk(uv) {
  return UV_RISK.find(r => uv <= r.max) || UV_RISK[UV_RISK.length - 1];
}

export default function PublicStatusWidget() {
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { data: locations = [] } = useQuery({
    queryKey: ["public-locations"],
    queryFn: () => base44.entities.Location.filter({ status: "active" }),
    refetchInterval: 60000,
  });

  const { data: clockEntries = [] } = useQuery({
    queryKey: ["public-clock-entries"],
    queryFn: () => base44.entities.ClockEntry.filter({ status: "clocked_in" }),
    refetchInterval: 30000,
  });

  const { data: patronCounts = [] } = useQuery({
    queryKey: ["public-patron-counts"],
    queryFn: () => base44.entities.PatronCount.list("-created_date", 50),
    refetchInterval: 60000,
  });

  const { data: weatherAlerts = [] } = useQuery({
    queryKey: ["public-weather-alerts"],
    queryFn: () => base44.entities.WeatherAlert.filter({ active: true }),
    refetchInterval: 300000,
  });

  const { data: urgentAlerts = [] } = useQuery({
    queryKey: ["public-urgent-alerts"],
    queryFn: () => base44.entities.UrgentAlert.filter({ status: "active" }),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0]);
    }
  }, [locations]);

  useEffect(() => {
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      fetchWeather(selectedLocation.latitude, selectedLocation.longitude);
    }
  }, [selectedLocation]);

  const fetchWeather = async (lat, lng) => {
    setLoadingWeather(true);
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode,windspeed_10m,uv_index&temperature_unit=fahrenheit&windspeed_unit=mph`);
      const data = await res.json();
      setWeather(data.current);
    } catch {
      setWeather(null);
    } finally {
      setLoadingWeather(false);
    }
  };

  if (!selectedLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 flex items-center justify-center text-white">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No active locations available.</p>
        </div>
      </div>
    );
  }

  const guardsAtLocation = clockEntries.filter(e => e.location_id === selectedLocation.id);
  const guardsPresent = guardsAtLocation.length;
  const minGuards = selectedLocation.min_guards_required || 1;
  const guardStatus = guardsPresent >= minGuards ? "staffed" : guardsPresent > 0 ? "understaffed" : "unstaffed";

  const latestPatron = patronCounts.filter(p => p.location_id === selectedLocation.id)[0];
  const capacityPct = latestPatron?.capacity_percentage || 0;
  const crowd = getCrowdLevel(capacityPct);
  const uvIndex = weather?.uv_index ?? null;
  const uvRisk = uvIndex !== null ? getUVRisk(uvIndex) : null;
  const locationAlerts = urgentAlerts.filter(a => !a.location_id || a.location_id === selectedLocation.id);

  const guardStatusConfig = {
    staffed: { color: "text-green-600", bg: "bg-green-100", label: "Fully Staffed", icon: "🟢" },
    understaffed: { color: "text-orange-600", bg: "bg-orange-100", label: "Limited Guards", icon: "🟡" },
    unstaffed: { color: "text-red-600", bg: "bg-red-100", label: "No Guards On Duty", icon: "🔴" },
  };
  const gsc = guardStatusConfig[guardStatus];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 p-4">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Header */}
        <div className="text-center text-white pt-4 pb-2">
          <Shield className="w-10 h-10 mx-auto mb-2 opacity-90" />
          <h1 className="text-2xl font-bold">Live Safety Status</h1>
          <p className="text-blue-100 text-sm">Updated {format(new Date(), "h:mm a")}</p>
        </div>

        {/* Location Selector */}
        {locations.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {locations.map(loc => (
              <button key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedLocation?.id === loc.id ? "bg-white text-blue-700" : "bg-white/20 text-white hover:bg-white/30"}`}>
                {loc.name}
              </button>
            ))}
          </div>
        )}

        {/* Active Alerts */}
        {locationAlerts.length > 0 && (
          <div className="bg-red-500 text-white rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold"><AlertTriangle className="w-5 h-5" />Active Alert</div>
            {locationAlerts.map(a => (
              <div key={a.id}>
                <div className="font-semibold">{a.title}</div>
                <div className="text-sm text-red-100">{a.message}</div>
              </div>
            ))}
          </div>
        )}

        {/* Guard Status */}
        <div className={`rounded-2xl p-5 ${gsc.bg} border border-white/30`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`font-bold text-xl ${gsc.color}`}>{gsc.icon} {gsc.label}</div>
              <div className="text-gray-600 text-sm mt-0.5">{selectedLocation.name}</div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${gsc.color}`}>{guardsPresent}</div>
              <div className="text-gray-500 text-xs">guard{guardsPresent !== 1 ? "s" : ""} on duty</div>
            </div>
          </div>
          {guardsPresent < minGuards && (
            <div className="mt-2 text-xs text-gray-500">Minimum required: {minGuards}</div>
          )}
        </div>

        {/* Crowd Density */}
        {latestPatron && (
          <div className={`rounded-2xl p-5 ${crowd.bg} border border-white/30`}>
            <div className="flex items-center gap-2 mb-2">
              <Users className={`w-5 h-5 ${crowd.color}`} />
              <span className={`font-bold ${crowd.color}`}>Crowd Level: {crowd.label}</span>
            </div>
            <div className="w-full bg-white/60 rounded-full h-3">
              <div className={`h-3 rounded-full transition-all duration-500 ${
                capacityPct > 80 ? "bg-red-500" : capacityPct > 60 ? "bg-orange-400" : capacityPct > 30 ? "bg-yellow-400" : "bg-green-500"
              }`} style={{ width: `${Math.min(capacityPct, 100)}%` }} />
            </div>
            <div className={`text-sm mt-1 ${crowd.color}`}>{crowd.desc} ({capacityPct}%)</div>
          </div>
        )}

        {/* Weather */}
        {weather && (
          <div className="bg-white/90 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 font-bold text-gray-700">
              <Sun className="w-5 h-5 text-yellow-500" />Current Conditions
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-2xl font-bold text-gray-800">{Math.round(weather.temperature_2m)}°F</div>
                <div className="text-xs text-gray-500">Temperature</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <Wind className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-800">{Math.round(weather.windspeed_10m)}</div>
                <div className="text-xs text-gray-500">mph winds</div>
              </div>
              {uvIndex !== null && (
                <div className={`rounded-xl p-3 ${uvRisk.color} text-white`}>
                  <div className="text-2xl font-bold">{Math.round(uvIndex)}</div>
                  <div className="text-xs">UV {uvRisk.label}</div>
                </div>
              )}
            </div>
            {uvRisk && (
              <div className={`text-xs rounded-lg px-3 py-2 ${uvRisk.color} text-white`}>
                ☀️ {uvRisk.advice}
              </div>
            )}
          </div>
        )}

        {/* Weather Alerts */}
        {weatherAlerts.length > 0 && (
          <div className="space-y-2">
            {weatherAlerts.map(alert => (
              <div key={alert.id} className="bg-yellow-400 text-yellow-900 rounded-2xl p-4">
                <div className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{alert.title}</div>
                <div className="text-sm mt-1">{alert.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-blue-100 text-xs pb-6">
          <p>Powered by LifeGuard Tracker</p>
          <p className="mt-0.5">Data refreshes automatically every 30 seconds</p>
        </div>
      </div>
    </div>
  );
}