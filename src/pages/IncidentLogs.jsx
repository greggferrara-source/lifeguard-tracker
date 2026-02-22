import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import LogIncidentForm from "@/components/incidents/LogIncidentForm";
import IncidentDetailDrawer from "@/components/incidents/IncidentDetailDrawer";

const typeStyle = { rescue: "bg-red-100 text-red-700", incident: "bg-orange-100 text-orange-700", near_miss: "bg-yellow-100 text-yellow-700", first_aid: "bg-blue-100 text-blue-700", injury: "bg-purple-100 text-purple-700", other: "bg-gray-100 text-gray-600" };
const severityStyle = { minor: "bg-green-100 text-green-700", moderate: "bg-yellow-100 text-yellow-700", serious: "bg-orange-100 text-orange-700", critical: "bg-red-100 text-red-700" };
const statusStyle = { open: "bg-red-100 text-red-700", reviewed: "bg-yellow-100 text-yellow-700", closed: "bg-green-100 text-green-700" };

export default function IncidentLogs() {
  const [logOpen, setLogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const { data: logs = [] } = useQuery({ queryKey: ["incident-logs"], queryFn: () => base44.entities.IncidentLog.list("-created_date", 200), refetchInterval: 30000 });

  const filtered = filterType === "all" ? logs : logs.filter(l => l.type === filterType);
  const openCount = logs.filter(l => l.status === "open").length;
  const rescueCount = logs.filter(l => l.type === "rescue").length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incident & Rescue Logs</h1>
          <p className="text-gray-500 mt-1">{openCount} open · {rescueCount} rescues total</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2">
          <Plus className="w-4 h-4" /> Log Incident
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Incidents", value: logs.length, color: "text-gray-900" },
          { label: "Open / Unreviewed", value: openCount, color: "text-red-600" },
          { label: "Rescues", value: rescueCount, color: "text-orange-600" },
          { label: "EMS Called", value: logs.filter(l => l.ems_called).length, color: "text-purple-600" },
        ].map((s, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "rescue", "incident", "near_miss", "first_aid", "injury"].map(t => (
          <Button key={t} variant={filterType === t ? "default" : "outline"} size="sm"
            onClick={() => setFilterType(t)}
            className={filterType === t ? "bg-[#1a9c5b] hover:bg-[#158a4e]" : ""}>
            {t === "all" ? "All" : t.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
          </Button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No incidents logged</p>
          </div>
        )}
        {filtered.map(log => (
          <Card key={log.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(log)}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={typeStyle[log.type]}>{log.type?.replace("_", " ")}</Badge>
                    <Badge className={severityStyle[log.severity]}>{log.severity}</Badge>
                    <Badge className={statusStyle[log.status]}>{log.status}</Badge>
                    {log.ems_called && <Badge className="bg-red-100 text-red-700">EMS Called</Badge>}
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-1">{log.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{log.location_name} · {log.date} {log.time && `· ${log.time}`} · {log.reporting_staff_name}</p>
                </div>
                {log.status === "open" && <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                {log.status === "closed" && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Incident Report</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="flex gap-2 flex-wrap">
                <Badge className={typeStyle[selected.type]}>{selected.type?.replace("_", " ")}</Badge>
                <Badge className={severityStyle[selected.severity]}>{selected.severity}</Badge>
                <Badge className={statusStyle[selected.status]}>{selected.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-gray-700 bg-gray-50 rounded-lg p-3">
                <div><p className="text-xs text-gray-400">Location</p><p className="font-medium">{selected.location_name}</p></div>
                <div><p className="text-xs text-gray-400">Date / Time</p><p className="font-medium">{selected.date} {selected.time}</p></div>
                <div><p className="text-xs text-gray-400">Reported By</p><p className="font-medium">{selected.reporting_staff_name}</p></div>
                {selected.patron_name && <div><p className="text-xs text-gray-400">Patron</p><p className="font-medium">{selected.patron_name}{selected.patron_age ? `, ${selected.patron_age}` : ""}</p></div>}
              </div>
              <div><p className="text-xs text-gray-400 mb-1">Description</p><p className="text-gray-800">{selected.description}</p></div>
              {selected.action_taken && <div><p className="text-xs text-gray-400 mb-1">Action Taken</p><p className="text-gray-800">{selected.action_taken}</p></div>}
              {selected.witnesses && <div><p className="text-xs text-gray-400 mb-1">Witnesses</p><p className="text-gray-800">{selected.witnesses}</p></div>}
              {selected.follow_up_notes && <div><p className="text-xs text-gray-400 mb-1">Follow-Up Notes</p><p className="text-gray-800">{selected.follow_up_notes}</p></div>}
              <div className="flex gap-2 flex-wrap pt-2 border-t">
                {selected.ems_called && <Badge className="bg-red-100 text-red-700">EMS Called</Badge>}
                {selected.patron_transported && <Badge className="bg-purple-100 text-purple-700">Patron Transported</Badge>}
                {selected.follow_up_required && <Badge className="bg-yellow-100 text-yellow-700">Follow-Up Required</Badge>}
              </div>
              {selected.status !== "closed" && (
                <div className="flex gap-2 pt-2 border-t">
                  {selected.status === "open" && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => updateStatus.mutate({ id: selected.id, status: "reviewed" })}>Mark Reviewed</Button>
                  )}
                  <Button size="sm" className="flex-1 bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={() => updateStatus.mutate({ id: selected.id, status: "closed" })}>Close Incident</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Log Incident / Rescue</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Location *</label>
                <select required value={form.location_id} onChange={e => setForm({...form, location_id: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="">Select...</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Time</label>
                <Input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Type *</label>
                <select required value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="rescue">Rescue</option>
                  <option value="incident">Incident</option>
                  <option value="near_miss">Near Miss</option>
                  <option value="first_aid">First Aid</option>
                  <option value="injury">Injury</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Severity</label>
                <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="serious">Serious</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Patron Name</label>
                <Input value={form.patron_name} onChange={e => setForm({...form, patron_name: e.target.value})} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Patron Age</label>
                <Input type="number" value={form.patron_age} onChange={e => setForm({...form, patron_age: e.target.value})} className="mt-1" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Description *</label>
                <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="What happened?" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Action Taken</label>
                <textarea value={form.action_taken} onChange={e => setForm({...form, action_taken: e.target.value})} rows={2} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="What was done in response?" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Witnesses</label>
                <Input value={form.witnesses} onChange={e => setForm({...form, witnesses: e.target.value})} className="mt-1" placeholder="Names of witnesses" />
              </div>
              <div className="col-span-2 flex flex-wrap gap-4">
                {[
                  ["ems_called", "EMS Called"],
                  ["patron_transported", "Patron Transported"],
                  ["follow_up_required", "Follow-Up Required"],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form[key]} onChange={e => setForm({...form, [key]: e.target.checked})} className="w-4 h-4 rounded" />
                    {label}
                  </label>
                ))}
              </div>
              {form.follow_up_required && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Follow-Up Notes</label>
                  <textarea value={form.follow_up_notes} onChange={e => setForm({...form, follow_up_notes: e.target.value})} rows={2} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={save.isPending}>Submit Report</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}