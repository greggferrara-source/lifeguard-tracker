import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronDown, Check, AlertCircle, Loader2 } from "lucide-react";

export default function RecommendationsPanel({ recommendations, onApply, isLoading, openShiftsCount }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6 text-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <p className="text-sm text-gray-600">Generating recommendations...</p>
            </div>
          ) : openShiftsCount === 0 ? (
            <p className="text-sm text-gray-600">All shifts are assigned. Generate recommendations to optimize existing assignments.</p>
          ) : (
            <p className="text-sm text-gray-600">No recommendations available yet. Click "Get AI Recommendations" to analyze open shifts.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  const highConfidence = recommendations.filter(r => r.confidence === 'high');
  const mediumConfidence = recommendations.filter(r => r.confidence === 'medium');
  const lowConfidence = recommendations.filter(r => r.confidence === 'low');

  const confidenceConfig = {
    high: { color: 'bg-green-100 text-green-800', icon: '✓' },
    medium: { color: 'bg-yellow-100 text-yellow-800', icon: '○' },
    low: { color: 'bg-orange-100 text-orange-800', icon: '?' },
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <CardTitle>AI Shift Recommendations</CardTitle>
          </div>
          <Badge variant="outline">{recommendations.length} recommendations</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence>
          {recommendations.map((rec, idx) => {
            const config = confidenceConfig[rec.confidence];
            const isExpanded = expandedId === rec.shift_id;

            return (
              <motion.div key={rec.shift_id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : rec.shift_id)}
                  className="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Badge className={`${config.color} font-bold px-2 py-1`}>{config.icon}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{rec.employee_name}</p>
                      <p className="text-xs text-gray-500 truncate">{rec.reason}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gray-200 bg-gray-50 p-3 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Why this match?</p>
                        <p className="text-sm text-gray-700 mt-1">{rec.reason}</p>
                      </div>

                      {rec.alternative_ids && rec.alternative_ids.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Alternatives</p>
                          <p className="text-xs text-gray-600 mt-1">{rec.alternative_ids.join(', ')}</p>
                        </div>
                      )}

                      <Button
                        size="sm"
                        onClick={() => onApply(rec)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-3 h-3 mr-1" /> Apply Recommendation
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-white rounded border border-green-100">
            <p className="font-semibold text-green-700">{highConfidence.length}</p>
            <p className="text-gray-600">High Confidence</p>
          </div>
          <div className="text-center p-2 bg-white rounded border border-yellow-100">
            <p className="font-semibold text-yellow-700">{mediumConfidence.length}</p>
            <p className="text-gray-600">Medium</p>
          </div>
          <div className="text-center p-2 bg-white rounded border border-orange-100">
            <p className="font-semibold text-orange-700">{lowConfidence.length}</p>
            <p className="text-gray-600">Low</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}