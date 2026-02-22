import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BookOpen, Users, CheckCircle2, Clock, Search, ChevronRight, Trophy } from "lucide-react";
import TrainingModuleDialog from "@/components/training/TrainingModuleDialog.jsx";
import TakeTrainingDialog from "@/components/training/TakeTrainingDialog.jsx";

const CATEGORY_COLORS = {
  lifeguarding: "bg-blue-100 text-blue-700",
  first_aid: "bg-red-100 text-red-700",
  chemical_safety: "bg-yellow-100 text-yellow-700",
  emergency_procedures: "bg-orange-100 text-orange-700",
  equipment: "bg-purple-100 text-purple-700",
  customer_service: "bg-green-100 text-green-700",
  other: "bg-gray-100 text-gray-600",
};

export default function TrainingDashboard() {
  const [tab, setTab] = useState("modules");
  const [search, setSearch] = useState("");
  const [moduleDialog, setModuleDialog] = useState(false);
  const [editModule, setEditModule] = useState(null);
  const [takeTraining, setTakeTraining] = useState(null);
  const qc = useQueryClient();

  const { data: modules = [] } = useQuery({ queryKey: ["training-modules"], queryFn: () => base44.entities.TrainingModule.list("-created_date", 100) });
  const { data: completions = [] } = useQuery({ queryKey: ["training-completions"], queryFn: () => base44.entities.TrainingCompletion.list("-completed_date", 500) });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.list() });
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const deleteModule = useMutation({
    mutationFn: (id) => base44.entities.TrainingModule.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["training-modules"] }),
  });

  const activeModules = modules.filter(m => m.is_active !== false);
  const filteredModules = activeModules.filter(m => m.title?.toLowerCase().includes(search.toLowerCase()));

  // Completion stats
  const totalRequired = activeModules.length * employees.filter(e => e.status === "active").length;
  const completed = completions.filter(c => c.passed).length;
  const completionRate = totalRequired > 0 ? Math.round((completed / totalRequired) * 100) : 0;

  // Per-employee completion
  const employeeProgress = employees.filter(e => e.status === "active").map(emp => {
    const empCompletions = completions.filter(c => c.employee_id === emp.id && c.passed);
    const empModuleIds = new Set(empCompletions.map(c => c.module_id));
    const doneCount = activeModules.filter(m => empModuleIds.has(m.id)).length;
    return { ...emp, doneCount, total: activeModules.length, pct: activeModules.length > 0 ? Math.round((doneCount / activeModules.length) * 100) : 0 };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Training</h1>
          <p className="text-gray-500 mt-1">Manage training modules and track completions</p>
        </div>
        <Button onClick={() => { setEditModule(null); setModuleDialog(true); }} className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2">
          <Plus className="w-4 h-4" /> New Module
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Training Modules", value: activeModules.length, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completions", value: completed, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          { label: "Completion Rate", value: `${completionRate}%`, icon: Trophy, color: completionRate >= 80 ? "text-green-600" : "text-orange-600", bg: completionRate >= 80 ? "bg-green-50" : "bg-orange-50" },
          { label: "Active Staff", value: employees.filter(e => e.status === "active").length, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-5`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="progress">Employee Progress</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "modules" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search modules..." className="pl-9" />
          </div>
          {filteredModules.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No training modules yet</p>
              <p className="text-sm">Create your first module to get started</p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map(mod => {
              const modCompletions = completions.filter(c => c.module_id === mod.id && c.passed).length;
              const activeCount = employees.filter(e => e.status === "active").length;
              const pct = activeCount > 0 ? Math.round((modCompletions / activeCount) * 100) : 0;
              return (
                <Card key={mod.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`text-xs ${CATEGORY_COLORS[mod.category] || "bg-gray-100 text-gray-600"}`}>
                        {mod.category?.replace("_", " ")}
                      </Badge>
                      {mod.quiz_questions?.length > 0 && <Badge variant="outline" className="text-xs">Quiz</Badge>}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{mod.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{mod.description}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Completion</span>
                        <span>{modCompletions}/{activeCount}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div className="h-1.5 bg-[#1a9c5b] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-[#1a9c5b] hover:bg-[#158a4e] text-xs" onClick={() => setTakeTraining(mod)}>
                        Take Training
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => { setEditModule(mod); setModuleDialog(true); }}>
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {tab === "progress" && (
        <div className="space-y-3">
          {employeeProgress.map(emp => (
            <Card key={emp.id} className="border border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: emp.color || "#1a9c5b" }}>
                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">{emp.first_name} {emp.last_name}</p>
                      <span className="text-sm text-gray-500">{emp.doneCount}/{emp.total} modules</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className={`h-2 rounded-full transition-all ${emp.pct === 100 ? "bg-green-500" : emp.pct >= 50 ? "bg-[#1a9c5b]" : "bg-orange-400"}`}
                        style={{ width: `${emp.pct}%` }} />
                    </div>
                  </div>
                  <span className={`text-sm font-bold w-12 text-right ${emp.pct === 100 ? "text-green-600" : emp.pct >= 50 ? "text-[#1a9c5b]" : "text-orange-500"}`}>
                    {emp.pct}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TrainingModuleDialog open={moduleDialog} onOpenChange={setModuleDialog} module={editModule} />
      {takeTraining && <TakeTrainingDialog module={takeTraining} onClose={() => setTakeTraining(null)} />}
    </div>
  );
}