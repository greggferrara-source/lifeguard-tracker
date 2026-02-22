import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, AlertTriangle, TrendingUp, Loader, RefreshCw, CheckCircle2 } from "lucide-react";

export default function IncidentAIInsights({ locationId }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await base44.functions.invoke('analyzeIncidents', {
        location_id: locationId,
        days: 30
      });
      setInsights(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[level] || colors.medium;
  };

  const getRiskIcon = (level) => {
    if (level === 'critical') return <AlertTriangle className="w-5 h-5" />;
    if (level === 'high') return <TrendingUp className="w-5 h-5" />;
    return <Lightbulb className="w-5 h-5" />;
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            AI Incident Analysis
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? <Loader className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            Analyze
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {insights ? (
          <>
            {/* Risk Level */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Overall Risk Level</span>
                <Badge className={getRiskColor(insights.overall_risk_level)}>
                  {getRiskIcon(insights.overall_risk_level)}
                  <span className="ml-1">{insights.overall_risk_level.toUpperCase()}</span>
                </Badge>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    insights.overall_risk_level === 'critical'
                      ? 'bg-red-500'
                      : insights.overall_risk_level === 'high'
                      ? 'bg-orange-500'
                      : insights.overall_risk_level === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${insights.confidence_score}%`
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">Confidence: {insights.confidence_score}%</p>
            </div>

            {/* Common Causes */}
            {insights.common_causes && insights.common_causes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Common Causes</h4>
                <ul className="space-y-1">
                  {insights.common_causes.map((cause, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-blue-600">•</span>
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Trends */}
            {insights.risk_trends && insights.risk_trends.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Risk Trends</h4>
                <div className="space-y-2">
                  {insights.risk_trends.map((trend, idx) => (
                    <div key={idx} className={`p-2 rounded ${trend.severity === 'critical' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                      <p className="text-sm font-medium text-gray-900">{trend.trend}</p>
                      <p className="text-xs text-gray-600">{trend.affected_incidents} incident{trend.affected_incidents !== 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preventative Measures */}
            {insights.preventative_measures && insights.preventative_measures.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Preventative Measures</h4>
                <ul className="space-y-1">
                  {insights.preventative_measures.map((measure, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {measure}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommended Actions</h4>
                <div className="space-y-2">
                  {insights.recommendations.slice(0, 3).map((rec, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{rec.action}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{rec.priority}</Badge>
                        <Badge variant="outline" className="text-xs">{rec.effort}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Click "Analyze" to use AI to identify patterns and trends in your incidents</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}