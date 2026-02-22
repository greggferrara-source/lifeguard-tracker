import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle2, Lightbulb, Zap, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ComplianceAIAdvisor() {
  const qc = useQueryClient();
  const [showAnalyzeDialog, setShowAnalyzeDialog] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState("");
  const [acknowledgedOnly, setAcknowledgedOnly] = useState(false);

  const { data: insights = [] } = useQuery({
    queryKey: ["compliance-ai-insights"],
    queryFn: () => base44.entities.ComplianceAIInsight.list("-generated_at")
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list()
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list()
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: () => base44.entities.Asset.list()
  });

  const { data: testLogs = [] } = useQuery({
    queryKey: ["pool-test-logs"],
    queryFn: () => base44.entities.PoolTestLog.list()
  });

  const { data: gaps = [] } = useQuery({
    queryKey: ["compliance-gaps"],
    queryFn: () => base44.entities.ComplianceGap.list()
  });

  const unacknowledgedInsights = insights.filter(i => !i.acknowledged);
  const criticalInsights = insights.filter(i => i.severity === "critical" && !i.acknowledged);

  const filtered = (acknowledgedOnly ? insights.filter(i => i.acknowledged) : unacknowledgedInsights).filter(i => !filterSeverity || i.severity === filterSeverity);

  const acknowledge = useMutation({
    mutationFn: (insightId) => base44.entities.ComplianceAIInsight.update(insightId, { acknowledged: true, acknowledged_by: "current@user.com" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compliance-ai-insights"] })
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl font-bold">Compliance AI Advisor</h1>
        </div>
        <Button onClick={() => setShowAnalyzeDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Zap className="w-4 h-4 mr-2" />
          Run AI Analysis
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{criticalInsights.length}</div>
            <p className="text-xs text-red-700 mt-1">Require immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{unacknowledgedInsights.length}</div>
            <p className="text-xs text-amber-700 mt-1">Unacknowledged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Acknowledged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{insights.filter(i => i.acknowledged).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Avg Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {insights.length > 0 ? (insights.reduce((sum, i) => sum + (i.confidence_score || 0), 0) / insights.length).toFixed(0) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end flex-wrap">
        <div>
          <label className="text-sm font-medium block mb-2">Severity</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings & Critical</option>
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={acknowledgedOnly}
            onChange={(e) => setAcknowledgedOnly(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Show Only Acknowledged</span>
        </label>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="bg-green-50">
            <CardContent className="pt-8 pb-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-green-700 font-medium">{acknowledgedOnly ? "No acknowledged insights" : "All critical issues have been addressed!"}</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onAcknowledge={() => acknowledge.mutate(insight.id)}
            />
          ))
        )}
      </div>

      {/* Analysis Dialog */}
      <AnalyzeDialog
        open={showAnalyzeDialog}
        onOpenChange={setShowAnalyzeDialog}
        locations={locations}
        employees={employees}
        assets={assets}
        testLogs={testLogs}
        gaps={gaps}
      />
    </div>
  );
}

function InsightCard({ insight, onAcknowledge }) {
  const severityConfig = {
    critical: { icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50", badgeColor: "bg-red-100 text-red-700", borderColor: "border-l-red-500" },
    warning: { icon: AlertTriangle, color: "text-orange-600", bgColor: "bg-orange-50", badgeColor: "bg-orange-100 text-orange-700", borderColor: "border-l-orange-500" },
    info: { icon: Lightbulb, color: "text-blue-600", bgColor: "bg-blue-50", badgeColor: "bg-blue-100 text-blue-700", borderColor: "border-l-blue-500" }
  };

  const config = severityConfig[insight.severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <Card className={`border-l-4 ${config.borderColor} ${config.bgColor}`}>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <p className="font-bold text-lg">{insight.title}</p>
                <p className="text-sm text-gray-700 mt-1">{insight.description}</p>

                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className={config.badgeColor}>{insight.severity}</Badge>
                  <Badge className="bg-gray-100 text-gray-700">{insight.relevant_regulation}</Badge>
                  <Badge className="bg-purple-100 text-purple-700">Confidence: {insight.confidence_score}%</Badge>
                </div>

                {insight.affected_modules && insight.affected_modules.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Affected Modules:</p>
                    <div className="flex flex-wrap gap-1">
                      {insight.affected_modules.map(module => (
                        <Badge key={module} variant="outline" className="text-xs">{module}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {insight.acknowledged ? (
              <Badge className="bg-green-100 text-green-700 flex-shrink-0">Acknowledged</Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={onAcknowledge}>
                Acknowledge
              </Button>
            )}
          </div>

          {insight.recommended_actions && insight.recommended_actions.length > 0 && (
            <div className="border-t pt-3 bg-white bg-opacity-50 p-3 rounded">
              <p className="text-sm font-semibold mb-2 text-gray-700">Recommended Actions:</p>
              <div className="space-y-2">
                {insight.recommended_actions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{action.action}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{action.priority}</Badge>
                        <span className="text-xs text-gray-500">{action.estimated_effort}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insight.action_taken && (
            <div className="border-t pt-2 text-sm">
              <p className="font-semibold text-green-700">✓ Action Taken:</p>
              <p className="text-gray-700 mt-1">{insight.action_taken}</p>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Generated {format(parseISO(insight.generated_at), "MMM d, yyyy h:mm a")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyzeDialog({ open, onOpenChange, locations, employees, assets, testLogs, gaps }) {
  const qc = useQueryClient();
  const [selectedLocation, setSelectedLocation] = React.useState("");
  const [analysisScope, setAnalysisScope] = React.useState("all");

  const analyze = useMutation({
    mutationFn: async () => {
      // Call AI to analyze compliance data
      const locationFilter = selectedLocation ? locations.find(l => l.id === selectedLocation) : null;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a compliance expert analyzing aquatic facility operations for regulatory violations. Analyze the following data and identify potential compliance gaps:

Location: ${locationFilter?.name || "All Locations"}
Analysis Scope: ${analysisScope}

Current Data Summary:
- Total Assets: ${assets.length}
- Total Employees: ${employees.length}
- Pool Tests (last 30 days): ${testLogs.length}
- Open Compliance Gaps: ${gaps.length}

Please identify:
1. Potential OSHA violations
2. Potential MAHC (Model Aquatic Health Code) violations
3. Common compliance gap patterns
4. Risk predictions based on trends
5. Actionable recommendations for each issue

Format as JSON with fields: insight_type, severity (critical/warning/info), title, description, affected_modules, relevant_regulation, confidence_score (0-100), recommended_actions[]`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string" },
                  affected_modules: { type: "array", items: { type: "string" } },
                  relevant_regulation: { type: "string" },
                  confidence_score: { type: "number" },
                  recommended_actions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string" },
                        priority: { type: "string" },
                        estimated_effort: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Save insights to database
      if (response.data?.insights) {
        for (const insight of response.data.insights) {
          await base44.entities.ComplianceAIInsight.create({
            location_id: selectedLocation || "",
            location_name: locationFilter?.name || "All Locations",
            insight_type: "potential_violation",
            severity: insight.severity,
            title: insight.title,
            description: insight.description,
            affected_modules: insight.affected_modules || [],
            relevant_regulation: insight.relevant_regulation,
            recommended_actions: insight.recommended_actions || [],
            confidence_score: insight.confidence_score,
            generated_at: new Date().toISOString(),
            acknowledged: false
          });
        }
      }

      return response;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["compliance-ai-insights"] });
      onOpenChange(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    analyze.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Run Compliance AI Analysis</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            The AI will analyze your current facility data and identify potential compliance violations against OSHA, MAHC, and ANSI standards.
          </p>

          <div>
            <label className="text-sm font-medium block mb-1">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Analysis Scope</label>
            <select
              value={analysisScope}
              onChange={(e) => setAnalysisScope(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Modules</option>
              <option value="employee_management">Employee Management Only</option>
              <option value="asset_management">Asset Management Only</option>
              <option value="pool_testing">Pool Testing Only</option>
              <option value="compliance">Compliance Only</option>
            </select>
          </div>

          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> This analysis may take up to 30 seconds. The AI will review your current data and generate specific compliance recommendations.
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={analyze.isPending}>
              {analyze.isPending ? "Analyzing..." : "Start Analysis"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}