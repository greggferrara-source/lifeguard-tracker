import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, CheckSquare, Trash2, X } from "lucide-react";
import { format } from "date-fns";

const priorityStyle = { low: "bg-gray-100 text-gray-600", medium: "bg-amber-100 text-amber-700", high: "bg-red-100 text-red-700" };
const statusStyle = { pending: "bg-amber-100 text-amber-700", in_progress: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700" };

export default function Assignments() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [newCheckItem, setNewCheckItem] = useState("");
  const [form, setForm] = useState({ title: "", description: "", location_id: "", assigned_to_id: "", due_date: "", priority: "medium", checklist_items: [] });

  const { data: assignments = [] } = useQuery({ queryKey: ["assignments"], queryFn: () => base44.entities.Assignment.list("-created_date", 200) });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.list() });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const save = useMutation({
    mutationFn: (data) => base44.entities.Assignment.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["assignments"] }); setOpen(false); setForm({ title: "", description: "", location_id: "", assigned_to_id: "", due_date: "", priority: "medium", checklist_items: [] }); },
  });

  const updateAssignment = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Assignment.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["assignments"] }); },
  });

  const handleChecklistToggle = (assignment, itemId) => {
    const updated = assignment.checklist_items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed, completed_by: user?.full_name, completed_at: new Date().toISOString() } : item
    );
    const allDone = updated.every(i => i.completed);
    updateAssignment.mutate({ id: assignment.id, data: { checklist_items: updated, status: allDone ? "completed" : "in_progress" } });
    // Update selected view too
    setSelected(prev => prev ? { ...prev, checklist_items: updated } : null);
  };

  const addChecklistItem = () => {
    if (!newCheckItem.trim()) return;
    const item = { id: Date.now().toString(), title: newCheckItem.trim(), completed: false };
    setForm(f => ({ ...f, checklist_items: [...f.checklist_items, item] }));
    setNewCheckItem("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === form.assigned_to_id);
    const loc = locations.find(l => l.id === form.location_id);
    save.mutate({ ...form, assigned_to_name: emp ? `${emp.first_name} ${emp.last_name}` : "", location_name: loc?.name, created_by: user?.email, created_by_name: user?.full_name });
  };

  const filtered = filterStatus === "all" ? assignments : assignments.filter(a => a.status === filterStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-500 mt-1">{assignments.filter(a => a.status === "pending").length} pending</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2"><Plus className="w-4 h-4" /> New Assignment</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "in_progress", "completed"].map(s => (
          <Button key={s} size="sm" variant={filterStatus === s ? "default" : "outline"} onClick={() => setFilterStatus(s)} className={filterStatus === s ? "bg-[#1a9c5b] hover:bg-[#158a4e]" : ""}>
            {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No assignments</p></div>}
        {filtered.map(a => {
          const done = (a.checklist_items || []).filter(i => i.completed).length;
          const total = (a.checklist_items || []).length;
          return (
            <Card key={a.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(a)}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className={`font-semibold ${a.status === "completed" ? "line-through text-gray-400" : "text-gray-900"}`}>{a.title}</p>
                      <Badge className={priorityStyle[a.priority]}>{a.priority}</Badge>
                      <Badge className={statusStyle[a.status]}>{a.status?.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {a.assigned_to_name && `→ ${a.assigned_to_name}`}
                      {a.location_name && ` · ${a.location_name}`}
                      {a.due_date && ` · Due ${format(new Date(a.due_date), "MMM d")}`}
                    </p>
                    {total > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-[#1a9c5b] h-1.5 rounded-full" style={{ width: `${(done / total) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{done}/{total}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge className={priorityStyle[selected.priority]}>{selected.priority}</Badge>
                <Badge className={statusStyle[selected.status]}>{selected.status?.replace("_", " ")}</Badge>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {selected.description && <p>{selected.description}</p>}
                {selected.assigned_to_name && <p><strong>Assigned to:</strong> {selected.assigned_to_name}</p>}
                {selected.location_name && <p><strong>Location:</strong> {selected.location_name}</p>}
                {selected.due_date && <p><strong>Due:</strong> {format(new Date(selected.due_date), "MMM d, yyyy")}</p>}
              </div>
              {(selected.checklist_items?.length > 0) && (
                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700">Checklist</p>
                  {selected.checklist_items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => handleChecklistToggle(selected, item.id)}
                      />
                      <span className={`text-sm ${item.completed ? "line-through text-gray-400" : "text-gray-800"}`}>{item.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Assignment</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Title *</label>
              <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Assign To</label>
                <select value={form.assigned_to_id} onChange={e => setForm({...form, assigned_to_id: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="">Anyone</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <select value={form.location_id} onChange={e => setForm({...form, location_id: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="">Any</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Due Date</label>
                <Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
            </div>
            {/* Checklist Builder */}
            <div>
              <label className="text-sm font-medium text-gray-700">Checklist Items</label>
              <div className="flex gap-2 mt-1">
                <Input value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addChecklistItem())} placeholder="Add item..." />
                <Button type="button" variant="outline" onClick={addChecklistItem}>Add</Button>
              </div>
              {form.checklist_items.length > 0 && (
                <div className="mt-2 space-y-1">
                  {form.checklist_items.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 text-gray-700">✓ {item.title}</span>
                      <button type="button" onClick={() => setForm(f => ({ ...f, checklist_items: f.checklist_items.filter((_, j) => j !== i) }))}><X className="w-3 h-3 text-gray-400 hover:text-red-500" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={save.isPending}>Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}