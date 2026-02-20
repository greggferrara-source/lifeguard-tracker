import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, CheckCircle2, XCircle, Clock, Calendar, MapPin, Plus } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  pending_employee: { label: "Awaiting Employee", color: "bg-yellow-100 text-yellow-700" },
  pending_manager: { label: "Awaiting Manager", color: "bg-blue-100 text-blue-700" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700" },
  denied: { label: "Denied", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-500" },
};

export default function ShiftSwaps() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("pending");
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [managerNotes, setManagerNotes] = useState("");
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [reqMyShiftId, setReqMyShiftId] = useState("");
  const [reqTargetShiftId, setReqTargetShiftId] = useState("");
  const [reqMessage, setReqMessage] = useState("");

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const { data: swaps = [] } = useQuery({
    queryKey: ["shift-swaps"],
    queryFn: () => base44.entities.ShiftSwapRequest.list("-created_date", 200),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const { data: allShifts = [] } = useQuery({
    queryKey: ["shifts-upcoming"],
    queryFn: () => base44.entities.Shift.list("-date", 500),
  });

  const isManagerOrAdmin = user?.role === "admin" || user?.role === "manager";

  // Shifts belonging to current user (match by email via employee records)
  const myEmployee = employees.find(e => e.email === user?.email);
  const today = new Date().toISOString().split("T")[0];
  const myShifts = allShifts.filter(s => s.employee_id === myEmployee?.id && s.date >= today && s.status === "scheduled");
  const otherShifts = allShifts.filter(s => s.employee_id && s.employee_id !== myEmployee?.id && s.date >= today && s.status === "scheduled");
  const empMap = Object.fromEntries(employees.map(e => [e.id, e]));

  const myShiftObj = myShifts.find(s => s.id === reqMyShiftId);
  const targetShiftObj = otherShifts.find(s => s.id === reqTargetShiftId);
  const targetEmp = targetShiftObj ? empMap[targetShiftObj.employee_id] : null;

  const createSwap = useMutation({
    mutationFn: (data) => base44.entities.ShiftSwapRequest.create(data),
    onSuccess: async (newSwap) => {
      queryClient.invalidateQueries({ queryKey: ["shift-swaps"] });
      await base44.functions.invoke("shiftSwapNotify", { swap_request_id: newSwap.id, action: "new_request" });
      setRequestDialogOpen(false);
      setReqMyShiftId(""); setReqTargetShiftId(""); setReqMessage("");
    },
  });

  const handleRequestSubmit = () => {
    if (!myShiftObj || !targetShiftObj || !myEmployee) return;
    createSwap.mutate({
      requester_employee_id: myEmployee.id,
      requester_employee_name: `${myEmployee.first_name} ${myEmployee.last_name}`,
      requester_shift_id: myShiftObj.id,
      requester_shift_date: myShiftObj.date,
      requester_shift_time: `${myShiftObj.start_time}–${myShiftObj.end_time}`,
      requester_shift_location: myShiftObj.location_name,
      target_employee_id: targetShiftObj.employee_id,
      target_employee_name: `${targetEmp?.first_name || ""} ${targetEmp?.last_name || ""}`.trim(),
      target_shift_id: targetShiftObj.id,
      target_shift_date: targetShiftObj.date,
      target_shift_time: `${targetShiftObj.start_time}–${targetShiftObj.end_time}`,
      target_shift_location: targetShiftObj.location_name,
      requester_message: reqMessage,
      status: "pending_employee",
    });
  };

  const updateSwap = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShiftSwapRequest.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shift-swaps"] }),
  });

  const handleEmployeeResponse = async (swap, response) => {
    const newStatus = response === "accepted" ? "pending_manager" : "denied";
    await updateSwap.mutateAsync({ id: swap.id, data: { status: newStatus, employee_response: response } });
    await base44.functions.invoke("shiftSwapNotify", {
      swap_request_id: swap.id,
      action: response === "accepted" ? "employee_accepted" : "employee_declined"
    });
  };

  const handleManagerDecision = async (approved) => {
    const action = approved ? "manager_approved" : "manager_denied";
    await updateSwap.mutateAsync({
      id: selectedSwap.id,
      data: { status: approved ? "approved" : "denied", manager_notes: managerNotes }
    });

    if (approved) {
      // Actually swap the shifts
      const shifts = await base44.entities.Shift.list("-date", 500);
      const reqShift = shifts.find(s => s.id === selectedSwap.requester_shift_id);
      const tgtShift = shifts.find(s => s.id === selectedSwap.target_shift_id);
      if (reqShift && tgtShift) {
        await Promise.all([
          base44.entities.Shift.update(reqShift.id, {
            employee_id: tgtShift.employee_id,
            employee_name: tgtShift.employee_name,
            color: tgtShift.color,
          }),
          base44.entities.Shift.update(tgtShift.id, {
            employee_id: reqShift.employee_id,
            employee_name: reqShift.employee_name,
            color: reqShift.color,
          }),
        ]);
      }
    }

    await base44.functions.invoke("shiftSwapNotify", {
      swap_request_id: selectedSwap.id,
      action
    });
    setManagerDialogOpen(false);
    setSelectedSwap(null);
    setManagerNotes("");
  };

  const pending = swaps.filter(s => s.status === "pending_employee" || s.status === "pending_manager");
  const history = swaps.filter(s => s.status === "approved" || s.status === "denied" || s.status === "cancelled");
  const displayed = tab === "pending" ? pending : history;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Shift Swaps</h1>
          <p className="text-gray-400 mt-2 text-lg">Manage shift swap requests and approvals</p>
        </div>
        {myEmployee && (
          <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2" onClick={() => setRequestDialogOpen(true)}>
            <Plus className="w-4 h-4" /> Request Swap
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-gray-100 rounded-full p-1">
          <TabsTrigger value="pending" className="rounded-full text-sm">
            Pending {pending.length > 0 && <span className="ml-1.5 bg-orange-500 text-white text-[10px] font-bold rounded-full px-1.5">{pending.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-full text-sm">History</TabsTrigger>
        </TabsList>
      </Tabs>

      {displayed.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-2xl">
          <ArrowLeftRight className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-medium">No {tab === "pending" ? "pending" : ""} swap requests</p>
        </div>
      )}

      <div className="space-y-4">
        {displayed.map(swap => {
          const cfg = statusConfig[swap.status] || statusConfig.pending_employee;
          return (
            <Card key={swap.id} className="p-5 border border-gray-100 shadow-none rounded-2xl">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`text-xs rounded-full ${cfg.color}`}>{cfg.label}</Badge>
                    <span className="text-xs text-slate-400">
                      {swap.created_date ? format(new Date(swap.created_date), "MMM d, yyyy") : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <p className="text-xs font-bold text-blue-900 mb-1">{swap.requester_employee_name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-blue-700">
                        <Calendar className="w-3 h-3" /> {swap.requester_shift_date}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-blue-700 mt-0.5">
                        <Clock className="w-3 h-3" /> {swap.requester_shift_time}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-blue-700 mt-0.5">
                        <MapPin className="w-3 h-3" /> {swap.requester_shift_location}
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl">
                      <p className="text-xs font-bold text-green-900 mb-1">{swap.target_employee_name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-green-700">
                        <Calendar className="w-3 h-3" /> {swap.target_shift_date}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-green-700 mt-0.5">
                        <Clock className="w-3 h-3" /> {swap.target_shift_time}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-green-700 mt-0.5">
                        <MapPin className="w-3 h-3" /> {swap.target_shift_location}
                      </div>
                    </div>
                  </div>
                  {swap.requester_message && (
                    <p className="mt-2 text-xs text-slate-500 italic">"{swap.requester_message}"</p>
                  )}
                  {swap.manager_notes && (
                    <p className="mt-1 text-xs text-slate-500">Manager: {swap.manager_notes}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {swap.status === "pending_employee" && (
                    <>
                      <Button size="sm" className="bg-[#1a9c5b] hover:bg-[#158a4e] rounded-full"
                        onClick={() => handleEmployeeResponse(swap, "accepted")}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => handleEmployeeResponse(swap, "declined")}>
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                      </Button>
                    </>
                  )}
                  {swap.status === "pending_manager" && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-full"
                      onClick={() => { setSelectedSwap(swap); setManagerDialogOpen(true); }}>
                      Review
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Employee: Request Swap Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" /> Request Shift Swap</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Shift</Label>
              <Select value={reqMyShiftId} onValueChange={setReqMyShiftId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose one of your upcoming shifts…" />
                </SelectTrigger>
                <SelectContent>
                  {myShifts.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.date} · {s.start_time}–{s.end_time} @ {s.location_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {myShiftObj && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 space-y-0.5">
                  <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {myShiftObj.date}</p>
                  <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {myShiftObj.start_time}–{myShiftObj.end_time}</p>
                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {myShiftObj.location_name}</p>
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Swap With</Label>
              <Select value={reqTargetShiftId} onValueChange={setReqTargetShiftId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a shift to swap with…" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {otherShifts.map(s => {
                    const emp = empMap[s.employee_id];
                    return (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="font-medium">{emp ? `${emp.first_name} ${emp.last_name}` : "?"}</span>
                        <span className="text-slate-500 ml-2">{s.date} {s.start_time}–{s.end_time} @ {s.location_name}</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {targetShiftObj && (
                <div className="mt-2 p-3 bg-green-50 border border-green-100 rounded-xl text-xs text-green-700 space-y-0.5">
                  <p className="font-semibold text-green-900">{targetEmp ? `${targetEmp.first_name} ${targetEmp.last_name}` : ""}</p>
                  <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {targetShiftObj.date}</p>
                  <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {targetShiftObj.start_time}–{targetShiftObj.end_time}</p>
                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {targetShiftObj.location_name}</p>
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Message (optional)</Label>
              <Textarea value={reqMessage} onChange={e => setReqMessage(e.target.value)} placeholder="Explain why you'd like to swap…" rows={2} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
            <Button disabled={!reqMyShiftId || !reqTargetShiftId || createSwap.isPending} onClick={handleRequestSubmit} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
              Send Swap Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manager approval dialog */}
      <Dialog open={managerDialogOpen} onOpenChange={setManagerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manager Review — Shift Swap</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-600">
              Approve this swap between <strong>{selectedSwap?.requester_employee_name}</strong> and <strong>{selectedSwap?.target_employee_name}</strong>?
              The shifts will be automatically reassigned upon approval.
            </p>
            <div>
              <Label className="text-xs">Notes (optional)</Label>
              <Textarea value={managerNotes} onChange={e => setManagerNotes(e.target.value)}
                placeholder="Add a note for both employees…" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => handleManagerDecision(false)}>
              <XCircle className="w-4 h-4 mr-1" /> Deny
            </Button>
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={() => handleManagerDecision(true)}>
              <CheckCircle2 className="w-4 h-4 mr-1" /> Approve & Swap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}