import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function PatronCounts() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ location_id: "", date: format(new Date(), "yyyy-MM-dd"), time: format(new Date(), "HH:mm"), count: "", weather: "sunny", notes: "" });
  const [filterLocation, setFilterLocation] = useState("all");

  const { data: counts = [] } = useQuery({ queryKey: ["patron-counts"], queryFn: () => base44.entities.PatronCount.list("-created_date", 200) });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const save = useMutation({
    mutationFn: (data) => base44.entities.PatronCount.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["patron-counts"] }); setOpen(false); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const loc = locations.find(l => l.id === form.location_id);
    save.mutate({ ...form, count: parseInt(form.count), location_name: loc?.name, recorded_by: user?.email, recorded_by_name: user?.full_name });
  };

  const filtered = filterLocation === "all" ? counts : counts.filter(c => c.location_id === filterLocation);

  // Chart data - last 7 days totals
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = format(d, "yyyy-MM-dd");
    const dayTotal = counts.filter(c => c.date === key && (filterLocation === "all" || c.location_id === filterLocation)).reduce((sum, c) => sum + (c.count || 0), 0);
    return { day: format(d, "EEE"), total: dayTotal };
  });

  const todayTotal = counts.filter(c => c.date === format(new Date(), "yyyy-MM-dd") && (filterLocation === "all" || c.location_id === filterLocation)).reduce((sum, c) => sum + (c.count || 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patron Counts</h1>
          <p className="text-gray-500 mt-1">Today: <strong>{todayTotal}</strong> patrons logged</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2"><Plus className="w-4 h-4" /> Log Count</Button>
      </div>

      {/* Chart */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Last 7 Days</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={last7}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#1a9c5b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
        <option value="all">All Locations</option>
        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>

      <div className="space-y-2">
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><Users className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No counts logged</p></div>}
        {filtered.map(c => (
          <Card key={c.id}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{c.location_name} <span className="text-2xl font-bold text-[#1a9c5b] ml-2">{c.count}</span></p>
                  <p className="text-xs text-gray-500">{c.date} {c.time && `· ${c.time}`} · {c.recorded_by_name} · {c.weather}</p>
                </div>
                <Users className="w-5 h-5 text-gray-300" />
              </div>
              {c.notes && <p className="text-sm text-gray-500 mt-1">{c.notes}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Log Patron Count</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Location *</label>
              <select required value={form.location_id} onChange={e => setForm({...form, location_id: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select...</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Time</label>
                <Input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Count *</label>
              <Input required type="number" min="0" value={form.count} onChange={e => setForm({...form, count: e.target.value})} placeholder="e.g. 42" className="mt-1 text-2xl font-bold" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Weather</label>
              <select value={form.weather} onChange={e => setForm({...form, weather: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {["sunny","partly_cloudy","cloudy","rainy","hot","cold"].map(w => <option key={w} value={w}>{w.replace("_"," ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Optional notes" className="mt-1" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={save.isPending}>Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}