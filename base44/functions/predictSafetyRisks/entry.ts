import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Predict safety risks based on incident history, IoT data, and staffing
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { location_id } = await req.json();

    // Get recent incidents
    const incidents = await base44.asServiceRole.entities.IncidentReport.filter({
      location_id
    });

    // Get current staff
    const employees = await base44.asServiceRole.entities.Employee.filter({
      location_id
    });

    // Get recent IoT sensor readings
    const readings = await base44.asServiceRole.entities.IoTSensorReading.filter({
      location_id
    });

    // Get recent alerts
    const alerts = await base44.asServiceRole.entities.IoTSensorAlert.filter({
      location_id
    });

    // Calculate risk factors
    const riskFactors = [];

    // 1. Incident frequency
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentIncidents = incidents.filter(i => new Date(i.created_at) > thirtyDaysAgo);
    if (recentIncidents.length > 3) {
      riskFactors.push({
        factor: 'High incident frequency',
        impact: Math.min(recentIncidents.length * 10, 100),
        description: `${recentIncidents.length} incidents in last 30 days`
      });
    }

    // 2. Critical incidents
    const criticalIncidents = recentIncidents.filter(i => i.severity === 'critical');
    if (criticalIncidents.length > 0) {
      riskFactors.push({
        factor: 'Recent critical incidents',
        impact: 85,
        description: `${criticalIncidents.length} critical incidents`
      });
    }

    // 3. Staffing levels
    const minStaffRatio = 0.05; // 1 guard per 20 patrons (estimate)
    if (employees.length < 2) {
      riskFactors.push({
        factor: 'Low staffing level',
        impact: 70,
        description: 'Less than 2 guards on staff'
      });
    }

    // 4. Water quality issues
    const recentAlerts = alerts.filter(a => new Date(a.triggered_at) > thirtyDaysAgo);
    if (recentAlerts.length > 5) {
      riskFactors.push({
        factor: 'Water quality alerts',
        impact: Math.min(recentAlerts.length * 8, 80),
        description: `${recentAlerts.length} sensor alerts in last 30 days`
      });
    }

    // 5. Sensor anomalies
    const criticalReadings = readings.filter(r => r.status === 'critical').slice(-10);
    if (criticalReadings.length > 2) {
      riskFactors.push({
        factor: 'Critical sensor readings',
        impact: 75,
        description: `${criticalReadings.length} critical readings`
      });
    }

    // Calculate overall risk level
    const avgRiskImpact = riskFactors.reduce((sum, f) => sum + f.impact, 0) / Math.max(riskFactors.length, 1);
    let incidentRiskLevel = 'low';
    if (avgRiskImpact >= 70) incidentRiskLevel = 'critical';
    else if (avgRiskImpact >= 50) incidentRiskLevel = 'high';
    else if (avgRiskImpact >= 30) incidentRiskLevel = 'moderate';

    // Predict incident types based on history
    const predictedIncidentTypes = [];
    const incidentTypeCounts = {};
    recentIncidents.forEach(i => {
      incidentTypeCounts[i.incident_type] = (incidentTypeCounts[i.incident_type] || 0) + 1;
    });
    Object.entries(incidentTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .forEach(([type]) => predictedIncidentTypes.push(type));

    // Training gaps
    const trainingGaps = [];
    if (criticalIncidents.length > 0) trainingGaps.push('Advanced rescue procedures');
    if (recentAlerts.length > 5) trainingGaps.push('Water quality testing and response');
    if (employees.length < 3) trainingGaps.push('First aid and CPR refresher');

    // Staffing recommendation
    const baseHeadcount = Math.max(2, Math.ceil(employees.length * 1.2));
    const recommendedHeadcount = recentIncidents.length > 5 ? baseHeadcount + 2 : baseHeadcount;

    // Create prediction
    const prediction = await base44.asServiceRole.entities.SafetyPrediction.create({
      location_id,
      prediction_date: new Date().toISOString().split('T')[0],
      incident_risk_level: incidentRiskLevel,
      risk_factors: riskFactors,
      predicted_incident_types: predictedIncidentTypes,
      staffing_recommendation: {
        recommended_headcount: recommendedHeadcount,
        current_headcount: employees.length,
        shortage: Math.max(0, recommendedHeadcount - employees.length),
        reasoning: `Based on ${recentIncidents.length} recent incidents and staffing analysis`
      },
      training_gaps_identified: trainingGaps,
      recommended_actions: [
        incidentRiskLevel === 'critical' ? 'Implement immediate safety review' : null,
        recentAlerts.length > 5 ? 'Schedule water quality training' : null,
        employees.length < recommendedHeadcount ? 'Recruit additional staff' : null,
        predictedIncidentTypes.includes('drowning') ? 'Increase lifeguard rotation frequency' : null
      ].filter(Boolean),
      generated_at: new Date().toISOString(),
      accuracy_score: Math.min(95, 70 + riskFactors.length * 5)
    });

    console.log(`Safety prediction generated for location ${location_id}: ${incidentRiskLevel} risk`);

    return Response.json({ 
      success: true, 
      prediction_id: prediction.id,
      risk_level: incidentRiskLevel,
      risk_factors_count: riskFactors.length
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});