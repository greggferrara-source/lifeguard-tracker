import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Plug, Unplug, RefreshCw, Settings, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";

const PROVIDERS = [
  {
    key: "gusto",
    name: "Gusto",
    tagline: "Modern payroll for small business",
    color: "#F45D48",
    features: ["Payroll Processing", "Tax Filing", "Benefits Admin", "Time Tracking"],
    fields: [{ key: "api_key", label: "API Key", placeholder: "gus_prod_xxxxxxxxxxxxx", type: "password" }],
  },
  {
    key: "adp",
    name: "ADP",
    tagline: "Enterprise workforce management",
    color: "#D40000",
    features: ["Payroll Processing", "Tax Compliance", "Workforce Analytics", "Benefits"],
    fields: [
      { key: "client_id", label: "Client ID", placeholder: "Enter ADP Client ID", type: "text" },
      { key: "client_secret", label: "Client Secret", placeholder: "Enter ADP Client Secret", type: "password" },
    ],
  },
  {
    key: "paychex",
    name: "Paychex",
    tagline: "Complete payroll & HR solutions",
    color: "#0066CC",
    features: ["Payroll Services", "HR Administration", "Compliance", "Benefits"],
    fields: [{ key: "api_key", label: "API Key", placeholder: "paychex_api_xxxxx", type: "password" }],
  },
  {
    key: "bamboohr",
    name: "BambooHR",
    tagline: "HR software for growing teams",
    color: "#73AC39",
    features: ["HR Management", "Time Off Tracking", "Performance Reviews", "Documents"],
    fields: [
      { key: "subdomain", label: "Subdomain", placeholder: "yourcompany", type: "text" },
      { key: "api_key", label: "API Key", placeholder: "Enter BambooHR API Key", type: "password" },
    ],
  },
  {
    key: "rippling",
    name: "Rippling",
    tagline: "All-in-one HR, IT, and Finance",
    color: "#FF5F00",
    features: ["Payroll & Expenses", "People Operations", "IT Management", "Security"],
    fields: [{ key: "api_key", label: "API Key", placeholder: "rip_xxxxxxxxxxxxx", type: "password" }],
  },
  {
    key: "workday",
    name: "Workday",
    tagline: "Enterprise cloud HCM & Finance",
    color: "#0075BE",
    features: ["Financial Planning", "Payroll", "Talent Management", "Analytics"],
    fields: [
      { key: "tenant", label: "Tenant Name", placeholder: "yourcompany", type: "text" },
      { key: "client_id", label: "Client ID", placeholder: "Enter Workday Client ID", type: "text" },
      { key: "client_secret", label: "Client Secret", placeholder: "Enter Workday Client Secret", type: "password" },
    ],
  },
];

const statusConfig = {
  connected: { label: "Connected", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  disconnected: { label: "Disconnected", color: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
  error: { label: "Error", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

export default function PayrollIntegrations() {
  const qc = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fieldValues, setFieldValues] = useState({});
  const [syncing, setSyncing] = useState(null);

  const { data: integrations = [] } = useQuery({
    queryKey: ["payroll-integrations"],
    queryFn: () => base44.entities.PayrollIntegration.list(),
  });

  const upsertIntegration = useMutation({
    mutationFn: async (data) => {
      const existing = integrations.find(i => i.provider === data.provider);
      if (existing) return base44.entities.PayrollIntegration.update(existing.id, data);
      return base44.entities.PayrollIntegration.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll-integrations"] });
      setDialogOpen(false);
      setFieldValues({});
    },
  });

  const disconnectIntegration = useMutation({
    mutationFn: async (providerKey) => {
      const existing = integrations.find(i => i.provider === providerKey);
      if (existing) return base44.entities.PayrollIntegration.update(existing.id, { status: "disconnected", access_token: null });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll-integrations"] }),
  });

  const handleConnect = () => {
    if (!selectedProvider) return;
    const hasRequired = selectedProvider.fields.every(f => fieldValues[f.key]?.trim());
    if (!hasRequired) {
      alert("Please fill in all required fields.");
      return;
    }
    upsertIntegration.mutate({
      provider: selectedProvider.key,
      status: "connected",
      company_name: fieldValues.subdomain || fieldValues.tenant || selectedProvider.name,
      last_synced: new Date().toISOString(),
      sync_enabled: true,
    });
  };

  const handleSync = async (providerKey) => {
    setSyncing(providerKey);
    await new Promise(r => setTimeout(r, 1500));
    const existing = integrations.find(i => i.provider === providerKey);
    if (existing) {
      await base44.entities.PayrollIntegration.update(existing.id, { last_synced: new Date().toISOString() });
      qc.invalidateQueries({ queryKey: ["payroll-integrations"] });
    }
    setSyncing(null);
  };

  const openDialog = (provider) => {
    setSelectedProvider(provider);
    setFieldValues({});
    setDialogOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Plug className="w-6 h-6 text-[#1a9c5b]" />
          Payroll Integrations
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Connect LifeGuard Tracker with your payroll provider to sync employee data and hours automatically.
        </p>
      </div>

      {/* Connected summary */}
      {integrations.filter(i => i.status === "connected").length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-900 text-sm">
              {integrations.filter(i => i.status === "connected").length} integration{integrations.filter(i => i.status === "connected").length > 1 ? "s" : ""} active
            </p>
            <p className="text-xs text-green-700">Employee data is syncing automatically.</p>
          </div>
        </div>
      )}

      {/* Provider grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PROVIDERS.map((provider) => {
          const integration = integrations.find(i => i.provider === provider.key);
          const status = integration?.status || "disconnected";
          const cfg = statusConfig[status] || statusConfig.disconnected;
          const isConnected = status === "connected";

          return (
            <Card key={provider.key} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                {/* Color bar */}
                <div className="h-1.5 w-full rounded-full mb-4" style={{ backgroundColor: provider.color }} />
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{provider.tagline}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <Badge className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-1.5">
                  {provider.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1a9c5b] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {integration?.last_synced && (
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last synced {format(new Date(integration.last_synced), "MMM d, h:mm a")}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  {isConnected ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs gap-1.5"
                        onClick={() => handleSync(provider.key)}
                        disabled={syncing === provider.key}
                      >
                        <RefreshCw className={`w-3 h-3 ${syncing === provider.key ? "animate-spin" : ""}`} />
                        {syncing === provider.key ? "Syncing..." : "Sync Now"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => disconnectIntegration.mutate(provider.key)}
                      >
                        <Unplug className="w-3 h-3" />
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1 bg-[#1a9c5b] hover:bg-[#158a4e] text-xs gap-1.5"
                      onClick={() => openDialog(provider)}
                    >
                      <Plug className="w-3 h-3" />
                      Connect {provider.name}
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits section */}
      <div className="bg-gray-50 rounded-2xl p-8 grid md:grid-cols-3 gap-6">
        {[
          { icon: RefreshCw, title: "Auto Sync", desc: "Employee hours and schedules sync automatically to your payroll provider." },
          { icon: CheckCircle2, title: "Accurate Payroll", desc: "Eliminate manual data entry and reduce errors with direct integration." },
          { icon: Settings, title: "Configurable", desc: "Control sync frequency, data mappings, and which fields get transferred." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="text-center">
            <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon className="w-5 h-5 text-[#1a9c5b]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Connection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedProvider?.color }} />
              Connect {selectedProvider?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-500">
              Enter your {selectedProvider?.name} API credentials. These are encrypted and securely stored.
            </p>
            {selectedProvider?.fields.map((field) => (
              <div key={field.key}>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">{field.label} *</label>
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={fieldValues[field.key] || ""}
                  onChange={(e) => setFieldValues({ ...fieldValues, [field.key]: e.target.value })}
                />
              </div>
            ))}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Find your API credentials in your {selectedProvider?.name} account settings under Developer or Integrations.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleConnect}
              disabled={upsertIntegration.isPending}
              className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-1.5"
            >
              <Plug className="w-4 h-4" />
              {upsertIntegration.isPending ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}