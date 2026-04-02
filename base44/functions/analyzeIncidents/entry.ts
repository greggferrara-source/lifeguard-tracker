import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { location_id, days = 30 } = await req.json();

    // Fetch recent incidents
    const incidents = await base44.asServiceRole.entities.IncidentLog.filter({
      location_id: location_id
    });

    if (incidents.length === 0) {
      return Response.json({ insights: [] });
    }

    // Prepare incident summary for LLM
    const incidentSummary = incidents.slice(0, 50).map(i => ({
      type: i.type,
      severity: i.severity,
      description: i.description,
      location: i.location_name,
      date: i.date
    }));

    // Use LLM to analyze patterns
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the following aquatic facility incidents and provide:
1. Common causes or patterns
2. High-risk trends that should be flagged
3. Specific preventative measures to reduce future incidents
4. Risk level assessment (low, medium, high, critical)

Incidents:
${JSON.stringify(incidentSummary, null, 2)}

Return a JSON response with:
{
  "common_causes": [string],
  "risk_trends": [{ trend: string, severity: "warning|critical", affected_incidents: number }],
  "preventative_measures": [string],
  "overall_risk_level": "low|medium|high|critical",
  "confidence_score": number (0-100),
  "recommendations": [{ action: string, priority: "immediate|short_term|long_term", effort: string }]
}`,
      response_json_schema: {
        type: "object",
        properties: {
          common_causes: { type: "array", items: { type: "string" } },
          risk_trends: {
            type: "array",
            items: {
              type: "object",
              properties: {
                trend: { type: "string" },
                severity: { type: "string" },
                affected_incidents: { type: "number" }
              }
            }
          },
          preventative_measures: { type: "array", items: { type: "string" } },
          overall_risk_level: { type: "string" },
          confidence_score: { type: "number" },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string" },
                effort: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Save AI insight
    const insight = await base44.asServiceRole.entities.ComplianceAIInsight.create({
      location_id: location_id,
      location_name: incidents[0]?.location_name || "Unknown",
      insight_type: "trend_alert",
      severity: analysis.overall_risk_level === "critical" ? "critical" : 
               analysis.overall_risk_level === "high" ? "warning" : "info",
      title: `Incident Pattern Analysis - ${analysis.overall_risk_level} Risk Level`,
      description: `Analysis of recent incidents identified common causes and preventative measures.`,
      affected_modules: ["IncidentManagement"],
      relevant_regulation: "Safety Best Practices",
      data_analyzed: {
        incident_count: incidents.length,
        analysis: analysis
      },
      recommended_actions: analysis.recommendations || [],
      confidence_score: analysis.confidence_score,
      generated_at: new Date().toISOString()
    });

    return Response.json({ 
      insight: insight,
      analysis: analysis 
    });
  } catch (error) {
    console.error('Incident analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});