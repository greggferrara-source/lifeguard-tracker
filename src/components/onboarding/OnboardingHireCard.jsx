import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Wand2, AlertTriangle, CheckCircle2 } from "lucide-react";

function ProgressBar({ pct }) {
  const color =
    pct >= 80 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden w-full">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function OnboardingHireCard({ employee: emp, expanded, onToggle, onGenerateTasks }) {
  const overdueCount = emp.tasks.filter(
    (t) => t.status !== "completed" && t.due_date && new Date(t.due_date) < new Date()
  ).length;

  const hasNoTasks = emp.totalProgress === 0;

  return (
    <div className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={onToggle}>
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
        style={{ backgroundColor: emp.color || "#1a9c5b" }}
      >
        {emp.first_name?.[0]}{emp.last_name?.[0]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">
            {emp.first_name} {emp.last_name}
          </span>
          <Badge variant="outline" className="text-[10px] capitalize">
            {emp.role?.replace("_", " ")}
          </Badge>
          {overdueCount > 0 && (
            <Badge className="text-[10px] bg-red-100 text-red-700 border-red-200">
              <AlertTriangle className="w-2.5 h-2.5 mr-1" />
              {overdueCount} overdue
            </Badge>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-3">
          <div className="flex-1 max-w-[180px]">
            <ProgressBar pct={emp.pct} />
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {emp.pct}% — {emp.completedTasks}/{emp.tasks.length} tasks · {emp.completedTrainings}/{emp.trainings.length} trainings · {emp.activeCerts} certs
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {hasNoTasks && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 border-[#1a9c5b] text-[#1a9c5b] hover:bg-[#f0faf5]"
            onClick={onGenerateTasks}
          >
            <Wand2 className="w-3 h-3 mr-1" />
            Generate Tasks
          </Button>
        )}
        {emp.pct === 100 && (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        )}
        <button className="text-gray-400 hover:text-gray-700 transition-colors" onClick={onToggle}>
          {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}