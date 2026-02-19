import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, CheckCircle2, Clock, Edit } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("templates");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form, setForm] = useState({ name: "", start_time: "09:00", end_time: "17:00", location_id: "", days_of_week: [], notes: "" });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.ShiftTemplate.list(),
  });
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list(),
  });

  const createTemplate = useMutation({
    mutationFn: (data) => base44.entities.ShiftTemplate.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["templates"] }); setTemplateOpen(false); },
  });
  const updateTemplate = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShiftTemplate.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["templates"] }); setTemplateOpen(false); },
  });
  const deleteTemplate = useMutation({
    mutationFn: (id) => base44.entities.ShiftTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] }),
  });

  const handleSave = () => {
    const loc = locations.find(l => l.id === form.location_id);
    const data = { ...form, location_name: loc?.name || "" };
    if (editingTemplate) updateTemplate.mutate({ id: editingTemplate.id, data });
    else createTemplate.mutate(data);
  };

  const openNew = () => { setEditingTemplate(null); setForm({ name: "", start_time: "09:00", end_time: "17:00", location_id: "", days_of_week: [], notes: "" }); setTemplateOpen(true); };
  const openEdit = (t) => { setEditingTemplate(t); setForm({ name: t.name, start_time: t.start_time, end_time: t.end_time, location_id: t.location_id || "", days_of_week: t.days_of_week || [], notes: t.notes || "" }); setTemplateOpen(true); };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const toggleDay = (d) => {
    const days = form.days_of_week.includes(d) ? form.days_of_week.filter(x => x !== d) : [...form.days_of_week, d];
    setForm({ ...form, days_of_week: days });
  };

  const handleTestScan = async () => {
    setTesting(true); setTestResult(null);
    const res = await base44.functions.invoke("dailyScan", {});
    setTestResult(res.data);
    setTesting(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-2">Shift templates, automation, and system configuration</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-gray-100 rounded-full p-1">
          <TabsTrigger value="templates" className="rounded-full text-sm">Shift Templates</TabsTrigger>
          <TabsTrigger value="automation" className="rounded-full text-sm">Automation</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "templates" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" className="bg-[#1a9c5b] hover:bg-[#158a4e] rounded-full" onClick={openNew}>
              <Plus className="w-4 h-4 mr-1" /> New Template
            </Button>
          </div>
          {templates.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <Clock className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400 font-medium">No templates yet.</p>
              <p className="text-sm text-gray-400 mt-1">Create reusable shift patterns to speed up scheduling.</p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="p-5 border border-gray-100 shadow-none rounded-2xl group">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.start_time} – {t.end_time}</p>
                      {t.location_name && <p className="text-xs text-slate-400 mt-0.5">📍 {t.location_name}</p>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => deleteTemplate.mutate(t.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  {t.days_of_week?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {t.days_of_week.sort().map(d => (
                        <span key={d} className="text-[10px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded font-medium">{dayNames[d]}</span>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {tab === "automation" && (
        <div className="space-y-5">
          {[
            { title: "Daily Scan", desc: "Runs every morning at 7am. Checks for understaffing, shift conflicts, and expiring certifications. Sends shift reminders to staff and alert summary to managers.", active: true, schedule: "Daily at 7:00 AM" },
            { title: "Shift Assignment Notifications", desc: "Automatically sends email + SMS to employees when they are assigned to a new shift.", active: true, schedule: "On shift create" },
            { title: "Shift Update Notifications", desc: "Notifies employees via email + SMS when their shift is modified (time, location, or status changes).", active: true, schedule: "On shift update" },
          ].map((item, i) => (
            <Card key={i} className="p-5 border-0 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                    <Badge variant="outline" className="text-[10px] mt-2">{item.schedule}</Badge>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px] flex-shrink-0">Active</Badge>
              </div>
            </Card>
          ))}

          <Card className="p-5 border-0 shadow-sm border-l-4 border-l-cyan-500">
            <h3 className="font-semibold text-sm text-slate-900 mb-2">Manual Scan</h3>
            <p className="text-xs text-slate-500 mb-4">Run a full scan immediately to detect understaffing, conflicts, and cert expiry issues.</p>
            {testResult && (
              <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800">
                ✅ Scan complete: {testResult.alerts_created} alert(s) created · {testResult.reminders_sent} reminder(s) sent
              </div>
            )}
            <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700" onClick={handleTestScan} disabled={testing}>
              {testing ? "Scanning..." : "Run Full Scan Now"}
            </Button>
          </Card>
        </div>
      )}

      {/* Template Dialog */}
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "New Shift Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Template Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Morning Pool Shift" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start Time</Label>
                <Input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">End Time</Label>
                <Input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Location (optional)</Label>
              <Select value={form.location_id} onValueChange={v => setForm({ ...form, location_id: v })}>
                <SelectTrigger><SelectValue placeholder="Any location" /></SelectTrigger>
                <SelectContent>
                  {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Days of Week</Label>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {dayNames.map((d, i) => (
                  <button key={i} onClick={() => toggleDay(i)}
                    className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${form.days_of_week.includes(i) ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateOpen(false)}>Cancel</Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={handleSave}>{editingTemplate ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}