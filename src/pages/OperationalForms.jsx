import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Plus, FileText, ClipboardList, BarChart2, CheckCircle2,
  AlertTriangle, Pencil, Play, Search, TrendingUp, Trash2
} from "lucide-react";
import { format } from "date-fns";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import FormBuilderDialog from "@/components/operationalforms/FormBuilderDialog";
import SubmitFormDialog from "@/components/operationalforms/SubmitFormDialog";
import SubmissionDetailDrawer from "@/components/operationalforms/SubmissionDetailDrawer";

const STATUS_CONFIG = {
  pass: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", label: "Pass" },
  warning: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", label: "Warning" },
  fail: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", label: "Fail" },
};

const CATEGORY_COLORS = {
  vehicle: "bg-blue-100 text-blue-700",
  equipment: "bg-purple-100 text-purple-700",
  safety: "bg-green-100 text-green-700",
  training: "bg-yellow-100 text-yellow-700",
  patient: "bg-red-100 text-red-700",
  facility: "bg-orange-100 text-orange-700",
  other: "bg-gray-100 text-gray-600",
};

export default function OperationalForms() {
  const queryClient = useQueryClient();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [submitForm, setSubmitForm] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { data: forms = [] } = useQuery({ queryKey: ["op-forms"], queryFn: () => base44.entities.OperationalForm.list("-created_date", 100) });
  const { data: submissions = [] } = useQuery({ queryKey: ["op-submissions"], queryFn: () => base44.entities.OperationalFormSubmission.list("-date", 300), refetchInterval: 30000 });

  const isAdmin = ["admin", "site_owner", "enterprise_site_owner"].includes(user?.role);

  const deleteForm = useMutation({
    mutationFn: (id) => base44.entities.OperationalForm.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["op-forms"] }),
  });

  const activeForms = forms.filter(f => f.is_active);
  const filteredForms = activeForms.filter(f => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || f.category === filterCategory;
    return matchSearch && matchCat;
  });

  // Analytics: pass rate trend (last 7 days)
  const passRateTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const key = format(d, "yyyy-MM-dd");
      const daySubs = submissions.filter(s => s.date === key);
      const passed = daySubs.filter(s => s.status === "pass").length;
      const rate = daySubs.length > 0 ? Math.round((passed / daySubs.length) * 100) : null;
      return { day: format(d, "EEE"), rate, total: daySubs.length };
    });
  }, [submissions]);

  // Per-form stats
  const formStats = useMemo(() => {
    return forms.map(f => {
      const subs = submissions.filter(s => s.form_id === f.id);
      const passed = subs.filter(s => s.status === "pass").length;
      const failed = subs.filter(s => s.status === "fail").length;
      return { ...f, total: subs.length, passRate: subs.length > 0 ? Math.round((passed / subs.length) * 100) : null, failed };
    });
  }, [forms, submissions]);

  const todaySubmissions = submissions.filter(s => s.date === format(new Date(), "yyyy-MM-dd"));
  const alertSubmissions = submissions.filter(s => s.has_alerts).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operational Forms</h1>
          <p className="text-gray-500 mt-1">Custom checklists that track the data points you need</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditForm(null); setBuilderOpen(true); }} className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2">
            <Plus className="w-4 h-4" /> Create Form
          </Button>
        )}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Forms", value: activeForms.length, icon: FileText, color: "text-blue-600" },
          { label: "Today's Submissions", value: todaySubmissions.length, icon: ClipboardList, color: "text-green-600" },
          { label: "Alerts Triggered", value: alertSubmissions.length, icon: AlertTriangle, color: "text-orange-600" },
          { label: "Total Submissions", value: submissions.length, icon: BarChart2, color: "text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="forms">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* ── TAB: FORMS ── */}
        <TabsContent value="forms" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search forms..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm capitalize">
              <option value="all">All Categories</option>
              {["vehicle", "equipment", "safety", "training", "patient", "facility", "other"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {filteredForms.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No forms yet</p>
              {isAdmin && <p className="text-sm mt-1">Click "Create Form" to build your first checklist</p>}
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredForms.map(form => {
              const stats = formStats.find(s => s.id === form.id);
              return (
                <Card key={form.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm">{form.name}</h3>
                        {form.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{form.description}</p>}
                      </div>
                      <Badge className={`${CATEGORY_COLORS[form.category]} text-xs capitalize flex-shrink-0`}>{form.category}</Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span>{form.fields?.length || 0} fields</span>
                      {form.location_name && <span>· {form.location_name}</span>}
                      {stats?.total > 0 && <span>· {stats.passRate}% pass rate</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => setSubmitForm(form)} className="flex-1 bg-[#1a9c5b] hover:bg-[#158a4e] gap-1 text-xs">
                        <Play className="w-3.5 h-3.5" /> Submit
                      </Button>
                      {isAdmin && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => { setEditForm(form); setBuilderOpen(true); }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteForm.mutate(form.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── TAB: SUBMISSIONS ── */}
        <TabsContent value="submissions" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Recent Submissions</h2>
            <Badge variant="outline" className="text-xs">{submissions.length} total</Badge>
          </div>
          {submissions.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No submissions yet</p>
            </div>
          )}
          {submissions.slice(0, 50).map(sub => {
            const sc = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pass;
            return (
              <Card key={sub.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setSelectedSubmission(sub)}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{sub.form_name}</p>
                        <Badge className={`${sc.bg} ${sc.text} border ${sc.border} text-xs`}>{sc.label}</Badge>
                        {sub.has_alerts && <Badge className="bg-orange-100 text-orange-700 text-xs border border-orange-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Alert</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {sub.submitted_by_name || sub.submitted_by_email} · {sub.date}{sub.time ? ` · ${sub.time}` : ""}{sub.location_name ? ` · ${sub.location_name}` : ""}
                      </p>
                    </div>
                    {sub.status === "pass" && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
                    {sub.status === "fail" && <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* ── TAB: ANALYTICS ── */}
        <TabsContent value="analytics" className="space-y-6 mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pass Rate Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#1a9c5b]" /> 7-Day Pass Rate Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={passRateTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                    <Tooltip formatter={(v) => v != null ? `${v}%` : "No data"} />
                    <Line type="monotone" dataKey="rate" stroke="#1a9c5b" strokeWidth={2} dot={{ r: 4 }} name="Pass Rate" connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Per-form summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1a9c5b]" /> Form Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {formStats.filter(f => f.total > 0).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">Submit forms to see analytics</p>
                )}
                {formStats.filter(f => f.total > 0).map(f => (
                  <div key={f.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 truncate">{f.name}</span>
                      <span className="text-gray-500 flex-shrink-0 ml-2">{f.passRate}% pass · {f.total} sub{f.total !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${f.passRate >= 80 ? "bg-green-500" : f.passRate >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${f.passRate || 0}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Alert history */}
          {alertSubmissions.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-orange-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Recent Submissions with Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {alertSubmissions.map(sub => (
                  <div key={sub.id} className="bg-white border border-orange-200 rounded-lg px-3 py-2 cursor-pointer hover:shadow-sm" onClick={() => setSelectedSubmission(sub)}>
                    <p className="text-sm font-medium text-gray-800">{sub.form_name}</p>
                    <p className="text-xs text-gray-500">{sub.submitted_by_name} · {sub.date}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <FormBuilderDialog open={builderOpen} onOpenChange={setBuilderOpen} editForm={editForm} />
      <SubmitFormDialog open={!!submitForm} onOpenChange={open => { if (!open) setSubmitForm(null); }} form={submitForm} />
      <SubmissionDetailDrawer submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />
    </div>
  );
}