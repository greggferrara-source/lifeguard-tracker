import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Trash2, Check, Settings, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function NotificationCenter() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("inbox");
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState("");

  const { data: notifications = [] } = useQuery({
    queryKey: ["user-notifications"],
    queryFn: () => base44.entities.UserNotification.list("-created_at")
  });

  const { data: preferences = [] } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => base44.entities.NotificationPreference.list()
  });

  const unreadCount = notifications.filter(n => !n.read && !n.dismissed).length;
  const unreadNotifications = notifications.filter(n => !n.read && !n.dismissed);
  const archivedNotifications = notifications.filter(n => n.dismissed);

  const markAsRead = useMutation({
    mutationFn: (notificationId) => base44.entities.UserNotification.update(notificationId, { read: true, read_at: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-notifications"] })
  });

  const dismiss = useMutation({
    mutationFn: (notificationId) => base44.entities.UserNotification.update(notificationId, { dismissed: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-notifications"] })
  });

  const deleteNotification = useMutation({
    mutationFn: (notificationId) => base44.entities.UserNotification.delete(notificationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-notifications"] })
  });

  const filteredNotifications = unreadNotifications.filter(n => !filterSeverity || n.severity === filterSeverity);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-8 h-8 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold">Notification Center</h1>
        </div>
        <Button onClick={() => setShowSettingsDialog(true)} variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Preferences
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {[
          { id: "inbox", label: `Inbox (${unreadCount})` },
          { id: "archive", label: `Archive (${archivedNotifications.length})` }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {tab === "inbox" && (
        <div>
          <label className="text-sm font-medium block mb-2">Filter by Severity</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings & Critical</option>
            <option value="info">All</option>
          </select>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {(tab === "inbox" ? filteredNotifications : archivedNotifications).length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{tab === "inbox" ? "No notifications" : "Archive is empty"}</p>
            </CardContent>
          </Card>
        ) : (
          (tab === "inbox" ? filteredNotifications : archivedNotifications).map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={() => markAsRead.mutate(notification.id)}
              onDismiss={() => dismiss.mutate(notification.id)}
              onDelete={() => deleteNotification.mutate(notification.id)}
            />
          ))
        )}
      </div>

      {/* Settings Dialog */}
      <NotificationSettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} preferences={preferences} />
    </div>
  );
}

function NotificationCard({ notification, onMarkRead, onDismiss, onDelete }) {
  const severityConfig = {
    critical: { icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50", badgeColor: "bg-red-100 text-red-700" },
    warning: { icon: AlertCircle, color: "text-orange-600", bgColor: "bg-orange-50", badgeColor: "bg-orange-100 text-orange-700" },
    info: { icon: Info, color: "text-blue-600", bgColor: "bg-blue-50", badgeColor: "bg-blue-100 text-blue-700" }
  };

  const config = severityConfig[notification.severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <Card className={notification.read ? "opacity-75" : config.bgColor}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-1`} />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">{notification.title}</p>
                  <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {notification.related_entity_name && (
                  <Badge variant="outline">{notification.related_entity_name}</Badge>
                )}
                <Badge className={config.badgeColor}>{notification.notification_type.replace(/_/g, " ")}</Badge>
                <span className="text-xs text-gray-500">{format(parseISO(notification.created_at), "MMM d, h:mm a")}</span>
              </div>

              {notification.action_url && (
                <Button variant="link" className="mt-2 p-0 h-auto" onClick={() => window.location.href = notification.action_url}>
                  View Details →
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-1 flex-shrink-0">
            {!notification.read && (
              <Button variant="ghost" size="icon" onClick={onMarkRead} title="Mark as read">
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onDismiss} title="Dismiss">
              <AlertCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} title="Delete">
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationSettingsDialog({ open, onOpenChange, preferences }) {
  const qc = useQueryClient();
  const [formData, setFormData] = React.useState({
    pool_test_alert: true,
    maintenance_due: true,
    compliance_gap: true,
    task_assignment: true,
    email_enabled: true,
    in_app_enabled: true,
    urgency_threshold: "high",
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00"
  });

  const updatePreference = useMutation({
    mutationFn: (data) => {
      if (preferences.length > 0) {
        return Promise.all(preferences.map(p => base44.entities.NotificationPreference.update(p.id, data)));
      } else {
        return Promise.all(["pool_test_alert", "maintenance_due", "compliance_gap", "task_assignment"].map(type =>
          base44.entities.NotificationPreference.create({ ...data, notification_type: type })
        ));
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification-preferences"] });
      onOpenChange(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePreference.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Notification Types</h4>
            {[
              { id: "pool_test_alert", label: "Pool Test Alerts" },
              { id: "maintenance_due", label: "Maintenance Due Dates" },
              { id: "compliance_gap", label: "Compliance Gaps" },
              { id: "task_assignment", label: "Task Assignments" }
            ].map(type => (
              <label key={type.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData[type.id]}
                  onChange={(e) => setFormData({ ...formData, [type.id]: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">{type.label}</span>
              </label>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="font-semibold text-sm">Delivery Methods</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.email_enabled}
                onChange={(e) => setFormData({ ...formData, email_enabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Email Notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.in_app_enabled}
                onChange={(e) => setFormData({ ...formData, in_app_enabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">In-App Notifications</span>
            </label>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="font-semibold text-sm">Notification Settings</h4>
            <div>
              <label className="text-sm font-medium block mb-1">Alert Threshold</label>
              <select
                value={formData.urgency_threshold}
                onChange={(e) => setFormData({ ...formData, urgency_threshold: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="all">All Notifications</option>
                <option value="high">High & Critical Only</option>
                <option value="critical">Critical Only</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Quiet Hours Start</label>
                <input
                  type="time"
                  value={formData.quiet_hours_start}
                  onChange={(e) => setFormData({ ...formData, quiet_hours_start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Quiet Hours End</label>
                <input
                  type="time"
                  value={formData.quiet_hours_end}
                  onChange={(e) => setFormData({ ...formData, quiet_hours_end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={updatePreference.isPending}>
              {updatePreference.isPending ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}