import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle, CheckCircle2, XCircle, Info, RefreshCw,
  ShieldAlert, Clock, Users, Award, Zap, CheckCheck, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const typeConfig = {
  understaffing: { icon: Users, color: "text-orange-500", bg: "bg-orange-50 border-orange-200", label: "Understaffing" },
  conflict: { icon: Zap, color: "text-red-500", bg: "bg-red-50 border-red-200", label: "Conflict" },
  callout: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "Call-out" },
  open_shift: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50 border-amber-200", label: "Open Shift" },
  cert_expiry: { icon: Award, color: "text-purple-500", bg: "bg-purple-50 border-purple-200", label: "Cert Expiry" },
  overtime: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50 border-orange-200", label: "Overtime" },
  no_show: { icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "No Show" },
};

const severityBadge = {
  critical: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
};

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("unresolved");
  const [scanning, setScanning] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  // Only admins can view alerts
  if (user && user.role !== "admin") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">
          Alerts are only available to administrators.
        </p>
      </div>
    );
  }

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.list("-created_date", 200),
    refetchInterval: 120000,
  });

  const resolveAlert = useMutation({
    mutationFn: (id) => base44.entities.Alert.update(id, { resolved: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const deleteAlert = useMutation({
    mutationFn: (id) => base44.entities.Alert.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const resolveAll = useMutation({
    mutationFn: async () => {
      const unresolved = alerts.filter(a => !a.resolved);
      await Promise.all(unresolved.map(a => base44.entities.Alert.update(a.id, { resolved: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const handleScan = async () => {
    setScanning(true);
    const today = new Date().toISOString().split("T")[0];
    await Promise.all([
      base44.functions.invoke("sendAlerts", { alert_type: "scan_understaffing", date: today }),
      base44.functions.invoke("sendAlerts", { alert_type: "scan_conflicts", date: today }),
      base44.functions.invoke("sendAlerts", { alert_type: "scan_cert_expiry" }),
    ]);
    await queryClient.invalidateQueries({ queryKey: ["alerts"] });
    setScanning(false);
  };

  const filtered = tab === "unresolved"
    ? alerts.filter(a => !a.resolved)
    : tab === "critical"
    ? alerts.filter(a => a.severity === "critical" && !a.resolved)
    : alerts.filter(a => a.resolved);

  const unresolvedCount = alerts.filter(a => !a.resolved).length;
  const criticalCount = alerts.filter(a => a.severity === "critical" && !a.resolved).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Alerts</h1>
          <p className="text-gray-500 mt-2">
            {unresolvedCount} unresolved · {criticalCount} critical
          </p>
        </div>
        <div className="flex gap-2">
          {unresolvedCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => resolveAll.mutate()} disabled={resolveAll.isPending}>
              <CheckCheck className="w-4 h-4 mr-1" />
              Resolve All
            </Button>
          )}
          <Button
            size="sm"
            className="bg-[#1a9c5b] hover:bg-[#158a4e] rounded-full"
            onClick={handleScan}
            disabled={scanning}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Scanning..." : "Run Scan"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-gray-100 rounded-full p-1">
          <TabsTrigger value="unresolved" className="text-xs">
            Unresolved {unresolvedCount > 0 && <span className="ml-1.5 bg-amber-500 text-white rounded-full px-1.5 py-0 text-[10px]">{unresolvedCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="critical" className="text-xs">
            Critical {criticalCount > 0 && <span className="ml-1.5 bg-red-500 text-white rounded-full px-1.5 py-0 text-[10px]">{criticalCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs">Resolved</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Alert List */}
      <div className="space-y-4">
        {isLoading && <p className="text-sm text-slate-400 text-center py-8">Loading alerts...</p>}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-50 text-emerald-400" />
            <p className="font-medium text-slate-600">
              {tab === "unresolved" ? "All clear! No unresolved alerts." : "No alerts here."}
            </p>
            {tab === "unresolved" && <p className="text-sm mt-1">Run a scan to check for issues.</p>}
          </div>
        )}
        <AnimatePresence>
          {filtered.map((alert, i) => {
            const cfg = typeConfig[alert.type] || typeConfig.understaffing;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className={`p-4 border ${cfg.bg} shadow-sm`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-slate-900">{alert.title}</p>
                          <Badge className={`text-[10px] ${severityBadge[alert.severity]}`}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                          {alert.date && <span>📅 {alert.date}</span>}
                          {alert.location_name && <span>📍 {alert.location_name}</span>}
                          {alert.employee_name && <span>👤 {alert.employee_name}</span>}
                          {alert.created_date && <span>{format(new Date(alert.created_date), "MMM d, h:mm a")}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!alert.resolved && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => resolveAlert.mutate(alert.id)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => deleteAlert.mutate(alert.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}