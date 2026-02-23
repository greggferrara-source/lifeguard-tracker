import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Droplets, Thermometer, Wind, Radio, AlertCircle } from 'lucide-react';

export default function IoTSensorDashboard() {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  const { data: readings = [] } = useQuery({
    queryKey: ['iot-readings'],
    queryFn: () => base44.entities.IoTSensorReading.list('-timestamp', 100),
    refetchInterval: refreshInterval * 1000
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['iot-alerts'],
    queryFn: () => base44.entities.IoTSensorAlert.filter({ resolved: false }),
    refetchInterval: refreshInterval * 1000
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list()
  });

  // Group readings by location and sensor type
  const groupedReadings = readings.reduce((acc, reading) => {
    if (selectedLocation !== 'all' && reading.location_id !== selectedLocation) return acc;
    if (!acc[reading.location_id]) acc[reading.location_id] = {};
    if (!acc[reading.location_id][reading.sensor_type]) {
      acc[reading.location_id][reading.sensor_type] = [];
    }
    acc[reading.location_id][reading.sensor_type].push(reading);
    return acc;
  }, {});

  const sensorIcons = {
    ph: Droplets,
    chlorine: Droplets,
    temperature_water: Thermometer,
    temperature_air: Wind,
    humidity: Wind,
    gate_entry: Radio
  };

  const sensorUnits = {
    ph: 'pH',
    chlorine: 'ppm',
    temperature_water: '°C',
    temperature_air: '°C',
    humidity: '%',
    gate_entry: 'count'
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">IoT Sensor Monitoring</h1>
        <p className="text-gray-600 mt-1">Real-time facility data with automated alerts</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Locations</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
        <select
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value={10}>Refresh: 10s</option>
          <option value={30}>Refresh: 30s</option>
          <option value={60}>Refresh: 60s</option>
        </select>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{alert.sensor_name}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.triggered_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="destructive">{alert.alert_type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sensor Readings Grid */}
      <div className="space-y-6">
        {Object.entries(groupedReadings).map(([locationId, sensorTypes]) => {
          const location = locations.find(l => l.id === locationId);
          return (
            <div key={locationId} className="space-y-4">
              <h2 className="text-xl font-bold">{location?.name || 'Unknown Location'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(sensorTypes).map(([sensorType, sensorReadings]) => {
                  const latest = sensorReadings[0];
                  const Icon = sensorIcons[sensorType] || Radio;
                  const unit = sensorUnits[sensorType];

                  return (
                    <Card key={`${locationId}-${sensorType}`} className={`border-2 ${getStatusColor(latest.status)}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-600">{latest.sensor_name}</p>
                            <p className="text-3xl font-bold mt-1">
                              {latest.value}{unit}
                            </p>
                          </div>
                          <Icon className="w-8 h-8 opacity-50" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{new Date(latest.timestamp).toLocaleTimeString()}</span>
                          <Badge variant="outline" className="capitalize">
                            {latest.status}
                          </Badge>
                        </div>
                        {latest.battery_level && (
                          <div className="mt-3 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span>Battery</span>
                              <span>{latest.battery_level}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${latest.battery_level > 50 ? 'bg-green-500' : 'bg-orange-500'}`}
                                style={{ width: `${latest.battery_level}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}