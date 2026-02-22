import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Plus, AlertTriangle, CheckCircle2, FileText, Zap, TrendingUp, Clock, MapPin, Award } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ComplianceAssessmentManager() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("dashboard");
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const { data: assessments = [] } = useQuery({
    queryKey: ["compliance-assessments"],
    queryFn: () => base44.entities.ComplianceAssessment.list("-completed_date")
  });

  const { data: gaps = [] } = useQuery({
    queryKey: ["compliance-gaps"],
    queryFn: () => base44.entities.ComplianceGap.list("-assigned_date")
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list()
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["compliance-resources"],
    queryFn: () => base44.entities.ComplianceResource.list()
  });

  const openGaps = gaps.filter(g => g.status !== "verified");
  const criticalGaps = gaps.filter(g => g.severity === "critical" && g.status !== "verified");
  const recentAssessments = assessments.slice(0, 10);

  // Multi-site comparison
  const locationComparison = locations.map(loc => {
    const locAssessments = assessments.filter(a => a.location_id === loc.id);
    const avgScore = locAssessments.length > 0 
      ? (locAssessments.reduce((sum, a) => sum + (a.overall_score || 0), 0) / locAssessments.length).toFixed(1)
      : 0;
    const locGaps = gaps.filter(g => g.location_id === loc.id && g.status !== "verified");
    return {
      location: loc.name,
      score: Number(avgScore),
      openGaps: locGaps.length,
      critical: locGaps.filter(g => g.severity === "critical").length
    };
  }).filter(c => c.score > 0 || c.openGaps > 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Compliance Assessment Manager</h1>
        <Button onClick={() => setShowAssessmentDialog(true)} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
          <Plus className="w-4 h-4 mr-2" />
          Start New Assessment
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assessments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Critical Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{criticalGaps.length}</div>
            <p className="text-xs text-red-700 mt-1">Immediate action required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Open Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{openGaps.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {assessments.length > 0 ? (assessments.reduce((sum, a) => sum + (a.overall_score || 0), 0) / assessments.length).toFixed(1) : "—"}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {[
          { id: "dashboard", label: "Dashboard" },
          { id: "assessments", label: "Assessments" },
          { id: "gaps", label: `Gap Tasks (${openGaps.length})` },
          { id: "resources", label: "Resources & Guidance" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? "border-[#1a9c5b] text-[#1a9c5b]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "dashboard" && <DashboardTab assessments={recentAssessments} gaps={gaps} locationComparison={locationComparison} />}
      {tab === "assessments" && <AssessmentsTab assessments={assessments} locations={locations} />}
      {tab === "gaps" && <GapTasksTab gaps={openGaps} />}
      {tab === "resources" && <ResourcesTab resources={resources} />}

      {/* Dialogs */}
      <AssessmentDialog open={showAssessmentDialog} onOpenChange={setShowAssessmentDialog} locations={locations} />
    </div>
  );
}

function DashboardTab({ assessments, gaps, locationComparison }) {
  return (
    <div className="space-y-4">
      {locationComparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Multi-Site Compliance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {locationComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={locationComparison}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="location" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Compliance Score" dataKey="score" stroke="#1a9c5b" fill="#1a9c5b" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No assessment data available</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Location Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {locationComparison.map((loc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{loc.location}</p>
                  <p className="text-sm text-gray-600">{loc.openGaps} open gaps • {loc.critical} critical</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#1a9c5b]">{loc.score}%</div>
                  <p className="text-xs text-gray-600">Compliant</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {assessments.slice(0, 5).map(assessment => (
              <div key={assessment.id} className="flex items-center justify-between p-2 border-b pb-2">
                <div>
                  <p className="font-medium">{assessment.title}</p>
                  <p className="text-sm text-gray-600">{assessment.location_name} • {assessment.assessment_type}</p>
                </div>
                <Badge className={assessment.overall_score >= 80 ? "bg-green-100 text-green-700" : assessment.overall_score >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}>
                  {assessment.overall_score}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AssessmentsTab({ assessments, locations }) {
  const [search, setSearch] = React.useState("");

  const filtered = assessments.filter(a =>
    a.location_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search assessments..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <div className="space-y-2">
        {filtered.map(assessment => (
          <Card key={assessment.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold text-lg">{assessment.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{assessment.location_name}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{assessment.assessment_type}</Badge>
                    <Badge className={assessment.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
                      {assessment.status}
                    </Badge>
                  </div>
                  {assessment.gap_summary && (
                    <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">{assessment.gap_summary}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold" style={{color: assessment.overall_score >= 80 ? "#10b981" : assessment.overall_score >= 60 ? "#f59e0b" : "#ef4444"}}>
                    {assessment.overall_score}%
                  </div>
                  {assessment.next_retest_date && (
                    <p className="text-xs text-gray-600 mt-2">Retest: {assessment.next_retest_date}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GapTasksTab({ gaps }) {
  const criticalGaps = gaps.filter(g => g.severity === "critical");
  const otherGaps = gaps.filter(g => g.severity !== "critical");

  const severityColor = (sev) => {
    switch(sev) {
      case "critical": return "bg-red-100 text-red-700 border-red-300";
      case "high": return "bg-orange-100 text-orange-700 border-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default: return "bg-blue-100 text-blue-700 border-blue-300";
    }
  };

  return (
    <div className="space-y-4">
      {criticalGaps.length > 0 && (
        <div>
          <h3 className="font-bold text-red-700 mb-2">🚨 Critical Gaps - Immediate Action Required</h3>
          <div className="space-y-2">
            {criticalGaps.map(gap => (
              <Card key={gap.id} className={`border-l-4 border-red-500 ${severityColor("critical")}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold">{gap.gap_description}</p>
                      <p className="text-sm mt-1">Standard: {gap.standard_reference}</p>
                      <p className="text-sm mt-1">Assigned to: {gap.assigned_to_name}</p>
                      {gap.due_date && <p className="text-sm text-red-700 font-semibold">Due: {gap.due_date}</p>}
                    </div>
                    <Badge className={severityColor("critical")}>{gap.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {otherGaps.length > 0 && (
        <div>
          <h3 className="font-bold mb-2">Other Open Gaps ({otherGaps.length})</h3>
          <div className="space-y-2">
            {otherGaps.map(gap => (
              <Card key={gap.id} className="border-l-4" style={{borderLeftColor: gap.severity === "high" ? "#f97316" : gap.severity === "medium" ? "#eab308" : "#3b82f6"}}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{gap.gap_description}</p>
                      <p className="text-sm text-gray-600 mt-1">Assigned to: {gap.assigned_to_name} | Due: {gap.due_date}</p>
                    </div>
                    <Badge variant="outline">{gap.severity}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {gaps.length === 0 && (
        <Card className="bg-green-50">
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-700 font-medium">All gaps have been verified and closed!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResourcesTab({ resources }) {
  const [selectedCategory, setSelectedCategory] = React.useState("");

  const filtered = selectedCategory 
    ? resources.filter(r => r.category === selectedCategory)
    : resources;

  const categories = [...new Set(resources.map(r => r.category))];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">Filter by Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(resource => (
          <Card key={resource.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold">{resource.title}</p>
                    <Badge variant="outline">{resource.resource_type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{resource.category}</p>
                  {resource.standard_reference && (
                    <p className="text-xs text-gray-500 mt-1">Standard: {resource.standard_reference}</p>
                  )}
                  {resource.content && (
                    <p className="text-sm mt-2 text-gray-700">{resource.content.substring(0, 200)}...</p>
                  )}
                </div>
                {resource.file_url && (
                  <Button variant="outline" size="sm">Download</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AssessmentDialog({ open, onOpenChange, locations }) {
  const qc = useQueryClient();
  const [locationId, setLocationId] = React.useState("");
  const [assessmentType, setAssessmentType] = React.useState("facility_maintenance");
  const [title, setTitle] = React.useState("");

  const create = useMutation({
    mutationFn: (data) => base44.entities.ComplianceAssessment.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["compliance-assessments"] });
      onOpenChange(false);
      setTitle("");
      setLocationId("");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!locationId || !title) {
      alert("Please fill required fields");
      return;
    }

    const location = locations.find(l => l.id === locationId);
    create.mutate({
      location_id: locationId,
      location_name: location?.name,
      assessment_type: assessmentType,
      title,
      status: "in_progress",
      started_date: format(new Date(), "yyyy-MM-dd"),
      overall_score: 0,
      questions: []
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Start New Compliance Assessment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Location *</label>
            <select
              required
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">Select location...</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Assessment Type *</label>
            <select
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="facility_maintenance">Facility Maintenance</option>
              <option value="daily_operations">Daily Operations</option>
              <option value="risk_management">Risk Management</option>
              <option value="staff_training">Staff Training</option>
              <option value="safety_team">Safety Team</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Title *</label>
            <Input
              required
              placeholder="e.g., Q1 2026 Compliance Assessment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={create.isPending}>
              {create.isPending ? "Starting..." : "Start Assessment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}