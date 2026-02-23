import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Clock, Users, ChevronRight, Plus, Zap } from "lucide-react";
import { format, parse } from "date-fns";

export default function ComplianceWorkflowManager() {
  const [filter, setFilter] = useState("active");
  const qc = useQueryClient();

  const { data: workflows = [] } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => base44.entities.ComplianceWorkflow.list("-created_at", 100)
  });

  const { data: risks = [] } = useQuery({
    queryKey: ["compliance-gaps"],
    queryFn: () => base44.entities.ComplianceGap.list("-risk_score", 50)
  });

  const createWorkflowFromRisk = useMutation({
    mutationFn: async (risk) => {
      return base44.entities.ComplianceWorkflow.create({
        title: `Remediate: ${risk.violation_type}`,
        description: `Address ${risk.violation_type} at ${risk.location_name}`,
        category: "violation_remediation",
        trigger_type: "compliance_risk",
        status: "active",
        priority: risk.risk_score > 80 ? "critical" : risk.risk_score > 60 ? "high" : "medium",
        compliance_gap_id: risk.id,
        location_id: risk.location_id,
        location_name: risk.location_name,
        due_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] })
  });

  const filteredWorkflows = workflows.filter(w => {
    if (filter === "active") return w.status === "active";
    if (filter === "completed") return w.status === "completed";
    return true;
  });

  const unaddressedRisks = risks.filter(r => !workflows.find(w => w.compliance_gap_id === r.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Compliance Workflows</h1>
        <p className="text-gray-500 mt-1">Guided step-by-step instructions for compliance tasks</p>
      </div>

      {/* Risk-Based Workflow Suggestions */}
      {unaddressedRisks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Zap className="w-5 h-5" />
              Recommended Workflows Based on Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unaddressedRisks.slice(0, 5).map(risk => (
              <div key={risk.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-orange-100">
                <div>
                  <p className="font-medium text-gray-900">{risk.violation_type}</p>
                  <p className="text-sm text-gray-600">{risk.location_name} • Risk Score: {risk.risk_score}%</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => createWorkflowFromRisk.mutate(risk)}
                  disabled={createWorkflowFromRisk.isPending}
                  className="bg-[#1a9c5b] hover:bg-[#158a4e]"
                >
                  Create Workflow
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-3">
        {[
          { id: "active", label: "Active" },
          { id: "completed", label: "Completed" },
          { id: "all", label: "All" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === tab.id
                ? 'bg-[#1a9c5b] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.map(workflow => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{workflow.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{workflow.location_name}</p>
                </div>
                <Badge className={
                  workflow.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  workflow.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }>
                  {workflow.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Progress</span>
                  <span className="text-xs font-bold text-gray-900">{workflow.progress_percentage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1a9c5b] transition-all"
                    style={{ width: `${workflow.progress_percentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  Due: {format(parse(workflow.due_date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="w-4 h-4" />
                  {workflow.steps_completed}/{workflow.total_steps} steps
                </div>
              </div>

              <Button className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] flex items-center justify-center gap-1">
                View Workflow
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkflows.length === 0 && (
        <Card>
          <CardContent className="pt-12 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No {filter} workflows found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}