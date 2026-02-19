import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Clock, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const DAYS = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

export default function MyAvailability() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    preferred_days: [],
    preferred_start: "",
    preferred_end: "",
    unavailable_periods: [],
    notes: "",
  });
  const [newUnavailable, setNewUnavailable] = useState({ start_date: "", end_date: "", reason: "" });

  useEffect(() => {
    const getUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  const { data: availability } = useQuery({
    queryKey: ["my-availability", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      const results = await base44.entities.EmployeeAvailability.filter({
        employee_id: currentUser.id,
      });
      return results[0] || null;
    },
    enabled: !!currentUser,
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (availability) {
        return base44.entities.EmployeeAvailability.update(availability.id, data);
      } else {
        return base44.entities.EmployeeAvailability.create({
          ...data,
          employee_id: currentUser.id,
          employee_name: `${currentUser.full_name}`,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-availability"] });
      setDialogOpen(false);
    },
  });

  const handleEditClick = () => {
    if (availability) {
      setFormData({
        preferred_days: availability.preferred_days || [],
        preferred_start: availability.preferred_start || "",
        preferred_end: availability.preferred_end || "",
        unavailable_periods: availability.unavailable_periods || [],
        notes: availability.notes || "",
      });
    } else {
      setFormData({
        preferred_days: [],
        preferred_start: "",
        preferred_end: "",
        unavailable_periods: [],
        notes: "",
      });
    }
    setNewUnavailable({ start_date: "", end_date: "", reason: "" });
    setDialogOpen(true);
  };

  const handleAddUnavailable = () => {
    if (newUnavailable.start_date && newUnavailable.end_date) {
      setFormData(prev => ({
        ...prev,
        unavailable_periods: [
          ...prev.unavailable_periods,
          { ...newUnavailable },
        ],
      }));
      setNewUnavailable({ start_date: "", end_date: "", reason: "" });
    }
  };

  const handleRemoveUnavailable = (idx) => {
    setFormData(prev => ({
      ...prev,
      unavailable_periods: prev.unavailable_periods.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      preferred_days: prev.preferred_days.includes(day)
        ? prev.preferred_days.filter(d => d !== day)
        : [...prev.preferred_days, day].sort(),
    }));
  };

  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending Review" },
    approved: { color: "bg-green-100 text-green-800", icon: CheckCircle2, label: "Approved" },
    rejected: { color: "bg-red-100 text-red-800", icon: AlertTriangle, label: "Rejected" },
  };

  const status = availability?.status || "pending";
  const StatusIcon = statusConfig[status]?.icon;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto min-h-screen bg-white">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Availability</h1>
        <p className="text-gray-600 mt-1">Manage your work preferences and blocked dates</p>
      </div>

      {/* Status Card */}
      {availability && (
        <Card className="border-l-4" style={{ borderColor: status === "approved" ? "#10b981" : status === "rejected" ? "#ef4444" : "#f59e0b" }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {StatusIcon && <StatusIcon className="w-5 h-5" />}
                <div>
                  <CardTitle className="text-lg">Status</CardTitle>
                  <CardDescription>{statusConfig[status].label}</CardDescription>
                </div>
              </div>
              <Badge className={statusConfig[status].color}>{statusConfig[status].label}</Badge>
            </div>
          </CardHeader>
          {availability.manager_notes && (
            <CardContent>
              <p className="text-sm text-gray-700"><strong>Manager Note:</strong> {availability.manager_notes}</p>
            </CardContent>
          )}
        </Card>
      )}

      {/* Availability Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {availability ? (
            <>
              {/* Preferred Days */}
              {availability.preferred_days && availability.preferred_days.length > 0 && (
                <div>
                  <p className="font-semibold text-sm text-gray-700 mb-2">Preferred Working Days</p>
                  <div className="flex flex-wrap gap-2">
                    {availability.preferred_days.map(day => {
                      const dayName = DAYS.find(d => d.value === day)?.label;
                      return <Badge key={day} variant="outline">{dayName}</Badge>;
                    })}
                  </div>
                </div>
              )}

              {/* Preferred Hours */}
              {availability.preferred_start && availability.preferred_end && (
                <div>
                  <p className="font-semibold text-sm text-gray-700 mb-2">Preferred Hours</p>
                  <p className="text-gray-600">{availability.preferred_start} – {availability.preferred_end}</p>
                </div>
              )}

              {/* Unavailable Periods */}
              {availability.unavailable_periods && availability.unavailable_periods.length > 0 && (
                <div>
                  <p className="font-semibold text-sm text-gray-700 mb-2">Blocked Dates</p>
                  <div className="space-y-2">
                    {availability.unavailable_periods.map((period, idx) => (
                      <div key={idx} className="bg-red-50 p-3 rounded-lg border border-red-100">
                        <p className="text-sm font-medium text-gray-900">
                          {format(parse(period.start_date, "yyyy-MM-dd", new Date()), "MMM d, yyyy")} – {format(parse(period.end_date, "yyyy-MM-dd", new Date()), "MMM d, yyyy")}
                        </p>
                        {period.reason && <p className="text-xs text-gray-600 mt-1">{period.reason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {availability.notes && (
                <div>
                  <p className="font-semibold text-sm text-gray-700 mb-2">Additional Notes</p>
                  <p className="text-gray-600">{availability.notes}</p>
                </div>
              )}

              {(!availability.preferred_days?.length && !availability.preferred_start && !availability.unavailable_periods?.length) && (
                <p className="text-gray-500 text-sm">No availability information submitted yet.</p>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">No availability information submitted yet. Click "Update Availability" to add your preferences.</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Button */}
      <div className="flex gap-2">
        <Button onClick={handleEditClick} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
          {availability ? "Update Availability" : "Submit Availability"}
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Your Availability</DialogTitle>
            <DialogDescription>Set your preferred working hours and block out dates when you're unavailable.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Preferred Days */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Preferred Working Days</Label>
              <div className="space-y-2">
                {DAYS.map(day => (
                  <div key={day.value} className="flex items-center gap-3">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={formData.preferred_days.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value)}
                    />
                    <label htmlFor={`day-${day.value}`} className="text-sm cursor-pointer">{day.label}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Preferred Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={formData.preferred_start}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_start: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-time">Preferred End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={formData.preferred_end}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_end: e.target.value }))}
                />
              </div>
            </div>

            {/* Unavailable Periods */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Blocked Dates</Label>
              <div className="space-y-3">
                {formData.unavailable_periods.map((period, idx) => (
                  <div key={idx} className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(parse(period.start_date, "yyyy-MM-dd", new Date()), "MMM d")} – {format(parse(period.end_date, "yyyy-MM-dd", new Date()), "MMM d, yyyy")}
                      </p>
                      {period.reason && <p className="text-xs text-gray-600">{period.reason}</p>}
                    </div>
                    <button
                      onClick={() => handleRemoveUnavailable(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Add New Unavailable Period */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Add Blocked Period</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="unavail-start" className="text-xs">Start Date</Label>
                      <Input
                        id="unavail-start"
                        type="date"
                        value={newUnavailable.start_date}
                        onChange={(e) => setNewUnavailable(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="unavail-end" className="text-xs">End Date</Label>
                      <Input
                        id="unavail-end"
                        type="date"
                        value={newUnavailable.end_date}
                        onChange={(e) => setNewUnavailable(prev => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="unavail-reason" className="text-xs">Reason (Optional)</Label>
                    <Input
                      id="unavail-reason"
                      placeholder="e.g., Vacation, Doctor appointment"
                      value={newUnavailable.reason}
                      onChange={(e) => setNewUnavailable(prev => ({ ...prev, reason: e.target.value }))}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddUnavailable}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Period
                  </Button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <textarea
                id="notes"
                placeholder="e.g., Flexible on Fridays, prefer evening shifts..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows="3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}