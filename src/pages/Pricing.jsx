import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Shield, Zap, Users, ArrowRight, MessageSquare, Phone, Mail, Loader2, PauseCircle } from "lucide-react";

const PRICE_IDS = {
  starter: { monthly: "price_1T31vqJz3753BrBcR6JitqR6", annual: "price_1T31vqJz3753BrBcUNtRXIfx" },
  pro:     { monthly: "price_1T31vqJz3753BrBc5to85m1z", annual: "price_1T31vqJz3753BrBcmeWqkKRI" },
  enterprise: { monthly: "price_1T31vrJz3753BrBccB0BhD1Y", annual: "price_1T31vrJz3753BrBcIWbkLAymm" },
};

const sharedFeatures = [
  "Scheduling & shift management",
  "Time-off requests & approvals",
  "Shift swaps & availability",
  "Chemical & inspection logs",
  "Certification tracking + expiry alerts",
  "SMS & email notifications",
  "Reports & analytics",
  "AI scheduling assistant",
  "Up to 10 locations",
];

const plans = [
  {
    name: "Starter",
    priceKey: "starter",
    price: { monthly: 4.99, annual: 4.99 },
    yearlyDiscount: null,
    description: "Perfect for small facilities with 1–25 users.",
    badge: null,
    color: "border-gray-200",
    btnClass: "bg-gray-900 hover:bg-gray-800 text-white",
    userRange: "1–25 users",
    features: ["1–25 users", ...sharedFeatures],
    notIncluded: ["Full payroll module", "Custom roles & permissions", "Dedicated account manager", "Priority support"],
  },
  {
    name: "Pro",
    priceKey: "pro",
    price: { monthly: 3.99, annual: 3.99 },
    yearlyDiscount: null,
    description: "For growing aquatic programs with 25–249 users.",
    badge: "Most Popular",
    color: "border-[#1a9c5b]",
    btnClass: "bg-[#1a9c5b] hover:bg-[#158a4e] text-white",
    userRange: "25–249 users",
    features: ["25–249 users", ...sharedFeatures],
    notIncluded: ["Full payroll module", "Custom roles & permissions", "Dedicated account manager", "Priority support"],
  },
  {
    name: "Enterprise",
    priceKey: "enterprise",
    price: { monthly: 2.49, annual: 2.49 },
    yearlyDiscount: null,
    description: "For large facilities, parks departments, and waterparks.",
    badge: "Full Suite",
    color: "border-gray-200",
    btnClass: "bg-gray-900 hover:bg-gray-800 text-white",
    userRange: "250+ users",
    features: [
      "250+ users",
      "10+ locations (unlimited)",
      "Everything in Pro",
      "Full payroll module",
      "Custom roles & permissions",
      "SSO / SAML (coming soon)",
      "API access",
      "Dedicated account manager",
      "Phone & priority support",
      "Custom SLA",
    ],
    notIncluded: [],
  },
];

const supportPlans = [
  {
    name: "Standard",
    price: "Included",
    color: "bg-gray-50 border-gray-200",
    features: ["Email support", "Response within 2 business days", "Documentation & tutorials"],
  },
  {
    name: "Priority",
    price: "$29/mo",
    color: "bg-blue-50 border-blue-200",
    features: ["Email + chat support", "Response within 4 hours", "Onboarding call (1-time)", "Screen-share troubleshooting"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    color: "bg-[#f0faf5] border-[#1a9c5b]",
    features: ["Dedicated account manager", "Phone support", "Custom SLA guarantee", "Quarterly business reviews", "Data migration assistance"],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);

  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleCheckout = async (plan) => {
    if (plan.name === "Enterprise") {
      window.location.href = createPageUrl("Contact");
      return;
    }

    // Block checkout inside iframe (preview mode)
    if (window.self !== window.top) {
      alert("Checkout is only available from the published app, not the preview.");
      return;
    }

    setLoadingPlan(plan.priceKey);
    const priceId = PRICE_IDS[plan.priceKey][annual ? "annual" : "monthly"];
    const res = await base44.functions.invoke("createCheckout", {
      price_id: priceId,
      success_url: window.location.origin + createPageUrl("Dashboard"),
      cancel_url: window.location.origin + createPageUrl("Pricing"),
    });
    if (res.data?.url) {
      window.location.href = res.data.url;
    }
    setLoadingPlan(null);
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center">
        <Badge className="mb-4 bg-[#f0faf5] text-[#1a9c5b] border border-[#1a9c5b]/20">Transparent Pricing</Badge>
        <h1 className="text-5xl font-bold text-gray-900 mb-5">Plans for every facility</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Start free for 14 days. No credit card required. Cancel anytime.
        </p>
        <p className="text-gray-500 text-base">Pricing is per user, per month.</p>
      </section>

      {/* Plans */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border-2 ${plan.color} p-8 flex flex-col`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#1a9c5b] text-white px-3 py-1">{plan.badge}</Badge>
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-gray-900">
                  ${plan.price.monthly}
                </span>
                <span className="text-gray-400 ml-1">/user/month</span>
                <p className="text-xs text-gray-500 mt-1 font-medium">{plan.userRange}</p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-[#1a9c5b] mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.notIncluded.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-center leading-none">—</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full rounded-xl h-11 font-semibold ${plan.btnClass}`}
                onClick={() => handleCheckout(plan)}
                disabled={loadingPlan === plan.priceKey}
              >
                {loadingPlan === plan.priceKey ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Support Plans */}
      <section className="px-6 py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Support Plans</h2>
            <p className="text-gray-500 text-lg">Every plan includes standard support. Upgrade for faster help.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {supportPlans.map((sp, i) => (
              <div key={i} className={`rounded-2xl border-2 p-7 ${sp.color}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{sp.name} Support</h3>
                  <span className="text-sm font-semibold text-gray-600">{sp.price}</span>
                </div>
                <ul className="space-y-2.5">
                  {sp.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-[#1a9c5b] mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Questions about pricing?</h2>
        <p className="text-gray-500 text-lg mb-10">Our team is happy to walk you through the right plan for your facility.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl("Contact")}>
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white px-8 h-12 rounded-xl font-semibold">
              <Mail className="w-4 h-4 mr-2" /> Contact Sales
            </Button>
          </Link>
          <Link to={createPageUrl("Schedule")}>
            <Button variant="outline" className="px-8 h-12 rounded-xl font-semibold border-2">
              <Zap className="w-4 h-4 mr-2" /> Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}