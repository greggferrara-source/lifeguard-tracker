import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Wrench, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const priorityStyle = { low: "bg-gray-100 text-gray-600", medium: "bg-amber-100 text-amber-700", high: "bg-orange-100 text-orange-700", critical: "bg-red-100 text-red-700" };
const statusStyle = { open: "bg-red-100 text-red-700", in_progress: "bg-amber-100 text-amber-700", resolved: "bg-green-100 text-green-700" };

const defaultForm = { location_id: "", date: format(new Date(), "yyyy-MM-dd"), title: "", description: "", category: "equipment", priority: "medium", status: "open" };

export default function MaintenanceReports() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: reports = [] } = useQuery({ queryKey: ["maintenance-reports"], queryFn: () => base44.entities.MaintenanceReport.list("-created_date", 100) });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const save = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceReport.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["maintenance-reports"] }); setOpen(false); setForm(defaultForm); },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, notes }) => base44.entities.MaintenanceReport.update(id, { status, resolution_notes: notes, resolved_by: user?.full_name, resolved_date: format(new Date(), "yyyy-MM-dd") }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["maintenance-reports"] }); setSelected(null); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const loc = locations.find(l => l.id === form.location_id);
    save.mutate({ ...form, location_name: loc?.name, reported_by: user?.email, reported_by_name: user?.full_name });
  };

  const filtered = filterStatus === "all" ? reports : reports.filter(r => r.status === filterStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Reports</h1>
          <p className="text-gray-500 mt-1">{reports.filter(r => r.status === "open").length} open issues</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2"><Plus className="w-4 h-4" /> Report Issue</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "open", "in_progress", "resolved"].map(s => (
          <Button key={s} variant={filterStatus === s ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(s)}
            className={filterStatus === s ? "bg-[#1a9c5b] hover:bg-[#158a4e]" : ""}>
            {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><Wrench className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No reports</p></div>}
        {filtered.map(report => (
          <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(report)}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-gray-900">{report.title}</p>
                    <Badge className={priorityStyle[report.priority]}>{report.priority}</Badge>
                    <Badge className={statusStyle[report.status]}>{report.status?.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{report.location_name} · {report.date} · {report.reported_by_name}</p>
                  {report.description && <p className="text-sm text-gray-700 mt-1 truncate">{report.description}</p>}
                </div>
                {report.status === "open" && <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
                {report.status === "resolved" && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail/Resolve Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{selected?.title}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge className={priorityStyle[selected.priority]}>{selected.priority}</Badge>
                <Badge className={statusStyle[selected.status]}>{selected.status?.replace("_", " ")}</Badge>
                <Badge variant="outline">{selected.category}</Badge>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Location:</strong> {selected.location_name}</p>
                <p><strong>Reported by:</strong> {selected.reported_by_name} on {selected.date}</p>
                {selected.description && <p><strong>Description:</strong> {selected.description}</p>}
                {selected.resolution_notes && <p className="text-green-700"><strong>Resolution:</strong> {selected.resolution_notes}</p>}
              </div>
              {selected.status !== "resolved" && (
                <div className="flex gap-2 pt-2 border-t">
                  {selected.status === "open" && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => updateStatus.mutate({ id: selected.id, status: "in_progress" })}>Mark In Progress</Button>
                  )}
                  <Button size="sm" className="flex-1 bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={() => updateStatus.mutate({ id: selected.id, status: "resolved", notes: "" })}>Mark Resolved</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Report Maintenance Issue</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Location *</label>
              <select required value={form.location_id} onChange={e => setForm({...form, location_id: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select...</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Title *</label>
              <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Pump making unusual noise" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  {["equipment","pool_surface","pump_system","chemical_feeder","drain","lighting","safety","other"].map(c => <option key={c} value={c}>{c.replace("_"," ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={save.isPending}>Submit Report</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}