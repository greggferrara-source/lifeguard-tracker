import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, Calendar, Check, X, AlertCircle } from "lucide-react";
import TimeOffDialog from "@/components/timeoff/TimeOffDialog";

const statusConfig = {
  pending:  { label: "Pending",  bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-400" },
  approved: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  denied:   { label: "Denied",   bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-400" },
};

function haptic() { if (navigator.vibrate) navigator.vibrate(8); }

export default function MobileTimeOff() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState("pending");

  const { data: requests = [] } = useQuery({ queryKey: ["time-off-requests"], queryFn: () => base44.entities.TimeOffRequest.list("-created_date", 200) });
  const { data: user } = useQuery({ queryKey: ["current-user"], queryFn: () => base44.auth.me() });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.list() });

  const createRequest = useMutation({ mutationFn: (data) => base44.entities.TimeOffRequest.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["time-off-requests"] }); setDialogOpen(false); setSelectedRequest(null); } });
  const updateRequest = useMutation({ mutationFn: ({ id, data }) => base44.entities.TimeOffRequest.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["time-off-requests"] }); setDialogOpen(false); } });

  const isManager = user?.role === "admin" || user?.role === "manager";

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    denied: requests.filter((r) => r.status === "denied").length,
  };

  const filtered = useMemo(() => {
    if (filterStatus === "all") return requests;
    return requests.filter((r) => r.status === filterStatus);
  }, [requests, filterStatus]);

  const handleSave = (formData) => {
    if (selectedRequest) updateRequest.mutate({ id: selectedRequest.id, data: formData });
    else createRequest.mutate(formData);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Time Off</h1>
            <p className="text-sm text-gray-400">Manage requests</p>
          </div>
          {!isManager && (
            <button
              onClick={() => { haptic(); setSelectedRequest(null); setDialogOpen(true); }}
              className="w-11 h-11 bg-[#1a9c5b] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Stats pills */}
        <div className="flex gap-2">
          {[
            { label: "Pending", value: stats.pending, status: "pending" },
            { label: "Approved", value: stats.approved, status: "approved" },
            { label: "Denied", value: stats.denied, status: "denied" },
          ].map((s) => {
            const cfg = statusConfig[s.status];
            const isActive = filterStatus === s.status;
            return (
              <button
                key={s.status}
                onClick={() => { haptic(); setFilterStatus(isActive ? "all" : s.status); }}
                className={`flex-1 py-2.5 rounded-xl transition-all active:scale-95 ${isActive ? cfg.bg : "bg-gray-100"}`}
              >
                <p className={`text-lg font-bold ${isActive ? cfg.text : "text-gray-500"}`}>{s.value}</p>
                <p className={`text-[10px] font-medium ${isActive ? cfg.text : "text-gray-400"}`}>{s.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto px-4 pt-4 space-y-3">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-400">No requests</p>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {filtered.map((req) => {
                const daysCount = differenceInDays(new Date(req.end_date), new Date(req.start_date)) + 1;
                const cfg = statusConfig[req.status] || statusConfig.pending;

                return (
                  <motion.button
                    key={req.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => { haptic(); setSelectedRequest(req); setDialogOpen(true); }}
                    className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{req.employee_name || "Unknown"}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {format(new Date(req.start_date), "MMM d")} – {format(new Date(req.end_date), "MMM d")}
                            <span className="ml-1 text-gray-400">({daysCount}d)</span>
                          </p>
                        </div>
                        {req.reason && <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">{req.reason}</p>}
                        {req.is_partial_day && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                            <AlertCircle className="w-3 h-3" />
                            {req.partial_start_time} – {req.partial_end_time}
                          </div>
                        )}
                      </div>
                      <span className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Manager quick actions */}
                    {isManager && req.status === "pending" && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={(e) => { e.stopPropagation(); haptic(); updateRequest.mutate({ id: req.id, data: { status: "approved" } }); }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl active:scale-95 transition-transform"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); haptic(); updateRequest.mutate({ id: req.id, data: { status: "denied" } }); }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-xl active:scale-95 transition-transform"
                        >
                          <X className="w-3.5 h-3.5" /> Deny
                        </button>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TimeOffDialog open={dialogOpen} onOpenChange={setDialogOpen} request={selectedRequest} employees={employees} onSave={handleSave} />
    </div>
  );
}