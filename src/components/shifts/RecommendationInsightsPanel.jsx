import React from "react";
import { Info, AlertTriangle } from "lucide-react";

export default function RecommendationInsightsPanel({ insights, riskFlags }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-blue-800">AI Insights</h3>
          </div>
          <ul className="space-y-1.5">
            {insights.map((ins, i) => (
              <li key={i} className="text-xs text-blue-700 flex items-start gap-1.5">
                <span className="mt-0.5 text-blue-400">•</span>
                {ins}
              </li>
            ))}
          </ul>
        </div>
      )}

      {riskFlags.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-bold text-red-800">Risk Flags</h3>
          </div>
          <ul className="space-y-1.5">
            {riskFlags.map((flag, i) => (
              <li key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                <span className="mt-0.5 text-red-400">⚠</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}