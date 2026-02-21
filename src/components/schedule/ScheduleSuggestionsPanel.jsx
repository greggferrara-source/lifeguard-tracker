import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { 
  Wand2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronDown,
  Zap,
  X
} from "lucide-react";

export default function ScheduleSuggestionsPanel({ 
  weekStart, 
  locationId, 
  onAssignments,
  onClose 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState({});
  const [message, setMessage] = useState(null);

  const generateSuggestions = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await base44.functions.invoke("generateScheduleSuggestions", {
        week_start: weekStart,
        location_id: locationId,
      });
      setSuggestions(response.data.suggestions || []);
      if (response.data.suggestions?.length === 0) {
        setMessage({
          type: "info",
          text: `No open shifts found for week of ${new Date(weekStart).toLocaleDateString()}`,
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to generate suggestions" });
    }
    setLoading(false);
  };

  const applyAssignments = async () => {
    setApplying(true);
    try {
      const assignments = [];
      
      for (const suggestion of suggestions) {
        const employeeId = selected[suggestion.shift_id] || suggestion.suggested_employee_id;
        if (employeeId) {
          assignments.push({
            shift_id: suggestion.shift_id,
            employee_id: employeeId,
          });
        }
      }

      // Bulk update shifts
      for (const assignment of assignments) {
        await base44.entities.Shift.update(assignment.shift_id, {
          employee_id: assignment.employee_id,
          status: "scheduled",
        });
      }

      setMessage({
        type: "success",
        text: `Applied ${assignments.length} shift assignment(s)`,
      });
      
      if (onAssignments) {
        onAssignments(assignments);
      }

      setTimeout(() => {
        setSuggestions([]);
        setSelected({});
      }, 1500);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to apply assignments" });
    }
    setApplying(false);
  };

  const toggleExpanded = (shiftId) => {
    setExpanded(prev => ({
      ...prev,
      [shiftId]: !prev[shiftId],
    }));
  };

  const handleSelection = (shiftId, employeeId) => {
    setSelected(prev => ({
      ...prev,
      [shiftId]: employeeId,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a9c5b] to-[#158a4e] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wand2 className="w-5 h-5 text-white" />
            <div>
              <h2 className="font-bold text-white">AI Schedule Suggestions</h2>
              <p className="text-sm text-[#f0faf5] mt-0.5">
                Review and approve optimal shift assignments
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!suggestions.length && !loading && (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No suggestions generated yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Click "Generate Suggestions" to analyze open shifts
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#1a9c5b] mx-auto mb-3" />
              <p className="text-gray-600">Analyzing shifts and availability...</p>
            </div>
          )}

          {suggestions.map((suggestion) => (
            <div
              key={suggestion.shift_id}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
            >
              <div
                className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                onClick={() => toggleExpanded(suggestion.shift_id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      {suggestion.location_name}
                    </p>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {suggestion.shift_start} – {suggestion.shift_end}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      suggestion.confidence >= 80
                        ? "bg-green-100 text-green-700"
                        : suggestion.confidence >= 60
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {suggestion.confidence}% match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Suggested: <span className="font-medium text-gray-900">
                      {suggestion.suggested_employee_name}
                    </span>
                  </p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expanded[suggestion.shift_id] ? "rotate-180" : ""
                  }`}
                />
              </div>

              {expanded[suggestion.shift_id] && (
                <div className="border-t border-gray-200 p-4 bg-white space-y-3">
                  {/* Primary suggestion */}
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <input
                      type="radio"
                      name={`shift-${suggestion.shift_id}`}
                      value={suggestion.suggested_employee_id}
                      checked={
                        selected[suggestion.shift_id] === suggestion.suggested_employee_id ||
                        !selected[suggestion.shift_id]
                      }
                      onChange={() =>
                        handleSelection(
                          suggestion.shift_id,
                          suggestion.suggested_employee_id
                        )
                      }
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {suggestion.suggested_employee_name}
                      </p>
                      <p className="text-xs text-gray-600">Top match</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  </div>

                  {/* Alternatives */}
                  {suggestion.alternatives?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Other options:
                      </p>
                      {suggestion.alternatives.map((alt, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2"
                        >
                          <input
                            type="radio"
                            name={`shift-${suggestion.shift_id}`}
                            value={alt.employee_id}
                            checked={selected[suggestion.shift_id] === alt.employee_id}
                            onChange={() =>
                              handleSelection(suggestion.shift_id, alt.employee_id)
                            }
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{alt.employee_name}</p>
                            <p className="text-xs text-gray-500">
                              Match score: {alt.score}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : message.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              {message.text}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading || applying}
            className="flex-1"
          >
            Close
          </Button>
          {!suggestions.length ? (
            <Button
              onClick={generateSuggestions}
              disabled={loading}
              className="flex-1 bg-[#1a9c5b] hover:bg-[#158a4e] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Suggestions
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={applyAssignments}
              disabled={applying || suggestions.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {applying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Apply {suggestions.length} Assignment(s)
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}