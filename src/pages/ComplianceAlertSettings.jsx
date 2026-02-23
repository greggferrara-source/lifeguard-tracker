import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Mail, AlertTriangle, Award, CheckCircle2, Save } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ComplianceAlertSettings() {
  const qc = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });
  
  const { data: preferences = [] } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => base44.entities.NotificationPreference.filter({ user_email: user?.email })
  });
  
  const [settings, setSettings] = useState({
    cert_expiry_enabled: true,
    cert_expiry_days: [7, 30],
    cert_expiry_email: true,
    cert_expiry_in_app: true,
    compliance_gap_enabled: true,
    compliance_gap_email: true,
    compliance_gap_in_app: true,
    osha_violation_enabled: true,
    osha_violation_email: true,
    osha_violation_in_app: true,
  });
  
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Save notification preferences
      const existing = preferences.find(p => p.notification_type === 'compliance_alerts');
      
      if (existing) {
        return base44.entities.NotificationPreference.update(existing.id, {
          enabled: data.cert_expiry_enabled,
          email_enabled: data.cert_expiry_email,
          in_app_enabled: data.cert_expiry_in_app,
          settings: data
        });
      } else {
        return base44.entities.NotificationPreference.create({
          user_email: user?.email,
          notification_type: 'compliance_alerts',
          enabled: data.cert_expiry_enabled,
          email_enabled: data.cert_expiry_email,
          in_app_enabled: data.cert_expiry_in_app,
          settings: data
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Alert settings saved");
    }
  });
  
  const testMutation = useMutation({
    mutationFn: () => base44.functions.invoke('sendComplianceAlerts', {}),
    onSuccess: (data) => {
      toast.success(`Test complete: ${data.data?.alerts_generated || 0} alerts generated`);
    }
  });
  
  const handleSave = () => {
    saveMutation.mutate(settings);
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-7 h-7 text-[#1a9c5b]" />
          Compliance Alert Settings
        </h1>
        <p className="text-gray-500 mt-1">Configure automated alerts for certification expiry and compliance violations</p>
      </div>
      
      {/* Certification Expiry Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-600" />
            Certification Expiry Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Expiry Alerts</p>
              <p className="text-sm text-gray-500">Get notified when certifications are expiring</p>
            </div>
            <Switch
              checked={settings.cert_expiry_enabled}
              onCheckedChange={(val) => setSettings({ ...settings, cert_expiry_enabled: val })}
            />
          </div>
          
          {settings.cert_expiry_enabled && (
            <>
              <div className="border-t pt-4 space-y-3">
                <Label>Alert Days Before Expiry</Label>
                <div className="flex gap-3">
                  <div>
                    <Input
                      type="number"
                      value={settings.cert_expiry_days[0]}
                      onChange={(e) => setSettings({
                        ...settings,
                        cert_expiry_days: [parseInt(e.target.value) || 7, settings.cert_expiry_days[1]]
                      })}
                      className="w-24"
                    />
                    <p className="text-xs text-gray-500 mt-1">Urgent (days)</p>
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={settings.cert_expiry_days[1]}
                      onChange={(e) => setSettings({
                        ...settings,
                        cert_expiry_days: [settings.cert_expiry_days[0], parseInt(e.target.value) || 30]
                      })}
                      className="w-24"
                    />
                    <p className="text-xs text-gray-500 mt-1">Warning (days)</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-3">
                <Label>Delivery Methods</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={settings.cert_expiry_email}
                      onCheckedChange={(val) => setSettings({ ...settings, cert_expiry_email: val })}
                    />
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Email notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={settings.cert_expiry_in_app}
                      onCheckedChange={(val) => setSettings({ ...settings, cert_expiry_in_app: val })}
                    />
                    <Bell className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">In-app notifications</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Compliance Gap Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            OSHA/MAHC Compliance Gap Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Compliance Monitoring</p>
              <p className="text-sm text-gray-500">Alert when staff are missing required certifications</p>
            </div>
            <Switch
              checked={settings.compliance_gap_enabled}
              onCheckedChange={(val) => setSettings({ ...settings, compliance_gap_enabled: val })}
            />
          </div>
          
          {settings.compliance_gap_enabled && (
            <div className="border-t pt-4 space-y-3">
              <Label>Delivery Methods</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.compliance_gap_email}
                    onCheckedChange={(val) => setSettings({ ...settings, compliance_gap_email: val })}
                  />
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Email notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.compliance_gap_in_app}
                    onCheckedChange={(val) => setSettings({ ...settings, compliance_gap_in_app: val })}
                  />
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">In-app notifications</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* OSHA Violation Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            OSHA/MAHC Violation Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Violation Alerts</p>
              <p className="text-sm text-gray-500">Get notified of potential regulatory violations</p>
            </div>
            <Switch
              checked={settings.osha_violation_enabled}
              onCheckedChange={(val) => setSettings({ ...settings, osha_violation_enabled: val })}
            />
          </div>
          
          {settings.osha_violation_enabled && (
            <div className="border-t pt-4 space-y-3">
              <Label>Delivery Methods</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.osha_violation_email}
                    onCheckedChange={(val) => setSettings({ ...settings, osha_violation_email: val })}
                  />
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Email notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.osha_violation_in_app}
                    onCheckedChange={(val) => setSettings({ ...settings, osha_violation_in_app: val })}
                  />
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">In-app notifications</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex gap-3 justify-end border-t pt-6">
        <Button
          variant="outline"
          onClick={() => testMutation.mutate()}
          disabled={testMutation.isPending}
          className="gap-2"
        >
          {testMutation.isPending ? "Testing..." : "Test Alerts Now"}
        </Button>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2"
        >
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
      
      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Automated Daily Checks</p>
              <p className="text-xs text-blue-700 mt-1">
                The system automatically checks compliance status daily at 6:00 AM and sends alerts based on your configuration. 
                You can also manually trigger a check using the "Test Alerts Now" button.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}