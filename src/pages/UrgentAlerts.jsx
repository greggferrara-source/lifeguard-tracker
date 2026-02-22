import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus, Check, X } from "lucide-react";
import { format } from "date-fns";

export default function UrgentAlerts() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "pool_closure",
    severity: "high",
    message: "",
    location_id: "",
    send_sms: true,
    send_email: true,
    send_push: true,
    send_announcement: true,
    target_roles: []
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["urgent-alerts"],
    queryFn: () => base44.entities.UrgentAlert.list("-created_date", 50)
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list()
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const createAlert = useMutation({
    mutationFn: (data) => base44.entities.UrgentAlert.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urgent-alerts"] });
      setDialogOpen(false);
      setFormData({
        title: "",
        type: "pool_closure",
        severity: "high",
        message: "",
        location_id: "",
        send_sms: true,
        send_email: true,
        send_push: true,
        send_announcement: true,
        target_roles: []
      });
    }
  });

  const sendAlert = useMutation({
    mutationFn: (alertId) => base44.functions.invoke("sendUrgentAlert", { alert_id: alertId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urgent-alerts"] });
    }
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.UrgentAlert.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urgent-alerts"] });
    }
  });

  const handleSubmit = () => {
    createAlert.mutate({
      ...formData,
      created_by_email: user?.email,
      created_by_name: user?.full_name
    });
  };

  const activeAlerts = alerts.filter(a => a.status === "active");
  const isAdmin = user?.role === "admin" || user?.role === "site_owner";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Urgent Alerts</h1>
        {isAdmin && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <AlertTriangle className="w-4 h-4 mr-2" /> Send Alert
          </Button>
        )}
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Send Urgent Alert</h2>

            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />

            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="pool_closure">Pool Closure</option>
              <option value="weather">Weather</option>
              <option value="emergency">Emergency</option>
              <option value="chemical_issue">Chemical Issue</option>
              <option value="staffing">Staffing</option>
              <option value="other">Other</option>
            </select>

            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>

            <textarea
              placeholder="Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
            />

            <select
              value={formData.location_id}
              onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Locations</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.send_sms}
                  onChange={(e) => setFormData({ ...formData, send_sms: e.target.checked })}
                />
                <span>Send SMS</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.send_email}
                  onChange={(e) => setFormData({ ...formData, send_email: e.target.checked })}
                />
                <span>Send Email</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.send_announcement}
                  onChange={(e) => setFormData({ ...formData, send_announcement: e.target.checked })}
                />
                <span>Post as Announcement</span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createAlert.isPending || !formData.title || !formData.message}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-bold text-gray-900">Active Alerts</h2>
          {activeAlerts.map(alert => (
            <div key={alert.id} className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{alert.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {alert.location_name && `Location: ${alert.location_name} • `}
                    {format(new Date(alert.created_date), "MMM d, h:mm a")}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendAlert.mutate(alert.id)}
                      disabled={sendAlert.isPending}
                      className="text-blue-600"
                    >
                      Resend
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus.mutate({ id: alert.id, status: "resolved" })}
                      className="text-green-600"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolved Alerts */}
      {alerts.filter(a => a.status === "resolved").length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Resolved</h2>
          {alerts.filter(a => a.status === "resolved").map(alert => (
            <div key={alert.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-60">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">{alert.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(alert.created_date), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}