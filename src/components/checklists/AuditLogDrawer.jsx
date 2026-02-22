import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, User, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  pass: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  fail: "bg-red-100 text-red-800"
};

const statusIcon = { pass: CheckCircle2, warning: AlertTriangle, fail: XCircle };

export default function AuditLogDrawer({ open, onOpenChange, submission }) {
  if (!submission) return null;

  const Icon = statusIcon[submission.status] || CheckCircle2;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Audit Log — {submission.template_name}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {/* Meta */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={statusColors[submission.status]}>
                <Icon className="w-3 h-3 mr-1" />{submission.status?.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-500">{submission.items_passed}/{submission.items_total} passed</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{submission.submitted_by_name || submission.submitted_by_email || "Unknown"}</div>
              <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{submission.date} {submission.time}</div>
              {submission.location_name && <div className="flex items-center gap-1.5 col-span-2"><MapPin className="w-3.5 h-3.5" />{submission.location_name}</div>}
            </div>
          </div>

          {/* Responses */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Checklist Responses</h3>
            <div className="space-y-2">
              {(submission.responses || []).map((r, i) => (
                <div key={i} className={`flex items-start justify-between p-3 rounded-lg border ${r.passed ? "border-green-100 bg-green-50" : "border-red-100 bg-red-50"}`}>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Value: {r.value || "—"}</p>
                  </div>
                  {r.passed
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  }
                </div>
              ))}
            </div>
          </div>

          {submission.notes && (
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-1">Notes</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{submission.notes}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}