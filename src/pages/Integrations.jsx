import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, Calendar, BookOpen, AlertCircle, CheckCircle2, Zap, RefreshCw } from "lucide-react";

export default function Integrations() {
  const [syncing, setSyncing] = useState({});
  const qc = useQueryClient();

  const integrations = [
    {
      id: 'weather',
      name: 'Weather Alerts',
      description: 'Real-time weather monitoring with severe weather alerts for each facility location',
      icon: Cloud,
      status: 'active',
      function: 'syncWeatherAlerts',
      features: ['Severe weather alerts', 'Temperature monitoring', 'Wind speed tracking', 'Operational impact warnings']
    },
    {
      id: 'events',
      name: 'Event Calendar',
      description: 'Import local event calendars to anticipate patron load increases and adjust staffing',
      icon: Calendar,
      status: 'active',
      function: 'syncEventAlerts',
      features: ['Local event import', 'Patron load forecasting', 'Staffing recommendations', 'Impact analysis']
    },
    {
      id: 'lms',
      name: 'LMS (Training Platforms)',
      description: 'Connect with lifeguard training platforms to sync certifications and track staff development',
      icon: BookOpen,
      status: 'active',
      function: 'syncLMSCertifications',
      features: ['Red Cross integration ready', 'Ellis & Associates support', 'ISE platform compatible', 'Auto cert tracking']
    }
  ];

  const syncIntegration = useMutation({
    mutationFn: async (functionName) => {
      return base44.functions.invoke(functionName, {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflows"] });
      qc.invalidateQueries({ queryKey: ["weather-alerts"] });
      qc.invalidateQueries({ queryKey: ["event-alerts"] });
    }
  });

  const handleSync = async (functionName, integrationId) => {
    setSyncing(prev => ({ ...prev, [integrationId]: true }));
    try {
      await syncIntegration.mutateAsync(functionName);
    } finally {
      setSyncing(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">External Integrations</h1>
        <p className="text-gray-500 mt-1">Connect with external systems to enhance app functionality</p>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map(integration => {
          const Icon = integration.icon;
          return (
            <Card key={integration.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#1a9c5b]/10 rounded-lg">
                      <Icon className="w-5 h-5 text-[#1a9c5b]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge className="bg-green-100 text-green-800 text-xs mt-2">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-gray-600">{integration.description}</p>
                
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700 uppercase">Features</p>
                  {integration.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1a9c5b]" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSync(integration.function, integration.id)}
                  disabled={syncing[integration.id] || syncIntegration.isPending}
                  className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing[integration.id] ? 'animate-spin' : ''}`} />
                  {syncing[integration.id] ? 'Syncing...' : 'Sync Now'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Setup Guide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle className="w-5 h-5" />
            Integration Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</div>
              <div>
                <p className="font-medium text-gray-900">Weather Integration</p>
                <p className="text-sm text-gray-700 mt-1">Automatically syncs weather alerts for all facilities. Alerts trigger based on location coordinates.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</div>
              <div>
                <p className="font-medium text-gray-900">Event Calendar Integration</p>
                <p className="text-sm text-gray-700 mt-1">Import local events to forecast patron loads. System automatically suggests staffing adjustments.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">3</div>
              <div>
                <p className="font-medium text-gray-900">LMS Integration</p>
                <p className="text-sm text-gray-700 mt-1">Connect training platforms to auto-sync certifications. Certification changes automatically update employee records.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Sync Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-900">Weather Alerts</p>
              <p className="text-xs text-gray-600 mt-1">Syncs every hour</p>
              <Badge className="bg-green-100 text-green-800 text-xs mt-2">Active</Badge>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-900">Event Calendar</p>
              <p className="text-xs text-gray-600 mt-1">Syncs daily at 6 AM</p>
              <Badge className="bg-green-100 text-green-800 text-xs mt-2">Active</Badge>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-900">LMS Courses</p>
              <p className="text-xs text-gray-600 mt-1">Syncs every 12 hours</p>
              <Badge className="bg-green-100 text-green-800 text-xs mt-2">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}