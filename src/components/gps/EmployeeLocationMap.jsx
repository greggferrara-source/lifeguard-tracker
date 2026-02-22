import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeLocationMap({ employeeId, autoRefresh = true }) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  const { data: locations = [], refetch } = useQuery({
    queryKey: ['employee-locations', employeeId],
    queryFn: () => base44.entities.EmployeeLocationTracking.filter(
      { employee_id: employeeId },
      '-timestamp',
      100
    ),
    refetchInterval: autoRefresh ? 5000 : false
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => base44.entities.Employee.read(employeeId)
  });

  useEffect(() => {
    // Load Leaflet library
    if (typeof window !== 'undefined' && !window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!mapLoaded || !window.L) return;

    const container = document.getElementById('location-map');
    if (!container) return;

    // Initialize map if not already done
    if (!map) {
      const newMap = window.L.map('location-map').setView([37.8, -122.2], 12);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(newMap);
      setMap(newMap);
      return;
    }

    // Clear old markers
    markers.forEach(m => m.remove());
    const newMarkers = [];

    if (locations.length > 0) {
      // Plot all locations
      locations.forEach((loc, idx) => {
        const color = idx === 0 ? 'red' : 'blue';
        const icon = window.L.icon({
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-${color}.png`,
          iconSize: [25, 41],
          popupAnchor: [1, -34]
        });

        const marker = window.L.marker([loc.latitude, loc.longitude], { icon })
          .bindPopup(`<strong>${loc.location_name || 'Location'}</strong><br/>${new Date(loc.timestamp).toLocaleTimeString()}<br/>${loc.event_type}`)
          .addTo(map);
        newMarkers.push(marker);
      });

      // Center on latest location
      const latest = locations[0];
      map.setView([latest.latitude, latest.longitude], 15);
    }

    setMarkers(newMarkers);
  }, [mapLoaded, locations, map]);

  const currentLoc = locations[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Live Location
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div id="location-map" style={{ width: '100%', height: '300px', borderRadius: '8px' }} />

        {currentLoc && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-semibold text-blue-900">{currentLoc.location_name || 'Current Location'}</p>
            <p className="text-blue-800">Lat: {currentLoc.latitude.toFixed(6)}, Lon: {currentLoc.longitude.toFixed(6)}</p>
            <p className="text-blue-700 text-xs mt-1">Accuracy: ±{currentLoc.accuracy_meters}m • {new Date(currentLoc.timestamp).toLocaleTimeString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}