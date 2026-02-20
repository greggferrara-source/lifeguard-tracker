import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ArrowRight } from "lucide-react";

const payrollProviders = [
  {
    name: "Gusto",
    logo: "https://cdn.worldvectorlogo.com/logos/gusto.svg",
    description: "Modern, user-friendly payroll and HR software for small and mid-size businesses",
    features: ["Payroll Processing", "Tax Filing", "Benefits Admin", "Time Tracking"]
  },
  {
    name: "ADP",
    logo: "https://cdn.worldvectorlogo.com/logos/adp-1.svg",
    description: "Enterprise-grade payroll and workforce management solutions",
    features: ["Payroll Processing", "Tax Compliance", "Workforce Analytics", "Benefits Management"]
  },
  {
    name: "Paychex",
    logo: "https://cdn.worldvectorlogo.com/logos/paychex.svg",
    description: "Complete payroll, HR, and benefits solutions for businesses",
    features: ["Payroll Services", "HR Administration", "Compliance", "Employee Benefits"]
  },
  {
    name: "BambooHR",
    logo: "https://cdn.worldvectorlogo.com/logos/bamboohr.svg",
    description: "Human resources software designed for small and medium businesses",
    features: ["HR Management", "Time Off Tracking", "Performance Reviews", "Document Management"]
  },
  {
    name: "Rippling",
    logo: "https://cdn.worldvectorlogo.com/logos/rippling.svg",
    description: "All-in-one HR, IT, and Finance platform for modern organizations",
    features: ["Payroll & Expenses", "People Operations", "IT Management", "Security"]
  },
  {
    name: "Workday",
    logo: "https://cdn.worldvectorlogo.com/logos/workday.svg",
    description: "Enterprise cloud applications for finance and human resources",
    features: ["Financial Planning", "Payroll", "Talent Management", "Analytics"]
  }
];

export default function PayrollIntegrations() {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!apiKey.trim()) return;
    setIsConnecting(true);
    try {
      // Integration logic would go here
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsDialogOpen(false);
      setApiKey("");
      setSelectedProvider(null);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Integrate with <span className="text-[#1a9c5b]">Payroll Providers</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect LifeGuard Tracker with your favorite payroll and HR platforms. Seamlessly sync employee data, manage payroll, and automate workflows.
          </p>
        </div>

        {/* Provider Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {payrollProviders.map((provider) => (
            <Card key={provider.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-16 mb-4 flex items-center justify-center bg-gray-50 rounded-lg">
                  <img
                    src={provider.logo}
                    alt={provider.name}
                    className="h-12 object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `<span class="text-lg font-bold text-gray-700">${provider.name}</span>`;
                    }}
                  />
                </div>
                <CardTitle className="text-xl">{provider.name}</CardTitle>
                <CardDescription>{provider.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {provider.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1a9c5b]" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => {
                    setSelectedProvider(provider);
                    setIsDialogOpen(true);
                  }}
                  className="w-full bg-[#1a9c5b] hover:bg-[#158a4e]"
                >
                  Connect <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <section className="bg-white rounded-xl border border-gray-200 p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Integrate?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#f0faf5] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-[#1a9c5b]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Data Sync</h3>
              <p className="text-gray-600">Automatically sync employee information between systems</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#f0faf5] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-[#1a9c5b]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Time Tracking</h3>
              <p className="text-gray-600">Link shift data directly to payroll processing</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#f0faf5] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-[#1a9c5b]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Automation</h3>
              <p className="text-gray-600">Eliminate manual data entry and reduce errors</p>
            </div>
          </div>
        </section>
      </section>

      {/* Connection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect {selectedProvider?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">API Key</label>
              <Input
                placeholder={`Enter your ${selectedProvider?.name} API key`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-2"
                type="password"
              />
            </div>
            <p className="text-xs text-gray-500">
              Your API key is encrypted and securely stored. It will only be used to authenticate with {selectedProvider?.name}.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!apiKey.trim() || isConnecting}
              className="bg-[#1a9c5b] hover:bg-[#158a4e]"
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}