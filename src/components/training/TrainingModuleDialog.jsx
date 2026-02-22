import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

const defaultForm = () => ({
  title: "", description: "", category: "lifeguarding", content: "",
  video_url: "", passing_score: 80, is_active: true, quiz_questions: []
});

export default function TrainingModuleDialog({ open, onOpenChange, module }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(defaultForm());

  useEffect(() => {
    if (module) setForm({ ...defaultForm(), ...module });
    else setForm(defaultForm());
  }, [module, open]);

  const save = useMutation({
    mutationFn: (data) => module ? base44.entities.TrainingModule.update(module.id, data) : base44.entities.TrainingModule.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["training-modules"] }); onOpenChange(false); }
  });

  const f = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const addQuestion = () => {
    f("quiz_questions", [...(form.quiz_questions || []), { id: Date.now().toString(), question: "", options: ["", "", "", ""], correct_index: 0 }]);
  };

  const updateQuestion = (idx, field, val) => {
    const qs = [...(form.quiz_questions || [])];
    qs[idx] = { ...qs[idx], [field]: val };
    f("quiz_questions", qs);
  };

  const updateOption = (qIdx, oIdx, val) => {
    const qs = [...(form.quiz_questions || [])];
    const opts = [...qs[qIdx].options];
    opts[oIdx] = val;
    qs[qIdx] = { ...qs[qIdx], options: opts };
    f("quiz_questions", qs);
  };

  const removeQuestion = (idx) => {
    f("quiz_questions", form.quiz_questions.filter((_, i) => i !== idx));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{module ? "Edit" : "New"} Training Module</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => f("title", e.target.value)} placeholder="e.g. Lifeguard Rescue Techniques" className="mt-1" />
            </div>
            <div>
              <Label>Category</Label>
              <select value={form.category} onChange={e => f("category", e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {["lifeguarding","first_aid","chemical_safety","emergency_procedures","equipment","customer_service","other"].map(c => (
                  <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, x => x.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Passing Score (%)</Label>
              <Input type="number" min="0" max="100" value={form.passing_score} onChange={e => f("passing_score", Number(e.target.value))} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea rows={2} value={form.description} onChange={e => f("description", e.target.value)} placeholder="What this training covers..." className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Training Content</Label>
              <Textarea rows={5} value={form.content} onChange={e => f("content", e.target.value)} placeholder="Enter training content, instructions, or reference materials..." className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Video URL (optional)</Label>
              <Input value={form.video_url} onChange={e => f("video_url", e.target.value)} placeholder="https://..." className="mt-1" />
            </div>
          </div>

          {/* Quiz Builder */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Quiz Questions</Label>
              <Button type="button" size="sm" variant="outline" onClick={addQuestion} className="gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Question
              </Button>
            </div>
            {(form.quiz_questions || []).map((q, qi) => (
              <div key={q.id || qi} className="bg-gray-50 rounded-xl p-4 mb-3 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Input value={q.question} onChange={e => updateQuestion(qi, "question", e.target.value)} placeholder={`Question ${qi + 1}`} className="bg-white" />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(q.options || ["", "", "", ""]).map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input type="radio" name={`q-${qi}`} checked={q.correct_index === oi} onChange={() => updateQuestion(qi, "correct_index", oi)} className="accent-[#1a9c5b]" />
                      <Input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} className="bg-white text-sm h-8" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400">Select radio button for correct answer</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={() => save.mutate(form)} disabled={!form.title || save.isPending}>
              {save.isPending ? "Saving..." : module ? "Save Changes" : "Create Module"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}