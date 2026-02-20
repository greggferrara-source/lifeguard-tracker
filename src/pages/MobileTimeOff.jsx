import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Clock, AlertCircle } from "lucide-react";
import TimeOffDialog from "@/components/timeoff/TimeOffDialog";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  denied: "bg-red-100 text-red-700",
};

export default function MobileTimeOff() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState("pending");

  const { data: requests = [] } = useQuery({
    queryKey: ["time-off-requests"],
    queryFn: () => base44.entities.TimeOffRequest.list("-created_date", 200),
  });

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const createRequest = useMutation({
    mutationFn: (data) => base44.entities.TimeOffRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      setDialogOpen(false);
      setSelectedRequest(null);
    },
  });

  const updateRequest = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TimeOffRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      setDialogOpen(false);
    },
  });

  const isManager = user?.role === "admin" || user?.role === "manager";

  const filtered = useMemo(() => {
    let result = requests;
    if (filterStatus !== "all") {
      result = result.filter((r) => r.status === filterStatus);
    }
    return result;
  }, [requests, filterStatus]);

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    denied: requests.filter((r) => r.status === "denied").length,
  };

  const handleSave = (formData) => {
    if (selectedRequest) {
      updateRequest.mutate({ id: selectedRequest.id, data: formData });
    } else {
      createRequest.mutate(formData);
    }
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Time Off</h1>
        <p className="text-sm text-gray-500">Manage time off requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Pending", value: stats.pending, color: "text-yellow-600" },
          { label: "Approved", value: stats.approved, color: "text-green-600" },
          { label: "Denied", value: stats.denied, color: "text-red-600" },
        ].map((s, i) => (
          <Card key={i} className="border-gray-200">
            <CardContent className="pt-3 pb-3 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Button */}
      {!isManager && (
        <Button
          onClick={() => {
            setSelectedRequest(null);
            setDialogOpen(true);
          }}
          className="w-full bg-[#1a9c5b] hover:bg-[#158a4e]"
        >
          <Plus className="w-4 h-4 mr-2" /> Request Time Off
        </Button>
      )}

      {/* Filter Tabs */}
      {isManager && (
        <div className="flex gap-2 overflow-x-auto">
          {[
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Denied", value: "denied" },
            { label: "All", value: "all" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filterStatus === tab.value
                  ? "bg-[#1a9c5b] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-gray-500 text-sm">No time off requests</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((req) => {
            const daysRequested = differenceInDays(new Date(req.end_date), new Date(req.start_date)) + 1;

            return (
              <Card
                key={req.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedRequest(req);
                  setDialogOpen(true);
                }}
              >
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{req.employee_name}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(req.start_date), "MMM d")} –{" "}
                          {format(new Date(req.end_date), "MMM d")}
                        </p>
                      </div>
                      <Badge className={`text-xs rounded-full ${statusStyles[req.status]}`}>
                        {req.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      {daysRequested} day{daysRequested !== 1 ? "s" : ""}
                    </div>

                    {req.reason && (
                      <p className="text-xs text-gray-600 line-clamp-2">{req.reason}</p>
                    )}

                    {req.is_partial_day && (
                      <div className="flex items-center gap-2 text-xs text-amber-600">
                        <AlertCircle className="w-3 h-3" />
                        Partial day: {req.partial_start_time} – {req.partial_end_time}
                      </div>
                    )}

                    {isManager && req.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateRequest.mutate({
                              id: req.id,
                              data: { status: "approved" },
                            });
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateRequest.mutate({
                              id: req.id,
                              data: { status: "denied" },
                            });
                          }}
                        >
                          Deny
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <TimeOffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        request={selectedRequest}
        employees={employees}
        onSave={handleSave}
      />
    </div>
  );
}