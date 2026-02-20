import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, ClipboardList, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { format } from "date-fns";

const INSPECTION_ITEMS = [
  "Lifesaving equipment present and accessible",
  "First aid kit stocked and accessible",
  "Emergency action plan posted",
  "Pool depth markers visible",
  "No-diving signs posted where required",
  "Drain covers secure and compliant",
  "Pool deck clear of hazards",
  "Water clarity — visible to pool bottom",
  "Rescue tube / buoy available at each station",
  "Backboard and straps available",
  "Phone / emergency communication working",
  "Chemical storage area secure",
  "Entry/exit points unobstructed",
];

const resultStyle = { pass: "bg-green-100 text-green-700", conditional: "bg-amber-100 text-amber-700", fail: "bg-red-100 text-red-700" };

export default function Inspections() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterLocation, setFilterLocation] = useState("all");
  const [form, setForm] = useState({
    location_id: "", date: format(new Date(), "yyyy-MM-dd"), notes: "",
    items: INSPECTION_ITEMS.map(name => ({ name, status: "pass", notes: "" }))
  });

  const { data: reports = [] } = useQuery({ queryKey: ["inspections"], queryFn: () => base44.entities.InspectionReport.list("-created_date", 100) });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const save = useMutation({
    mutationFn: (data) => base44.entities.InspectionReport.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["inspections"] }); setOpen(false); },
  });

  const handleItemChange = (i, field, value) => {
    setForm(f => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: value };
      return { ...f, items };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const loc = locations.find(l => l.id === form.location_id);
    const fails = form.items.filter(i => i.status === "fail").length;
    const conditionals = form.items.filter(i => i.status === "conditional").length;
    const overall = fails > 0 ? "fail" : conditionals > 0 ? "conditional" : "pass";
    save.mutate({ ...form, location_name: loc?.name, inspector_name: user?.full_name, inspector_id: user?.id, overall_result: overall, signed_off_by: user?.full_name });
  };

  const filtered = filterLocation === "all" ? reports : reports.filter(r => r.location_id === filterLocation);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inspection Reports</h1>
          <p className="text-gray-500 mt-1">{reports.filter(r => r.overall_result === "fail").length} failed inspections</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2"><Plus className="w-4 h-4" /> Run Inspection</Button>
      </div>

      <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
        <option value="all">All Locations</option>
        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No inspections</p></div>}
        {filtered.map(r => {
          const pass = (r.items || []).filter(i => i.status === "pass").length;
          const total = (r.items || []).length;
          return (
            <Card key={r.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(r)}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{r.location_name}</p>
                      <Badge className={resultStyle[r.overall_result]}>{r.overall_result}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{r.date} · {r.inspector_name}</p>
                    {total > 0 && <p className="text-sm text-gray-600 mt-1">{pass}/{total} items passed</p>}
                  </div>
                  {r.overall_result === "pass" && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                  {r.overall_result === "fail" && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                  {r.overall_result === "conditional" && <MinusCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Inspection — {selected?.location_name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={resultStyle[selected.overall_result]}>{selected.overall_result}</Badge>
                <span className="text-sm text-gray-500">{selected.date} · {selected.inspector_name}</span>
              </div>
              <div className="space-y-2">
                {(selected.items || []).map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 p-2 rounded-lg text-sm ${item.status === "fail" ? "bg-red-50" : item.status === "conditional" ? "bg-amber-50" : ""}`}>
                    {item.status === "pass" && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />}
                    {item.status === "fail" && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                    {item.status === "na" && <MinusCircle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />}
                    {item.status === "conditional" && <MinusCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.notes && <p className="text-gray-500">{item.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
              {selected.notes && <div className="border-t pt-3 text-sm text-gray-600"><strong>Notes:</strong> {selected.notes}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Run Inspection</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
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
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Inspection Items</p>
              {form.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 text-sm font-medium text-gray-800">{item.name}</div>
                  <div className="flex gap-1">
                    {["pass", "conditional", "fail", "na"].map(s => (
                      <button key={s} type="button" onClick={() => handleItemChange(i, "status", s)}
                        className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${item.status === s
                          ? s === "pass" ? "bg-green-500 text-white" : s === "fail" ? "bg-red-500 text-white" : s === "conditional" ? "bg-amber-500 text-white" : "bg-gray-400 text-white"
                          : "bg-white border text-gray-500 hover:bg-gray-100"}`}>
                        {s === "na" ? "N/A" : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={save.isPending}>Submit Inspection</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}