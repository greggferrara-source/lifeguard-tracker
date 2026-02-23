import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search, Zap, DollarSign, Settings, CreditCard, CheckCircle2 } from "lucide-react";

const INTEGRATIONS = {
  "Payroll": [
    { name: "Rippling", description: "Run error-free payroll in minutes. Connects HR, time, and compliance data automatically.", logo: "https://cdn.brandfetch.io/rippling.com/w/400/h/400", url: "https://www.rippling.com", status: "available", badge: "Preferred Partner" },
    { name: "Gusto", description: "Onboard, pay, insure, and support your hardworking team with full-service payroll.", logo: "https://cdn.brandfetch.io/gusto.com/w/400/h/400", url: "https://gusto.com", status: "available" },
    { name: "ADP Run", description: "Simplify payroll and HR with easy-to-use tools backed by ADP's expertise.", logo: "https://cdn.brandfetch.io/adp.com/w/400/h/400", url: "https://apps.adp.com", status: "available" },
    { name: "ADP Workforce Now", description: "All-in-one platform for payroll, HR, time, talent and benefits.", logo: "https://cdn.brandfetch.io/adp.com/w/400/h/400", url: "https://apps.adp.com", status: "available" },
    { name: "QuickBooks Online", description: "Smarter bookkeeping tools with payroll and accounting all in one place.", logo: "https://cdn.brandfetch.io/quickbooks.intuit.com/w/400/h/400", url: "https://quickbooks.intuit.com", status: "available" },
    { name: "Square Payroll", description: "Easily run payroll, pay taxes, and stay ahead of compliance.", logo: "https://cdn.brandfetch.io/squareup.com/w/400/h/400", url: "https://squareup.com/us/en/payroll", status: "available" },
    { name: "Paychex", description: "HR solutions for any size business with full payroll and benefits management.", logo: "https://cdn.brandfetch.io/paychex.com/w/400/h/400", url: "https://www.paychex.com", status: "coming_soon" },
    { name: "OnPay", description: "Simplify small business payroll, taxes, HR and benefits in one platform.", logo: "https://cdn.brandfetch.io/onpay.com/w/400/h/400", url: "https://onpay.com", status: "coming_soon" },
    { name: "Simplepay.ca", description: "Online payroll application for Canadian businesses.", logo: null, url: "https://www.simplepay.ca", status: "coming_soon" },
  ],
  "Business Operations": [
    { name: "Zapier", description: "Connect LifeGuard Tracker to 5,000+ apps. Automate workflows without writing code.", logo: "https://cdn.brandfetch.io/zapier.com/w/400/h/400", url: "https://zapier.com", status: "available" },
    { name: "Google Sheets", description: "Export schedules, timesheets, and reports directly to Google Sheets.", logo: "https://cdn.brandfetch.io/google.com/w/400/h/400", url: "https://sheets.google.com", status: "available", connected: true },
    { name: "Google Calendar", description: "Sync employee shifts directly to Google Calendar for real-time visibility.", logo: "https://cdn.brandfetch.io/google.com/w/400/h/400", url: "https://calendar.google.com", status: "available", connected: true },
    { name: "Gmail", description: "Send automated notifications, alerts, and reports via Gmail.", logo: "https://cdn.brandfetch.io/google.com/w/400/h/400", url: "https://gmail.com", status: "available", connected: true },
    { name: "Google Drive", description: "Store documents, reports, and compliance files in Google Drive.", logo: "https://cdn.brandfetch.io/google.com/w/400/h/400", url: "https://drive.google.com", status: "available", connected: true },
    { name: "Slack", description: "Send shift alerts, incident notifications, and team announcements to Slack.", logo: "https://cdn.brandfetch.io/slack.com/w/400/h/400", url: "https://slack.com", status: "coming_soon" },
    { name: "GoCo", description: "Modern HR, benefits, and payroll that automates your workflow.", logo: null, url: "https://www.goco.io", status: "coming_soon" },
    { name: "Microsoft Teams", description: "Collaborate and receive shift notifications directly in Teams.", logo: "https://cdn.brandfetch.io/microsoft.com/w/400/h/400", url: "https://teams.microsoft.com", status: "coming_soon" },
    { name: "Twilio / SMS", description: "Send SMS alerts for urgent incidents, shift reminders, and schedule changes.", logo: "https://cdn.brandfetch.io/twilio.com/w/400/h/400", url: "https://www.twilio.com", status: "available", connected: true },
  ],
  "On-Demand Pay": [
    { name: "Clair", description: "Empower employees with flexible access to their earnings at the end of every shift.", logo: null, url: "https://getclair.com", status: "coming_soon" },
    { name: "DailyPay", description: "Give employees instant access to their earned wages before payday.", logo: null, url: "https://www.dailypay.com", status: "coming_soon" },
    { name: "Branch", description: "Instant pay and financial tools to help employees manage their money.", logo: null, url: "https://www.branchapp.com", status: "coming_soon" },
  ],
  "Compliance & Safety": [
    { name: "DocuSign", description: "Digitally sign compliance documents, incident reports, and contracts.", logo: "https://cdn.brandfetch.io/docusign.com/w/400/h/400", url: "https://www.docusign.com", status: "coming_soon" },
    { name: "SafetyCulture (iAuditor)", description: "Streamline safety audits and inspections across all your locations.", logo: null, url: "https://safetyculture.com", status: "coming_soon" },
    { name: "Checkr", description: "Fast, accurate background checks for new hires and staff renewals.", logo: null, url: "https://checkr.com", status: "coming_soon" },
  ],
  "Scheduling & Time": [
    { name: "Apple Calendar", description: "Sync shifts to Apple Calendar for iPhone and Mac users.", logo: null, url: "https://www.apple.com/calendar", status: "coming_soon" },
    { name: "Outlook Calendar", description: "Export schedules and sync shifts directly with Outlook.", logo: "https://cdn.brandfetch.io/microsoft.com/w/400/h/400", url: "https://outlook.com", status: "coming_soon" },
  ],
};

const CATEGORIES = Object.keys(INTEGRATIONS);

const statusConfig = {
  available: { label: "Available", className: "bg-green-100 text-green-800" },
  coming_soon: { label: "Coming Soon", className: "bg-gray-100 text-gray-600" },
  connected: { label: "Connected", className: "bg-blue-100 text-blue-800" },
};

function IntegrationCard({ integration }) {
  const status = integration.connected ? "connected" : integration.status;
  const cfg = statusConfig[status] || statusConfig.available;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border border-gray-200 bg-white">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
            {integration.logo ? (
              <img src={integration.logo} alt={integration.name} className="w-8 h-8 object-contain" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            ) : null}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 items-center justify-center" style={{ display: integration.logo ? 'none' : 'flex' }}>
              <span className="text-xs font-bold text-gray-600">{integration.name[0]}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-gray-900 text-sm">{integration.name}</h3>
              {integration.badge && <Badge className="bg-[#1a9c5b]/10 text-[#1a9c5b] text-xs border-0">{integration.badge}</Badge>}
              {integration.connected && <span className="flex items-center gap-0.5 text-xs text-blue-600 font-medium"><CheckCircle2 className="w-3 h-3" />Connected</span>}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{integration.description}</p>
            <div className="flex items-center justify-between">
              <Badge className={`text-xs border-0 ${cfg.className}`}>{cfg.label}</Badge>
              {integration.status === "available" ? (
                <a href={integration.url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                    Connect <ExternalLink className="w-3 h-3" />
                  </Button>
                </a>
              ) : (
                <Button size="sm" variant="ghost" className="h-7 text-xs text-gray-400" disabled>Notify Me</Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Integrations() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const allIntegrations = Object.entries(INTEGRATIONS).flatMap(([cat, items]) =>
    items.map(i => ({ ...i, category: cat }))
  );

  const filtered = allIntegrations.filter(i => {
    const matchesSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || i.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const grouped = activeCategory === "All"
    ? CATEGORIES.reduce((acc, cat) => {
        const items = filtered.filter(i => i.category === cat);
        if (items.length) acc[cat] = items;
        return acc;
      }, {})
    : { [activeCategory]: filtered };

  const connectedCount = allIntegrations.filter(i => i.connected).length;
  const availableCount = allIntegrations.filter(i => i.status === "available").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200 px-6 py-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#1a9c5b]/10 text-[#1a9c5b] px-3 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" /> Integrations
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Connect your favorite tools</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-6">
            Sync LifeGuard Tracker with your payroll, HR, and operations software — no double entry, no missed details.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />{connectedCount} already connected</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-[#1a9c5b]" />{availableCount} available now</span>
            <span className="flex items-center gap-1.5"><Settings className="w-4 h-4 text-gray-400" />More coming soon</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search integrations..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", ...CATEGORIES].map(cat => (
              <Button key={cat} size="sm" variant={activeCategory === cat ? "default" : "outline"}
                className={activeCategory === cat ? "bg-[#1a9c5b] hover:bg-[#158a4e]" : "bg-white"}
                onClick={() => setActiveCategory(cat)}>
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Cards grouped by category */}
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-bold text-gray-900">{category}</h2>
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-sm text-gray-400">{items.length} integrations</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(i => <IntegrationCard key={i.name} integration={i} />)}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No integrations found</p>
            <p className="text-sm">Try a different search term or category</p>
          </div>
        )}

        {/* Partner CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-[#1a9c5b] to-[#158a4e] p-8 text-white text-center mt-6">
          <h3 className="text-xl font-bold mb-2">Want to see your product here?</h3>
          <p className="text-white/80 mb-4 text-sm">We're always looking for partners to make things easier for the businesses using LifeGuard Tracker.</p>
          <a href="mailto:integrations@lifeguardtracker.com">
            <Button className="bg-white text-[#1a9c5b] hover:bg-white/90 font-semibold">Become a Partner</Button>
          </a>
        </div>
      </div>
    </div>
  );
}