import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Droplets, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const statusStyle = {
  pass: "bg-green-100 text-green-700",
  requires_action: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
};

const defaultForm = {
  location_id: "", date: format(new Date(), "yyyy-MM-dd"), time: format(new Date(), "HH:mm"),
  ph_level: "", free_chlorine: "", combined_chlorine: "", alkalinity: "",
  calcium_hardness: "", temperature_f: "", cyanuric_acid: "",
  water_clarity: "clear", status: "pass", notes: ""
};

export default function ChemicalLogs() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [filterLocation, setFilterLocation] = useState("all");

  const { data: logs = [] } = useQuery({ queryKey: ["chemical-logs"], queryFn: () => base44.entities.ChemicalLog.list("-created_date", 100) });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const save = useMutation({
    mutationFn: (data) => base44.entities.ChemicalLog.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["chemical-logs"] }); setOpen(false); setForm(defaultForm); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const loc = locations.find(l => l.id === form.location_id);
    save.mutate({ ...form, location_name: loc?.name, recorded_by: user?.email, recorded_by_name: user?.full_name });
  };

  const filtered = filterLocation === "all" ? logs : logs.filter(l => l.location_id === filterLocation);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chemical Logs</h1>
          <p className="text-gray-500 mt-1">Water chemistry records</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2">
          <Plus className="w-4 h-4" /> Log Reading
        </Button>
      </div>

      <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
        <option value="all">All Locations</option>
        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><Droplets className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No logs yet</p></div>}
        {filtered.map(log => (
          <Card key={log.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{log.location_name}</p>
                  <p className="text-sm text-gray-500">{log.date} {log.time && `· ${log.time}`} · {log.recorded_by_name}</p>
                </div>
                <Badge className={statusStyle[log.status]}>{log.status?.replace("_", " ")}</Badge>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 text-sm">
                {log.ph_level && <div><p className="text-xs text-gray-400">pH</p><p className="font-medium">{log.ph_level}</p></div>}
                {log.free_chlorine && <div><p className="text-xs text-gray-400">Free Cl</p><p className="font-medium">{log.free_chlorine} ppm</p></div>}
                {log.alkalinity && <div><p className="text-xs text-gray-400">Alkalinity</p><p className="font-medium">{log.alkalinity} ppm</p></div>}
                {log.temperature_f && <div><p className="text-xs text-gray-400">Temp</p><p className="font-medium">{log.temperature_f}°F</p></div>}
                {log.calcium_hardness && <div><p className="text-xs text-gray-400">Hardness</p><p className="font-medium">{log.calcium_hardness}</p></div>}
                {log.cyanuric_acid && <div><p className="text-xs text-gray-400">CYA</p><p className="font-medium">{log.cyanuric_acid}</p></div>}
                {log.water_clarity && <div><p className="text-xs text-gray-400">Clarity</p><p className="font-medium capitalize">{log.water_clarity.replace("_", " ")}</p></div>}
              </div>
              {log.notes && <p className="text-sm text-gray-600 mt-2 border-t pt-2">{log.notes}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Log Chemical Reading</DialogTitle></DialogHeader>
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
              {[["pH Level", "ph_level"], ["Free Chlorine (ppm)", "free_chlorine"], ["Combined Chlorine", "combined_chlorine"], ["Alkalinity (ppm)", "alkalinity"], ["Calcium Hardness", "calcium_hardness"], ["Temperature (°F)", "temperature_f"], ["Cyanuric Acid", "cyanuric_acid"]].map(([label, key]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <Input type="number" step="0.1" value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} className="mt-1" />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-700">Water Clarity</label>
                <select value={form.water_clarity} onChange={e => setForm({...form, water_clarity: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="clear">Clear</option>
                  <option value="slightly_cloudy">Slightly Cloudy</option>
                  <option value="cloudy">Cloudy</option>
                  <option value="very_cloudy">Very Cloudy</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="pass">Pass</option>
                  <option value="requires_action">Requires Action</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={save.isPending}>Save Reading</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}