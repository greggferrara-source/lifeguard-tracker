import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Loader2, Link2, RotateCw } from "lucide-react";

export default function PayrollIntegrations() {
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list(),
  });

  const { data: integrations = [] } = useQuery({
    queryKey: ["payroll-integrations"],
    queryFn: () => base44.entities.PayrollIntegration.list(),
  });

  const syncMutation = useMutation({
    mutationFn: async ({ integration_id, data_type }) => {
      const response = await base44.functions.invoke("syncPayrollData", {
        integration_id,
        data_type,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-integrations"] });
    },
  });

  const handleConnect = async (provider) => {
    if (!selectedLocation) {
      alert("Please select a location first");
      return;
    }

    try {
      const response = await base44.functions.invoke("initPayrollOAuth", {
        location_id: selectedLocation,
        provider,
      });
      window.location.href = response.data.authUrl;
    } catch (error) {
      alert(`Failed to connect: ${error.message}`);
    }
  };

  const getProviderConfig = (provider) => {
    const configs = {
      gusto: { name: "Gusto", color: "from-orange-500 to-orange-600" },
      adp: { name: "ADP", color: "from-blue-500 to-blue-600" },
      paychex: { name: "Paychex", color: "from-purple-500 to-purple-600" },
    };
    return configs[provider] || {};
  };

  const getIntegrationStatus = (integration) => {
    switch (integration.status) {
      case "connected":
        return { icon: CheckCircle2, color: "text-green-600", label: "Connected" };
      case "syncing":
        return { icon: Loader2, color: "text-blue-600", label: "Syncing..." };
      case "error":
        return { icon: AlertTriangle, color: "text-red-600", label: "Error" };
      default:
        return { icon: AlertTriangle, color: "text-gray-400", label: "Not Connected" };
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payroll Integrations</h1>
          <p className="text-lg text-gray-600">
            Connect with Gusto, ADP, or Paychex to sync timesheets and schedules automatically.
          </p>
        </div>

        {/* Location Selector */}
        <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Select Location
          </label>
          <select
            value={selectedLocation || ""}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
          >
            <option value="">Choose a location...</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {["gusto", "adp", "paychex"].map((provider) => {
            const config = getProviderConfig(provider);
            const integration = integrations.find(
              (i) => i.provider === provider && i.location_id === selectedLocation
            );
            const statusInfo = integration && getIntegrationStatus(integration);
            const StatusIcon = statusInfo?.icon;

            return (
              <div
                key={provider}
                className={`rounded-xl border-2 p-6 transition-all ${
                  integration?.status === "connected"
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className={`inline-block bg-gradient-to-br ${config.color} text-white px-4 py-2 rounded-lg font-bold mb-4`}>
                  {config.name}
                </div>

                {integration ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {StatusIcon && (
                        <StatusIcon className={`w-5 h-5 ${statusInfo?.color}`} />
                      )}
                      <span className="text-sm font-semibold text-gray-700">
                        {statusInfo?.label}
                      </span>
                    </div>

                    {integration.last_sync && (
                      <p className="text-xs text-gray-500">
                        Last synced: {new Date(integration.last_sync).toLocaleDateString()}
                      </p>
                    )}

                    {integration.error_message && (
                      <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {integration.error_message}
                      </p>
                    )}

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          syncMutation.mutate({
                            integration_id: integration.id,
                            data_type: "timesheets",
                          })
                        }
                        disabled={syncMutation.isPending}
                        className="w-full"
                      >
                        <RotateCw className="w-4 h-4 mr-2" />
                        Sync Timesheets
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          syncMutation.mutate({
                            integration_id: integration.id,
                            data_type: "schedules",
                          })
                        }
                        disabled={syncMutation.isPending}
                        className="w-full"
                      >
                        <RotateCw className="w-4 h-4 mr-2" />
                        Sync Schedules
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleConnect(provider)}
                    className="w-full bg-gradient-to-r from-[#1a9c5b] to-[#158a4e] hover:opacity-90"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Connect {config.name}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Data Sync Status */}
        {selectedLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Sync Settings</h3>
            <p className="text-sm text-gray-600 mb-4">
              Timesheets and schedules sync automatically every 24 hours. You can manually trigger syncs anytime.
            </p>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="ml-3 text-sm text-gray-700">Auto-sync timesheets</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="ml-3 text-sm text-gray-700">Auto-sync schedules</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}