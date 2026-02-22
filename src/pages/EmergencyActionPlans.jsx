import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Shield, AlertTriangle, ChevronRight, Clock, CheckCircle2, FileText } from "lucide-react";
import EAPDialog from "@/components/eap/EAPDialog";
import EAPDetailDrawer from "@/components/eap/EAPDetailDrawer";

const TYPE_CONFIG = {
  drowning: { label: "Drowning / Submersion", color: "bg-blue-100 text-blue-700", icon: "🌊" },
  spinal_injury: { label: "Spinal Injury", color: "bg-purple-100 text-purple-700", icon: "🦴" },
  lightning: { label: "Lightning / Severe Weather", color: "bg-yellow-100 text-yellow-700", icon: "⚡" },
  missing_patron: { label: "Missing Patron", color: "bg-orange-100 text-orange-700", icon: "🔍" },
  chemical_leak: { label: "Chemical Leak", color: "bg-red-100 text-red-700", icon: "⚗️" },
  fire: { label: "Fire / Evacuation", color: "bg-red-100 text-red-700", icon: "🔥" },
  medical_emergency: { label: "Medical Emergency", color: "bg-pink-100 text-pink-700", icon: "🚑" },
  active_threat: { label: "Active Threat", color: "bg-gray-100 text-gray-700", icon: "🚨" },
  other: { label: "Other", color: "bg-gray-100 text-gray-600", icon: "📋" },
};

export default function EmergencyActionPlans() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const qc = useQueryClient();

  const { data: plans = [] } = useQuery({ queryKey: ["eap"], queryFn: () => base44.entities.EmergencyActionPlan.list("-created_date", 100) });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });

  const today = new Date().toISOString().split("T")[0];
  const overduePlans = plans.filter(p => p.next_review_due && p.next_review_due < today);
  const activePlans = plans.filter(p => p.is_active !== false);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Emergency Action Plans</h1>
          <p className="text-gray-500 mt-1">OSHA & state-required emergency response procedures</p>
        </div>
        <Button onClick={() => { setEditPlan(null); setDialogOpen(true); }} className="bg-red-600 hover:bg-red-700 gap-2 font-semibold">
          <Plus className="w-4 h-4" /> New EAP
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total EAPs", value: plans.length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active", value: activePlans.length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          { label: "Review Overdue", value: overduePlans.length, icon: Clock, color: overduePlans.length > 0 ? "text-red-600" : "text-gray-500", bg: overduePlans.length > 0 ? "bg-red-50" : "bg-gray-50" },
          { label: "Locations Covered", value: new Set(plans.map(p => p.location_id).filter(Boolean)).size, icon: Shield, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-5`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Overdue review warning */}
      {overduePlans.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">{overduePlans.length} plan{overduePlans.length > 1 ? "s" : ""} overdue for review</p>
            <p className="text-sm text-red-600 mt-0.5">{overduePlans.map(p => p.title).join(", ")}</p>
          </div>
        </div>
      )}

      {/* EAP Grid by Type */}
      {Object.entries(TYPE_CONFIG).map(([type, config]) => {
        const typePlans = activePlans.filter(p => p.type === type);
        if (typePlans.length === 0) return null;
        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{config.icon}</span>
              <h2 className="text-base font-semibold text-gray-800">{config.label}</h2>
              <Badge className={`ml-1 text-xs ${config.color}`}>{typePlans.length}</Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {typePlans.map(plan => (
                <Card key={plan.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedPlan(plan)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{plan.title}</p>
                        {plan.location_name && <p className="text-xs text-gray-500 mt-0.5">📍 {plan.location_name}</p>}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">v{plan.version || "1.0"}</Badge>
                          <span className="text-xs text-gray-400">{plan.steps?.length || 0} steps</span>
                          {plan.next_review_due && (
                            <span className={`text-xs ${plan.next_review_due < today ? "text-red-600 font-semibold" : "text-gray-400"}`}>
                              Review: {plan.next_review_due}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="text-xs text-gray-500" onClick={e => { e.stopPropagation(); setEditPlan(plan); setDialogOpen(true); }}>
                          Edit
                        </Button>
                        <ChevronRight className="w-4 h-4 text-gray-300 self-center" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {activePlans.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Shield className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-gray-500">No Emergency Action Plans yet</p>
          <p className="text-sm mt-1">Create plans for drowning response, weather emergencies, and more</p>
          <Button onClick={() => setDialogOpen(true)} className="mt-4 bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" /> Create First EAP
          </Button>
        </div>
      )}

      <EAPDialog open={dialogOpen} onOpenChange={setDialogOpen} plan={editPlan} locations={locations} />
      <EAPDetailDrawer plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
    </div>
  );
}