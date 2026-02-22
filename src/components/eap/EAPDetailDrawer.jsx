import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Phone, MapPin, Clock } from "lucide-react";

const TYPE_CONFIG = {
  drowning: { label: "Drowning / Submersion", icon: "🌊" },
  spinal_injury: { label: "Spinal Injury", icon: "🦴" },
  lightning: { label: "Lightning / Severe Weather", icon: "⚡" },
  missing_patron: { label: "Missing Patron", icon: "🔍" },
  chemical_leak: { label: "Chemical Leak", icon: "⚗️" },
  fire: { label: "Fire / Evacuation", icon: "🔥" },
  medical_emergency: { label: "Medical Emergency", icon: "🚑" },
  active_threat: { label: "Active Threat", icon: "🚨" },
  other: { label: "Other", icon: "📋" },
};

export default function EAPDetailDrawer({ plan, onClose }) {
  if (!plan) return null;
  const config = TYPE_CONFIG[plan.type] || TYPE_CONFIG.other;
  const today = new Date().toISOString().split("T")[0];
  const isOverdue = plan.next_review_due && plan.next_review_due < today;

  return (
    <Sheet open={!!plan} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">{config.icon}</span>
            {plan.title}
          </SheetTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{config.label}</Badge>
            {plan.location_name && <Badge variant="outline">📍 {plan.location_name}</Badge>}
            <Badge variant="outline">v{plan.version || "1.0"}</Badge>
            {isOverdue && <Badge className="bg-red-100 text-red-700">Review Overdue</Badge>}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Review dates */}
          {(plan.last_reviewed || plan.next_review_due) && (
            <div className="bg-gray-50 rounded-xl p-4 flex gap-6">
              {plan.last_reviewed && <div><p className="text-xs text-gray-400">Last Reviewed</p><p className="font-medium text-gray-900">{plan.last_reviewed}</p></div>}
              {plan.next_review_due && <div><p className="text-xs text-gray-400">Next Review Due</p><p className={`font-medium ${isOverdue ? "text-red-600" : "text-gray-900"}`}>{plan.next_review_due}</p></div>}
            </div>
          )}

          {/* Equipment locations */}
          {plan.equipment_locations && (
            <div>
              <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2"><MapPin className="w-4 h-4" /> Equipment Locations</h3>
              <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">{plan.equipment_locations}</p>
            </div>
          )}

          {/* Response Steps */}
          {plan.steps?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Response Steps</h3>
              <div className="space-y-3">
                {plan.steps.map((step, i) => (
                  <div key={step.id || i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#1a9c5b] text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{step.title}</p>
                        <div className="flex gap-2 text-xs">
                          {step.responsible_role && <Badge variant="outline" className="text-xs">{step.responsible_role}</Badge>}
                          {step.time_target && <span className="text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{step.time_target}</span>}
                        </div>
                      </div>
                      {step.description && <p className="text-sm text-gray-600 mt-1">{step.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Contacts */}
          {plan.emergency_contacts?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3"><Phone className="w-4 h-4" /> Emergency Contacts</h3>
              <div className="space-y-2">
                {plan.emergency_contacts.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.role}</p>
                    </div>
                    {c.phone && <a href={`tel:${c.phone}`} className="text-[#1a9c5b] font-medium text-sm hover:underline">{c.phone}</a>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {plan.notes && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{plan.notes}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}