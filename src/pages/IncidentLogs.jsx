import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import LogIncidentForm from "@/components/incidents/LogIncidentForm";
import IncidentDetailDrawer from "@/components/incidents/IncidentDetailDrawer";
import IncidentAIInsights from "@/components/incidents/IncidentAIInsights";

const typeStyle = { rescue: "bg-red-100 text-red-700", incident: "bg-orange-100 text-orange-700", near_miss: "bg-yellow-100 text-yellow-700", first_aid: "bg-blue-100 text-blue-700", injury: "bg-purple-100 text-purple-700", other: "bg-gray-100 text-gray-600" };
const severityStyle = { minor: "bg-green-100 text-green-700", moderate: "bg-yellow-100 text-yellow-700", serious: "bg-orange-100 text-orange-700", critical: "bg-red-100 text-red-700" };
const statusStyle = { open: "bg-red-100 text-red-700", reviewed: "bg-yellow-100 text-yellow-700", closed: "bg-green-100 text-green-700" };

export default function IncidentLogs() {
  const [logOpen, setLogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: logs = [] } = useQuery({ queryKey: ["incident-logs"], queryFn: () => base44.entities.IncidentLog.list("-created_date", 200), refetchInterval: 30000 });
  
  const locationId = logs.length > 0 ? logs[0].location_id : null;

  const filtered = filterType === "all" ? logs : logs.filter(l => l.type === filterType);
  const openCount = logs.filter(l => l.status === "open").length;
  const rescueCount = logs.filter(l => l.type === "rescue").length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incident & Rescue Logs</h1>
          <p className="text-gray-500 mt-1">{openCount} open · {rescueCount} rescues total</p>
        </div>
        <Button onClick={() => setLogOpen(true)} className="bg-red-600 hover:bg-red-700 gap-2 font-semibold">
          <Plus className="w-4 h-4" /> Log Incident
        </Button>
      </div>

      {/* AI Insights */}
      {locationId && <IncidentAIInsights locationId={locationId} />}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Incidents", value: logs.length, color: "text-gray-900" },
          { label: "Open / Unreviewed", value: openCount, color: "text-red-600" },
          { label: "Rescues", value: rescueCount, color: "text-orange-600" },
          { label: "EMS Called", value: logs.filter(l => l.ems_called).length, color: "text-purple-600" },
        ].map((s, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "rescue", "incident", "near_miss", "first_aid", "injury"].map(t => (
          <Button key={t} variant={filterType === t ? "default" : "outline"} size="sm"
            onClick={() => setFilterType(t)}
            className={filterType === t ? "bg-[#1a9c5b] hover:bg-[#158a4e]" : ""}>
            {t === "all" ? "All" : t.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
          </Button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No incidents logged</p>
          </div>
        )}
        {filtered.map(log => (
          <Card key={log.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(log)}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={typeStyle[log.type]}>{log.type?.replace("_", " ")}</Badge>
                    <Badge className={severityStyle[log.severity]}>{log.severity}</Badge>
                    <Badge className={statusStyle[log.status]}>{log.status}</Badge>
                    {log.ems_called && <Badge className="bg-red-100 text-red-700">EMS Called</Badge>}
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-1">{log.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{log.location_name} · {log.date}{log.time ? ` · ${log.time}` : ""} · {log.reporting_staff_name}</p>
                </div>
                {log.status === "open" && <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                {log.status === "closed" && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <LogIncidentForm open={logOpen} onOpenChange={setLogOpen} />
      <IncidentDetailDrawer incident={selected} onClose={() => setSelected(null)} />
    </div>
  );
}