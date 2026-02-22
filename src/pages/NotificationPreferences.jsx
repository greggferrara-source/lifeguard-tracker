import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Save, Loader } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";

const NOTIFICATION_TYPES = [
  { id: 'certification_expiry', label: 'Certification Expirations', description: 'Get notified when certifications are expiring' },
  { id: 'compliance_gap', label: 'Pending Assessments', description: 'Get notified about pending compliance assessments' },
  { id: 'task_assignment', label: 'Overdue Tasks', description: 'Get notified when compliance tasks are overdue' },
  { id: 'maintenance_due', label: 'Maintenance Due', description: 'Get notified when maintenance is due' },
  { id: 'incident_report', label: 'Incident Reports', description: 'Get notified when incidents are logged' },
  { id: 'pool_test_alert', label: 'Pool Test Alerts', description: 'Get notified of out-of-range pool test results' }
];

const URGENCY_THRESHOLDS = [
  { value: 'all', label: 'All Notifications' },
  { value: 'high', label: 'High & Critical Only' },
  { value: 'critical', label: 'Critical Only' }
];

export default function NotificationPreferences() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({});

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const u = await base44.auth.me();
      setUser(u);
      return u;
    }
  });

  const { data: preferences = [] } = useQuery({
    queryKey: ['notification-prefs', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      return base44.entities.NotificationPreference.filter({ user_email: currentUser.email });
    },
    enabled: !!currentUser?.email
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const existing = preferences.find(p => p.notification_type === data.notification_type);
      if (existing) {
        return base44.entities.NotificationPreference.update(existing.id, data);
      } else {
        return base44.entities.NotificationPreference.create({
          user_email: currentUser.email,
          user_name: currentUser.full_name,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-prefs'] });
      setEditDialog(false);
    }
  });

  const handleEdit = (type) => {
    const existing = preferences.find(p => p.notification_type === type.id);
    setEditForm({
      notification_type: type.id,
      email_enabled: existing?.email_enabled ?? true,
      in_app_enabled: existing?.in_app_enabled ?? true,
      sms_enabled: existing?.sms_enabled ?? false,
      urgency_threshold: existing?.urgency_threshold ?? 'high'
    });
    setEditingType(type);
    setEditDialog(true);
  };

  const handleSave = () => {
    updateMutation.mutate(editForm);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-[#1a9c5b]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-8 h-8 text-[#1a9c5b]" />
            Notification Preferences
          </h1>
          <p className="text-gray-600 mt-2">Configure how and when you receive alerts about compliance, certifications, and facility operations</p>
        </div>

        {/* Notifications Grid */}
        <div className="space-y-3">
          {NOTIFICATION_TYPES.map((type) => {
            const pref = preferences.find(p => p.notification_type === type.id);
            const channels = [];
            if (pref?.email_enabled) channels.push('Email');
            if (pref?.in_app_enabled) channels.push('In-App');
            if (pref?.sms_enabled) channels.push('SMS');

            return (
              <Card key={type.id} className="hover:border-[#1a9c5b] transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{type.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                      {pref && (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          {channels.length > 0 ? (
                            <>
                              <span className="text-xs text-gray-500">Via:</span>
                              {channels.map(ch => (
                                <Badge key={ch} variant="outline" className="text-xs">{ch}</Badge>
                              ))}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Disabled</span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(type)}
                      className="flex-shrink-0"
                    >
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure {editingType?.label}</DialogTitle>
              <DialogDescription>{editingType?.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Delivery Channels</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={editForm.email_enabled}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, email_enabled: checked })}
                    />
                    <span className="text-sm text-gray-700">Email Notifications</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={editForm.in_app_enabled}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, in_app_enabled: checked })}
                    />
                    <span className="text-sm text-gray-700">In-App Notifications</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={editForm.sms_enabled}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, sms_enabled: checked })}
                    />
                    <span className="text-sm text-gray-700">SMS Notifications (if enabled)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Minimum Severity Level</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={editForm.urgency_threshold}
                  onChange={(e) => setEditForm({ ...editForm, urgency_threshold: e.target.value })}
                >
                  {URGENCY_THRESHOLDS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-[#1a9c5b] hover:bg-[#158a4e]"
              >
                {updateMutation.isPending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Preferences
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}