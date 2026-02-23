import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function IoTAnalyticsDashboard() {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [period, setPeriod] = useState('week'); // week, month, custom

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list()
  });

  const { data: readings = [] } = useQuery({
    queryKey: ['iot-readings', selectedLocation, period],
    queryFn: () => base44.entities.IoTSensorReading.list('-timestamp', 500)
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['analytics-reports', selectedLocation],
    queryFn: () => base44.entities.IoTAnalyticsReport.filter({ location_id: selectedLocation !== 'all' ? selectedLocation : undefined })
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['safety-predictions', selectedLocation],
    queryFn: () => base44.entities.SafetyPrediction.filter({ location_id: selectedLocation !== 'all' ? selectedLocation : undefined })
  });

  const filteredReadings = readings.filter(r => selectedLocation === 'all' || r.location_id === selectedLocation);

  // Group readings by sensor type for visualization
  const sensorData = filteredReadings.reduce((acc, reading) => {
    const key = `${reading.sensor_type}_${reading.sensor_id}`;
    if (!acc[key]) {
      acc[key] = {
        sensor_type: reading.sensor_type,
        sensor_name: reading.sensor_name,
        location_name: reading.location_name,
        data: []
      };
    }
    acc[key].data.push({
      time: new Date(reading.timestamp).toLocaleTimeString(),
      value: reading.value,
      status: reading.status,
      timestamp: reading.timestamp
    });
    return acc;
  }, {});

  // Calculate statistics
  const stats = Object.entries(sensorData).map(([key, sensor]) => {
    const values = sensor.data.map(d => d.value);
    return {
      ...sensor,
      avg: (values.reduce((a, b) => a + b) / values.length).toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      trend: values[values.length - 1] > values[0] ? 'up' : 'down'
    };
  });

  const latestReport = reports[0];
  const latestPrediction = predictions[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">IoT Analytics & Insights</h1>
          <p className="text-gray-600 mt-1">Historical trends, anomalies, and AI-powered predictions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
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
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {/* Safety Risk Prediction */}
      {latestPrediction && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Safety Risk Prediction</span>
              <Badge variant={
                latestPrediction.incident_risk_level === 'critical' ? 'destructive' :
                latestPrediction.incident_risk_level === 'high' ? 'secondary' : 'default'
              }>
                {latestPrediction.incident_risk_level.toUpperCase()} RISK
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 uppercase">Recommended Staffing</p>
                <p className="text-2xl font-bold">{latestPrediction.staffing_recommendation?.recommended_headcount || 'N/A'}</p>
                {latestPrediction.staffing_recommendation?.shortage > 0 && (
                  <p className="text-sm text-red-600">Shortage: {latestPrediction.staffing_recommendation.shortage}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Key Risk Factors</p>
                <div className="space-y-1">
                  {latestPrediction.risk_factors?.slice(0, 2).map((rf, i) => (
                    <p key={i} className="text-sm text-gray-700">{rf.factor} ({rf.impact}%)</p>
                  ))}
                </div>
              </div>
            </div>
            {latestPrediction.recommended_actions && (
              <div>
                <p className="text-sm font-semibold mb-2">Recommended Actions:</p>
                <ul className="space-y-1">
                  {latestPrediction.recommended_actions.slice(0, 3).map((action, i) => (
                    <li key={i} className="text-sm text-gray-700">✓ {action}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sensor Trends */}
      <div className="space-y-6">
        {stats.map((sensor) => (
          <Card key={`${sensor.sensor_type}_${sensor.sensor_name}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{sensor.sensor_name}</div>
                  <p className="text-xs text-gray-500 mt-1">{sensor.location_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{sensor.sensor_type}</Badge>
                  {sensor.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Average</p>
                  <p className="text-2xl font-bold">{sensor.avg}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Min</p>
                  <p className="text-2xl font-bold">{sensor.min}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Max</p>
                  <p className="text-2xl font-bold">{sensor.max}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={sensor.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Latest Analytics Report */}
      {latestReport && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Analysis Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{latestReport.summary}</p>
            {latestReport.recommendations && (
              <div>
                <p className="font-semibold mb-2">Key Recommendations:</p>
                <ul className="space-y-2">
                  {latestReport.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-gray-700">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}