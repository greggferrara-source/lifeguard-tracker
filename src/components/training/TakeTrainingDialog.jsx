import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ChevronRight, Trophy, BookOpen } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

export default function TakeTrainingDialog({ module, onClose }) {
  const qc = useQueryClient();
  const [step, setStep] = useState("content"); // content | quiz | result
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.list() });

  const save = useMutation({
    mutationFn: (data) => base44.entities.TrainingCompletion.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["training-completions"] }),
  });

  const handleSubmitQuiz = () => {
    const questions = module.quiz_questions || [];
    if (questions.length === 0) {
      // No quiz — just mark complete
      const emp = employees.find(e => e.email === user?.email);
      save.mutate({
        module_id: module.id,
        module_title: module.title,
        employee_id: emp?.id || user?.id,
        employee_name: user?.full_name,
        employee_email: user?.email,
        completed_date: format(new Date(), "yyyy-MM-dd"),
        quiz_score: 100,
        passed: true,
        attempts: 1,
      });
      setResult({ score: 100, passed: true, correct: 0, total: 0 });
      setStep("result");
      return;
    }
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct_index) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= (module.passing_score || 80);
    const emp = employees.find(e => e.email === user?.email);
    save.mutate({
      module_id: module.id,
      module_title: module.title,
      employee_id: emp?.id || user?.id,
      employee_name: user?.full_name,
      employee_email: user?.email,
      completed_date: format(new Date(), "yyyy-MM-dd"),
      quiz_score: score,
      passed,
      attempts: 1,
    });
    setResult({ score, passed, correct, total: questions.length });
    setStep("result");
  };

  const questions = module.quiz_questions || [];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#1a9c5b]" />
            {module.title}
          </DialogTitle>
        </DialogHeader>

        {step === "content" && (
          <div className="space-y-4">
            {module.video_url && (
              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                <iframe src={module.video_url} className="w-full h-full" allowFullScreen title="Training video" />
              </div>
            )}
            {module.content && (
              <div className="prose prose-sm max-w-none bg-gray-50 rounded-xl p-4">
                <ReactMarkdown>{module.content}</ReactMarkdown>
              </div>
            )}
            {!module.content && !module.video_url && (
              <p className="text-gray-400 text-center py-8">No training content provided.</p>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-1" onClick={() => questions.length > 0 ? setStep("quiz") : handleSubmitQuiz()}>
                {questions.length > 0 ? "Take Quiz" : "Mark Complete"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === "quiz" && (
          <div className="space-y-5">
            <p className="text-sm text-gray-500">Answer all questions. You need {module.passing_score || 80}% to pass.</p>
            {questions.map((q, qi) => (
              <div key={qi} className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-900 mb-3">{qi + 1}. {q.question}</p>
                <div className="space-y-2">
                  {(q.options || []).map((opt, oi) => (
                    <label key={oi} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${answers[qi] === oi ? "border-[#1a9c5b] bg-[#f0faf5]" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                      <input type="radio" name={`q-${qi}`} checked={answers[qi] === oi} onChange={() => setAnswers(a => ({ ...a, [qi]: oi }))} className="accent-[#1a9c5b]" />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2 border-t pt-3">
              <Button variant="outline" onClick={() => setStep("content")}>Back</Button>
              <Button className="bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={handleSubmitQuiz}
                disabled={Object.keys(answers).length < questions.length || save.isPending}>
                Submit Quiz
              </Button>
            </div>
          </div>
        )}

        {step === "result" && result && (
          <div className="text-center py-8 space-y-4">
            {result.passed ? (
              <>
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
                <h2 className="text-2xl font-bold text-green-600">You Passed! 🎉</h2>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-400 mx-auto" />
                <h2 className="text-2xl font-bold text-red-600">Not Quite</h2>
              </>
            )}
            {result.total > 0 && (
              <p className="text-gray-600">Score: <span className="font-bold text-2xl">{result.score}%</span> ({result.correct}/{result.total} correct)</p>
            )}
            <p className="text-sm text-gray-500">Passing score: {module.passing_score || 80}%</p>
            {!result.passed && <p className="text-sm text-orange-600">Please review the material and try again.</p>}
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] mt-2" onClick={onClose}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}