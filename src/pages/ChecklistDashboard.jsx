import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2, XCircle, AlertTriangle, Plus, ClipboardList,
  FlaskConical, Wrench, Eye, Pencil, Trash2, BarChart2
} from "lucide-react";
import { format, subDays, isWithinInterval, parseISO } from "date-fns";
import ChecklistTemplateDialog from "@/components/checklists/ChecklistTemplateDialog";
import SubmitChecklistDialog from "@/components/checklists/SubmitChecklistDialog";
import AuditLogDrawer from "@/components/checklists/AuditLogDrawer";

const typeColors = {
  chemical: "bg-blue-100 text-blue-800",
  equipment: "bg-purple-100 text-purple-800",
  safety: "bg-orange-100 text-orange-800",
  opening: "bg-green-100 text-green-800",
  closing: "bg-gray-100 text-gray-800"
};

const typeIcons = {
  chemical: FlaskConical,
  equipment: Wrench,
  safety: AlertTriangle,
  opening: CheckCircle2,
  closing: ClipboardList
};

const statusColors = { pass: "bg-green-100 text-green-700", warning: "bg-yellow-100 text-yellow-700", fail: "bg-red-100 text-red-700" };

export default function ChecklistDashboard() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("overview"); // overview | templates | audit
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [submitDialog, setSubmitDialog] = useState(null);
  const [auditDrawer, setAuditDrawer] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: templates = [] } = useQuery({ queryKey: ["checklist-templates"], queryFn: () => base44.entities.ChecklistTemplate.list("-created_date", 100) });
  const { data: submissions = [] } = useQuery({ queryKey: ["checklist-submissions"], queryFn: () => base44.entities.ChecklistSubmission.list("-created_date", 200) });

  const deleteTemplate = useMutation({
    mutationFn: (id) => base44.entities.ChecklistTemplate.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist-templates"] })
  });

  const cutoff = subDays(new Date(), parseInt(dateRange));
  const recentSubmissions = submissions.filter(s => {
    try { return parseISO(s.date) >= cutoff; } catch { return false; }
  });

  const filteredSubmissions = typeFilter === "all" ? recentSubmissions : recentSubmissions.filter(s => s.type === typeFilter);
  const filteredTemplates = typeFilter === "all" ? templates : templates.filter(t => t.type === typeFilter);

  // KPIs
  const total = filteredSubmissions.length;
  const passed = filteredSubmissions.filter(s => s.status === "pass").length;
  const warnings = filteredSubmissions.filter(s => s.status === "warning").length;
  const failed = filteredSubmissions.filter(s => s.status === "fail").length;
  const complianceRate = total > 0 ? Math.round((passed / total) * 100) : null;

  const activeTemplates = templates.filter(t => t.is_active);

  const kpis = [
    { label: "Compliance Rate", value: complianceRate !== null ? `${complianceRate}%` : "—", color: complianceRate >= 90 ? "text-green-600" : complianceRate >= 70 ? "text-yellow-600" : "text-red-600", sub: `Last ${dateRange} days` },
    { label: "Submissions", value: total, color: "text-blue-600", sub: `Last ${dateRange} days` },
    { label: "Warnings", value: warnings, color: "text-yellow-600", sub: "Need review" },
    { label: "Failures", value: failed, color: "text-red-600", sub: "Action required" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checklist Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Track chemical & equipment compliance in real time</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setEditTemplate(null); setTemplateDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" />New Template
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {[{ id: "overview", label: "Overview" }, { id: "templates", label: "Templates" }, { id: "audit", label: "Audit Log" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? "border-[#1a9c5b] text-[#1a9c5b]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="chemical">Chemical</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="opening">Opening</SelectItem>
            <SelectItem value="closing">Closing</SelectItem>
          </SelectContent>
        </Select>
        {tab !== "templates" && (
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map(k => (
              <Card key={k.label}>
                <CardContent className="p-5">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{k.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Active Templates (quick submit) */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">Active Checklists — Submit</h2>
            {activeTemplates.length === 0 ? (
              <div className="text-center py-10 text-gray-400 border border-dashed rounded-xl">
                <ClipboardList className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No templates yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTemplates.filter(t => typeFilter === "all" || t.type === typeFilter).map(t => {
                  const Icon = typeIcons[t.type] || ClipboardList;
                  const todayStr = format(new Date(), "yyyy-MM-dd");
                  const todaySubmission = submissions.find(s => s.template_id === t.id && s.date === todayStr);
                  return (
                    <Card key={t.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Icon className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                              <p className="text-xs text-gray-400">{t.location_name || "All locations"}</p>
                            </div>
                          </div>
                          <Badge className={typeColors[t.type]}>{t.type}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{t.items?.length || 0} items · {t.frequency}</span>
                          {todaySubmission ? (
                            <Badge className={statusColors[todaySubmission.status]}>
                              {todaySubmission.status === "pass" ? "✓ Done" : todaySubmission.status}
                            </Badge>
                          ) : (
                            <Button size="sm" onClick={() => setSubmitDialog(t)}>Submit</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Submissions */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">Recent Submissions</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Checklist", "Type", "Submitted By", "Date", "Score", "Status", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubmissions.slice(0, 20).map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.template_name}</td>
                      <td className="px-4 py-3"><Badge className={typeColors[s.type]}>{s.type}</Badge></td>
                      <td className="px-4 py-3 text-gray-600">{s.submitted_by_name || s.submitted_by_email || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{s.date} {s.time}</td>
                      <td className="px-4 py-3 text-gray-600">{s.items_passed}/{s.items_total}</td>
                      <td className="px-4 py-3"><Badge className={statusColors[s.status]}>{s.status}</Badge></td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" onClick={() => setAuditDrawer(s)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredSubmissions.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No submissions found for selected filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATES TAB */}
      {tab === "templates" && (
        <div className="space-y-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-16 text-gray-400 border border-dashed rounded-xl">
              <ClipboardList className="w-10 h-10 mx-auto mb-2" />
              <p>No templates yet. Click "New Template" to create one.</p>
            </div>
          ) : (
            filteredTemplates.map(t => {
              const Icon = typeIcons[t.type] || ClipboardList;
              return (
                <div key={t.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.items?.length || 0} items · {t.frequency} · {t.location_name || "All locations"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={typeColors[t.type]}>{t.type}</Badge>
                    <Button size="sm" variant="outline" onClick={() => setSubmitDialog(t)}>Submit</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditTemplate(t); setTemplateDialogOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600" onClick={() => deleteTemplate.mutate(t.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {tab === "audit" && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Checklist", "Type", "Location", "Submitted By", "Date & Time", "Score", "Status", "Audit"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubmissions.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.template_name}</td>
                  <td className="px-4 py-3"><Badge className={typeColors[s.type]}>{s.type}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{s.location_name || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{s.submitted_by_name || s.submitted_by_email || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{s.date} {s.time}</td>
                  <td className="px-4 py-3 text-gray-600">{s.items_passed}/{s.items_total}</td>
                  <td className="px-4 py-3"><Badge className={statusColors[s.status]}>{s.status}</Badge></td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" onClick={() => setAuditDrawer(s)}>
                      <Eye className="w-4 h-4 mr-1" />View
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredSubmissions.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No submissions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialogs */}
      <ChecklistTemplateDialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen} template={editTemplate} />
      <SubmitChecklistDialog open={!!submitDialog} onOpenChange={() => setSubmitDialog(null)} template={submitDialog} user={user} />
      <AuditLogDrawer open={!!auditDrawer} onOpenChange={() => setAuditDrawer(null)} submission={auditDrawer} />
    </div>
  );
}