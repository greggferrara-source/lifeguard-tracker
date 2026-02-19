import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, CheckCircle2, Users } from "lucide-react";

export default function BroadcastDialog({ open, onOpenChange, employees }) {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sent, setSent] = useState(false);

  const activeEmployees = employees.filter(e => e.status === "active" && e.email);

  const toggleAll = () => {
    if (selectedIds.length === activeEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activeEmployees.map(e => e.id));
    }
  };

  const toggle = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const sendMutation = useMutation({
    mutationFn: async () => {
      const recipients = activeEmployees.filter(e => selectedIds.includes(e.id));
      await Promise.all(recipients.map(emp =>
        base44.integrations.Core.SendEmail({
          to: emp.email,
          subject: subject || "Message from ShiftGuard",
          body: `Hi ${emp.first_name},\n\n${message}\n\nThis message was sent via ShiftGuard.`,
        })
      ));
    },
    onSuccess: () => {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setMessage("");
        setSubject("");
        setSelectedIds([]);
        onOpenChange(false);
      }, 2000);
    },
  });

  const handleClose = () => {
    setMessage("");
    setSubject("");
    setSelectedIds([]);
    setSent(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Message Your Team</DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Send an email to one or more employees instantly.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#1a9c5b] mx-auto mb-3" />
            <p className="font-semibold text-gray-900">Message sent!</p>
            <p className="text-sm text-gray-400 mt-1">Your team has been notified.</p>
          </div>
        ) : (
          <div className="space-y-4 mt-1">
            {/* Recipients */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold text-gray-700">Recipients</Label>
                <button
                  onClick={toggleAll}
                  className="text-xs text-[#1a9c5b] font-semibold hover:underline"
                >
                  {selectedIds.length === activeEmployees.length ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="border border-gray-100 rounded-xl overflow-hidden max-h-40 overflow-y-auto divide-y divide-gray-50">
                {activeEmployees.map(emp => (
                  <label
                    key={emp.id}
                    className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedIds.includes(emp.id)}
                      onCheckedChange={() => toggle(emp.id)}
                    />
                    <div
                      className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: emp.color || "#1a9c5b" }}
                    >
                      {emp.first_name?.[0]}{emp.last_name?.[0]}
                    </div>
                    <span className="text-sm text-gray-800">{emp.first_name} {emp.last_name}</span>
                    <span className="text-xs text-gray-400 ml-auto truncate max-w-24">{emp.email}</span>
                  </label>
                ))}
                {activeEmployees.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-400">No employees with email addresses</div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{selectedIds.length} of {activeEmployees.length} selected</p>
            </div>

            {/* Subject */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Subject</Label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30 focus:border-[#1a9c5b]"
                placeholder="Message subject..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>

            {/* Message */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Message</Label>
              <Textarea
                placeholder="Write your message to the team..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="min-h-28 rounded-xl border-gray-200 text-sm resize-none focus:ring-[#1a9c5b]/30 focus:border-[#1a9c5b]"
              />
            </div>

            <Button
              onClick={() => sendMutation.mutate()}
              disabled={!message.trim() || selectedIds.length === 0 || sendMutation.isPending}
              className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] rounded-full h-11 font-semibold"
            >
              {sendMutation.isPending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to {selectedIds.length} employee{selectedIds.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}