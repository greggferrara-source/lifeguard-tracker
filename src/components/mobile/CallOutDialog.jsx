import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, PhoneOff } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CallOutDialog({ open, onOpenChange, user, clockedIn, myShift, locations }) {
  const [reason, setReason] = useState("sick");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);

    // Mark shift as open/uncovered if we know the shift
    if (myShift?.id) {
      await base44.entities.Shift.update(myShift.id, {
        status: "open",
        employee_id: "",
        employee_name: "",
        notes: `CALL OUT by ${user?.full_name} — ${reason}${notes ? ": " + notes : ""}`,
      });
    }

    // Create an Alert for managers
    const locationName = clockedIn?.location_name || myShift?.location_name || "";
    await base44.entities.Alert.create({
      type: "callout",
      severity: "warning",
      title: `Call Out: ${user?.full_name}`,
      message: `${user?.full_name} has called out (${reason})${notes ? " — " + notes : ""}. Shift at ${locationName} is now uncovered.`,
      date: new Date().toISOString().split("T")[0],
      location_id: clockedIn?.location_id || myShift?.location_id || "",
      location_name: locationName,
      employee_name: user?.full_name,
      resolved: false,
    });

    setDone(true);
    setSubmitting(false);
  };

  const handleClose = () => {
    setDone(false);
    setReason("sick");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <PhoneOff className="w-4 h-4" /> Call Out of Shift
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">Call-out submitted</p>
            <p className="text-sm text-gray-500">Your manager has been notified. Your shift is marked uncovered.</p>
            <Button className="mt-2 w-full bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                This will mark your shift as uncovered and alert managers immediately.
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-600">Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sick">Sick / Illness</SelectItem>
                    <SelectItem value="family_emergency">Family Emergency</SelectItem>
                    <SelectItem value="transportation">Transportation Issue</SelectItem>
                    <SelectItem value="personal">Personal Emergency</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-600">Additional Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any details for your manager..."
                  rows={3}
                  className="mt-1 resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={submitting}>Cancel</Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={handleSubmit}
                disabled={submitting}
              >
                <PhoneOff className="w-4 h-4 mr-1" />
                {submitting ? "Submitting..." : "Confirm Call Out"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}