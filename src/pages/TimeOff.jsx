import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, Check, X, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const statusStyles = {
  pending: { badge: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { badge: "bg-emerald-100 text-emerald-700", icon: Check },
  denied: { badge: "bg-red-100 text-red-700", icon: X },
};

export default function TimeOff() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
    reason: "",
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeoff-all"] });
      setDialogOpen(false);
    },
  });

  const updateRequest = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TimeOffRequest.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timeoff-all"] }),
  });

  const handleCreate = () => {
    const emp = employees.find((e) => e.id === form.employee_id);
    createRequest.mutate({
      ...form,
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
        <Button
          onClick={() => {
            setForm({ employee_id: "", start_date: "", end_date: "", reason: "" });
            setDialogOpen(true);
          }}
          className="bg-[#1a9c5b] hover:bg-[#158a4e] rounded-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Request
        </Button>
      </div>

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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Time Off Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Employee</Label>
              <Select
                value={form.employee_id}
                onValueChange={(v) => setForm({ ...form, employee_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter((e) => e.status === "active")
                    .map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.first_name} {e.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Reason</Label>
              <Textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Optional reason..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-700">
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}