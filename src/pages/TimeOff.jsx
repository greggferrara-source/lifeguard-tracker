import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, Check, X, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import TimeOffDialog from "@/components/timeoff/TimeOffDialog";
import TeamAvailabilityView from "@/components/timeoff/TeamAvailabilityView";

const statusStyles = {
  pending: { badge: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { badge: "bg-emerald-100 text-emerald-700", icon: Check },
  denied: { badge: "bg-red-100 text-red-700", icon: X },
};

export default function TimeOff() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [availabilityRange, setAvailabilityRange] = useState({
    start: "",
    end: "",
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["timeoff-all"],
    queryFn: () => base44.entities.TimeOffRequest.list("-created_date", 200),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const createRequest = useMutation({
    mutationFn: (data) => base44.entities.TimeOffRequest.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["timeoff-all"] });
      setDialogOpen(false);
      await base44.functions.invoke("timeOffNotifications", {
        timeoff_request_id: "new",
        action: "submitted",
      });
    },
  });

  const updateRequest = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TimeOffRequest.update(id, data),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["timeoff-all"] });
      const action = variables.data.status === "approved" ? "approved" : "denied";
      await base44.functions.invoke("timeOffNotifications", {
        timeoff_request_id: variables.id,
        action,
      });
    },
  });

  const handleSubmit = async (formData) => {
    const emp = employees.find((e) => e.id === formData.employee_id);
    createRequest.mutate({
      ...formData,
      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : "",
    });
  };

  const filtered = tab === "all" ? requests : requests.filter((r) => r.status === tab);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Time Off</h1>
        <p className="text-gray-400 mt-2 text-lg">Review and manage employee time off requests</p>
      </div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-gray-100 rounded-full p-1">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
            <TabsTrigger value="approved" className="text-xs">Approved</TabsTrigger>
            <TabsTrigger value="denied" className="text-xs">Denied</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAvailability(!showAvailability)}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <Eye className="w-4 h-4 mr-1" />
            Team Availability
          </Button>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#1a9c5b] hover:bg-[#158a4e] rounded-full"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Request
          </Button>
        </div>
      </div>

      {/* Team Availability View */}
      {showAvailability && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Start Date</label>
              <input
                type="date"
                value={availabilityRange.start}
                onChange={(e) =>
                  setAvailabilityRange({ ...availabilityRange, start: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">End Date</label>
              <input
                type="date"
                value={availabilityRange.end}
                onChange={(e) =>
                  setAvailabilityRange({ ...availabilityRange, end: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <TeamAvailabilityView
            requests={requests}
            employees={employees}
            dateRange={availabilityRange}
          />
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No time off requests</p>
          </div>
        )}
        {filtered.map((req, i) => {
          const style = statusStyles[req.status] || statusStyles.pending;
          const StatusIcon = style.icon;
          return (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="p-4 border-0 shadow-sm">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center text-xs font-bold text-cyan-700 flex-shrink-0">
                      {(req.employee_name || "?")[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">
                        {req.employee_name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {req.start_date} → {req.end_date}
                      </p>
                      {req.reason && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{req.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`text-[10px] ${style.badge}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {req.status}
                    </Badge>
                    {req.status === "pending" && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-emerald-600 hover:bg-emerald-50"
                          onClick={() =>
                            updateRequest.mutate({
                              id: req.id,
                              data: { status: "approved" },
                            })
                          }
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:bg-red-50"
                          onClick={() =>
                            updateRequest.mutate({
                              id: req.id,
                              data: { status: "denied" },
                            })
                          }
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Create Dialog */}
      <TimeOffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employees={employees}
        onSubmit={handleSubmit}
        isLoading={createRequest.isPending}
      />
    </div>
  );
}