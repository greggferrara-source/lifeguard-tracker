import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Generate comprehensive IoT analytics reports with trend analysis and anomaly detection
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { location_id, report_type = 'daily', period_start, period_end } = await req.json();

    // Get sensor readings for the period
    const readings = await base44.asServiceRole.entities.IoTSensorReading.filter({
      location_id
    });

    // Filter by date range
    const filtered = readings.filter(r => {
      const ts = new Date(r.timestamp);
      return ts >= new Date(period_start) && ts <= new Date(period_end);
    });

    // Group by sensor type and calculate metrics
    const sensorMetrics = {};
    filtered.forEach(reading => {
      const key = reading.sensor_type;
      if (!sensorMetrics[key]) {
        sensorMetrics[key] = {
          sensor_type: reading.sensor_type,
          sensor_name: reading.sensor_name,
          values: [],
          statuses: []
        };
      }
      sensorMetrics[key].values.push(reading.value);
      sensorMetrics[key].statuses.push(reading.status);
    });

    // Calculate statistics and detect anomalies
    const metrics = Object.entries(sensorMetrics).map(([type, data]) => {
      const values = data.values;
      const avg = values.reduce((a, b) => a + b) / values.length;
      const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / values.length);
      
      // Detect anomalies (values > 2 std dev from mean)
      const anomalies = values.filter(v => Math.abs(v - avg) > 2 * stdDev);
      const trend = values[values.length - 1] > values[0] ? 'increasing' : values[values.length - 1] < values[0] ? 'decreasing' : 'stable';
      
      return {
        sensor_type: type,
        sensor_name: data.sensor_name,
        average_value: avg.toFixed(2),
        min_value: Math.min(...values).toFixed(2),
        max_value: Math.max(...values).toFixed(2),
        readings_count: values.length,
        out_of_range_count: data.statuses.filter(s => s !== 'normal').length,
        trend
      };
    });

    // Detect correlations (simple correlation check between sensor pairs)
    const correlations = [];
    const sensorArray = Object.values(sensorMetrics);
    for (let i = 0; i < sensorArray.length; i++) {
      for (let j = i + 1; j < sensorArray.length; j++) {
        const s1 = sensorArray[i];
        const s2 = sensorArray[j];
        if (s1.values.length === s2.values.length && s1.values.length > 1) {
          // Calculate Pearson correlation
          const mean1 = s1.values.reduce((a, b) => a + b) / s1.values.length;
          const mean2 = s2.values.reduce((a, b) => a + b) / s2.values.length;
          
          const num = s1.values.reduce((sum, v1, idx) => sum + (v1 - mean1) * (s2.values[idx] - mean2), 0);
          const den = Math.sqrt(
            s1.values.reduce((sum, v) => sum + Math.pow(v - mean1, 2), 0) *
            s2.values.reduce((sum, v) => sum + Math.pow(v - mean2, 2), 0)
          );
          
          if (den !== 0) {
            const correlation = num / den;
            if (Math.abs(correlation) > 0.6) {
              correlations.push({
                sensor1: s1.sensor_name,
                sensor2: s2.sensor_name,
                correlation_coefficient: correlation.toFixed(3),
                description: correlation > 0 ? 'Positive correlation' : 'Negative correlation'
              });
            }
          }
        }
      }
    }

    // Generate AI summary using LLM
    const summaryPrompt = `Analyze these water/air quality sensor readings for a pool facility:
${metrics.map(m => `${m.sensor_name}: avg=${m.average_value}, min=${m.min_value}, max=${m.max_value}, out_of_range=${m.out_of_range_count}`).join('\n')}

Provide a brief 2-3 sentence summary of water quality status and any concerns.`;

    const aiSummary = await base44.integrations.Core.InvokeLLM({
      prompt: summaryPrompt
    });

    // Anomalies detected
    const anomalies = filtered.filter(r => r.status !== 'normal').map(r => ({
      timestamp: r.timestamp,
      sensor_id: r.sensor_id,
      sensor_type: r.sensor_type,
      value: r.value,
      expected_range: `${r.min_normal} - ${r.max_normal}`,
      severity: r.status === 'critical' ? 'critical' : 'warning',
      description: `${r.sensor_name} was ${r.status}`
    }));

    // Create report
    const report = await base44.asServiceRole.entities.IoTAnalyticsReport.create({
      location_id,
      report_type,
      period_start,
      period_end,
      sensor_metrics: metrics,
      anomalies_detected: anomalies,
      correlations,
      summary: aiSummary,
      recommendations: [
        metrics.some(m => m.out_of_range_count > 5) ? 'Schedule maintenance check for out-of-range readings' : null,
        anomalies.length > 10 ? 'High anomaly rate detected - investigate sensor calibration' : null,
        'Continue regular monitoring schedule'
      ].filter(Boolean),
      generated_at: new Date().toISOString(),
      generated_by: 'automated'
    });

    console.log(`Analytics report generated for location ${location_id}`);

    return Response.json({ 
      success: true, 
      report_id: report.id,
      metrics_count: metrics.length,
      anomalies_count: anomalies.length
    });
  } catch (error) {
    console.error('Analytics generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});