import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, X, AlertTriangle, MapPin, User, Calendar } from "lucide-react";

const STATUS_CONFIG = {
  pass: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", label: "Pass" },
  warning: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", label: "Warning" },
  fail: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", label: "Fail" },
};

export default function SubmissionDetailDrawer({ submission, onClose }) {
  if (!submission) return null;
  const sc = STATUS_CONFIG[submission.status] || STATUS_CONFIG.pass;

  return (
    <Sheet open={!!submission} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {submission.form_name}
            <Badge className={`${sc.bg} ${sc.text} border ${sc.border} ml-2`}>{sc.label}</Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600"><User className="w-4 h-4" />{submission.submitted_by_name || submission.submitted_by_email}</div>
            <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4" />{submission.date} {submission.time && `· ${submission.time}`}</div>
            {submission.location_name && (
              <div className="flex items-center gap-2 text-gray-600 col-span-2"><MapPin className="w-4 h-4" />{submission.location_name}</div>
            )}
          </div>

          {/* Responses */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Responses</p>
            <div className="space-y-2">
              {(submission.responses || []).map((r, idx) => (
                <div key={idx} className={`flex items-start justify-between gap-3 p-3 rounded-xl border ${r.passed === false ? "bg-red-50 border-red-200" : "bg-white border-gray-100"}`}>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.label}</p>
                    {r.value && <p className="text-xs text-gray-500 mt-0.5 capitalize">{r.value}</p>}
                  </div>
                  {(r.type === "pass_fail" || r.type === "yes_no") && (
                    r.passed
                      ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      : <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {submission.notes && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">Notes</p>
              <p className="text-sm text-blue-800">{submission.notes}</p>
            </div>
          )}

          {submission.has_alerts && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-orange-700">This submission triggered one or more alerts due to failed items.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}