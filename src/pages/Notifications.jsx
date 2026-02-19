import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, CheckCircle, XCircle, Send, Megaphone } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const categoryLabels = {
  shift_reminder: "Shift Reminder", shift_assigned: "Shift Assigned",
  callout: "Call-out", open_shift: "Open Shift", time_off_decision: "Time Off",
  understaffing: "Understaffing", cert_expiry: "Cert Expiry", welcome: "Welcome", general: "General"
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ subject: "", message: "", send_sms: false, roles: "all" });
  const [sending, setSending] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => base44.entities.Notification.list("-created_date", 200),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const filtered = tab === "all" ? notifications
    : tab === "email" ? notifications.filter(n => n.type === "email")
    : tab === "sms" ? notifications.filter(n => n.type === "sms")
    : notifications.filter(n => n.status === "failed");

  const handleBroadcast = async () => {
    setSending(true);
    const roles = broadcastForm.roles === "all"
      ? ["lifeguard", "head_lifeguard", "supervisor", "manager"]
      : [broadcastForm.roles];
    await base44.functions.invoke("broadcastAlert", {
      message: broadcastForm.message,
      subject: broadcastForm.subject || "ShiftGuard: Important Update",
      send_email: true,
      send_sms: broadcastForm.send_sms,
      roles
    });
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    setSending(false);
    setBroadcastOpen(false);
    setBroadcastForm({ subject: "", message: "", send_sms: false, roles: "all" });
  };

  const sentCount = notifications.filter(n => n.status === "sent").length;
  const failedCount = notifications.filter(n => n.status === "failed").length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-2">{sentCount} sent · {failedCount} failed</p>
        </div>
        <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] rounded-full" size="sm" onClick={() => setBroadcastOpen(true)}>
          <Megaphone className="w-4 h-4 mr-1" /> Broadcast
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-gray-100 rounded-full p-1">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
          <TabsTrigger value="sms" className="text-xs">SMS</TabsTrigger>
          <TabsTrigger value="failed" className="text-xs">
            Failed {failedCount > 0 && <span className="ml-1.5 bg-red-500 text-white rounded-full px-1.5 text-[10px]">{failedCount}</span>}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {isLoading && <p className="text-center text-sm text-slate-400 py-8">Loading...</p>}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-14 text-slate-400">
            <Mail className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No notifications yet</p>
          </div>
        )}
        {filtered.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
            <Card className="p-3 border-0 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 ${n.type === "sms" ? "text-purple-500" : "text-cyan-500"}`}>
                  {n.type === "sms" ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-900 truncate">{n.subject}</p>
                    {n.category && (
                      <Badge variant="outline" className="text-[10px]">{categoryLabels[n.category] || n.category}</Badge>
                    )}
                    <Badge className={`text-[10px] ${n.status === "sent" ? "bg-emerald-100 text-emerald-700" : n.status === "failed" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                      {n.status === "sent" ? <CheckCircle className="w-2.5 h-2.5 mr-1" /> : <XCircle className="w-2.5 h-2.5 mr-1" />}
                      {n.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    To: {n.recipient_name || n.recipient_email || n.recipient_phone}
                    {n.recipient_email && n.recipient_name ? ` (${n.recipient_email})` : ""}
                  </p>
                  {n.error && <p className="text-xs text-red-500 mt-0.5">Error: {n.error}</p>}
                  <p className="text-[10px] text-slate-400 mt-1">
                    {n.created_date ? format(new Date(n.created_date), "MMM d, yyyy h:mm a") : ""}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Broadcast Dialog */}
      <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Broadcast Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Send To</Label>
              <Select value={broadcastForm.roles} onValueChange={v => setBroadcastForm({ ...broadcastForm, roles: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="lifeguard">Lifeguards Only</SelectItem>
                  <SelectItem value="head_lifeguard">Head Lifeguards</SelectItem>
                  <SelectItem value="supervisor">Supervisors</SelectItem>
                  <SelectItem value="manager">Managers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Subject</Label>
              <Input value={broadcastForm.subject} onChange={e => setBroadcastForm({ ...broadcastForm, subject: e.target.value })} placeholder="ShiftGuard: Important Update" />
            </div>
            <div>
              <Label className="text-xs">Message</Label>
              <Textarea value={broadcastForm.message} onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })} rows={4} placeholder="Type your message here..." />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={broadcastForm.send_sms} onChange={e => setBroadcastForm({ ...broadcastForm, send_sms: e.target.checked })} className="rounded" />
              Also send via SMS (Twilio)
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBroadcastOpen(false)}>Cancel</Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={handleBroadcast} disabled={sending || !broadcastForm.message}>
              <Send className="w-4 h-4 mr-1" />
              {sending ? "Sending..." : "Send Broadcast"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}