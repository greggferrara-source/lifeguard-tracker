import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, AlertCircle, Info, Eye, CheckCircle2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const typeConfig = {
  error: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  warning: { icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-50" },
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50" },
};

export default function ErrorLogs() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("unresolved");
  const [selectedLog, setSelectedLog] = useState(null);

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

  const { data: logs = [] } = useQuery({
    queryKey: ["system-logs"],
    queryFn: () => base44.entities.SystemLog.list("-created_date", 200),
    refetchInterval: 30000,
  });

  const resolveLog = useMutation({
    mutationFn: (id) => base44.entities.SystemLog.update(id, { resolved: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["system-logs"] }),
  });

  const deleteLog = useMutation({
    mutationFn: (id) => base44.entities.SystemLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["system-logs"] }),
  });

  if (user && user.role !== "admin") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">Error logs are only available to administrators.</p>
      </div>
    );
  }

  const filtered = tab === "unresolved"
    ? logs.filter(l => !l.resolved)
    : tab === "errors"
    ? logs.filter(l => l.type === "error" && !l.resolved)
    : logs.filter(l => l.resolved);

  const unresolvedCount = logs.filter(l => !l.resolved).length;
  const errorCount = logs.filter(l => l.type === "error" && !l.resolved).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Error Logs</h1>
          <p className="text-gray-500 mt-2">{unresolvedCount} unresolved · {errorCount} critical</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-gray-100 rounded-full p-1">
          <TabsTrigger value="unresolved" className="text-xs">
            Unresolved {unresolvedCount > 0 && <span className="ml-1.5 bg-amber-500 text-white rounded-full px-1.5 text-[10px]">{unresolvedCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="errors" className="text-xs">
            Errors {errorCount > 0 && <span className="ml-1.5 bg-red-500 text-white rounded-full px-1.5 text-[10px]">{errorCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs">Resolved</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Log List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-50 text-emerald-400" />
            <p className="font-medium">All clear!</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((log, i) => {
              const cfg = typeConfig[log.type] || typeConfig.info;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card className={`p-4 border ${cfg.bg}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-slate-900">{log.message}</p>
                            <Badge className="text-[10px]">{log.category}</Badge>
                          </div>
                          {log.user_email && <p className="text-xs text-slate-600 mt-1">User: {log.user_email}</p>}
                          <p className="text-xs text-slate-500 mt-1">{format(new Date(log.created_date), "MMM d, h:mm a")}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {log.context && (
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 rounded-lg hover:bg-slate-200/50"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                        )}
                        {!log.resolved && (
                          <button
                            onClick={() => resolveLog.mutate(log.id)}
                            className="p-1.5 rounded-lg hover:bg-emerald-100"
                            title="Mark resolved"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteLog.mutate(log.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Error Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Message</p>
                <p className="text-gray-900 mt-1">{selectedLog.message}</p>
              </div>
              {selectedLog.context && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Stack Trace</p>
                  <pre className="bg-gray-50 rounded-lg p-3 mt-1 text-xs overflow-x-auto text-gray-700">
                    {selectedLog.context}
                  </pre>
                </div>
              )}
              {selectedLog.user_email && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold">User</p>
                  <p className="text-gray-900 mt-1">{selectedLog.user_email}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 font-semibold">Time</p>
                <p className="text-gray-900 mt-1">{format(new Date(selectedLog.created_date), "PPpp")}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedLog(null)}
              className="w-full mt-6 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}