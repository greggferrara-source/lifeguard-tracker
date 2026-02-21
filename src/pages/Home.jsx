import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import {
  Shield,
  CalendarDays,
  Users,
  Clock,
  BarChart2,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Star,
  Zap,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: CalendarDays,
    title: "Smart Scheduling",
    description: "Build weekly schedules with drag-and-drop ease. Spot conflicts instantly and fill open shifts in seconds.",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Manage employee profiles, roles, certifications, and availability all in one place.",
  },
  {
    icon: Clock,
    title: "Time & Attendance",
    description: "Clock in/out tracking, time-off requests, and shift swap approvals — streamlined for your team.",
  },
  {
    icon: Shield,
    title: "Compliance & Safety",
    description: "Track certification expiry dates, run compliance checks, and stay ahead of audits automatically.",
  },
  {
    icon: BarChart2,
    title: "Reports & Insights",
    description: "Generate attendance reports, chemical logs, patron counts, and staffing analytics with one click.",
  },
  {
    icon: MessageSquare,
    title: "Communications",
    description: "Send announcements, broadcast alerts, and message your team directly through the platform.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Aquatics Director",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    text: "LifeGuard Tracker cut our scheduling time in half. I can see the whole week at a glance and my team actually shows up on time now.",
    stars: 5,
  },
  {
    name: "Jason R.",
    role: "Pool Manager",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    text: "The certification tracking alone is worth it. No more scrambling to find out who's expired — it just tells me.",
    stars: 5,
  },
  {
    name: "Tina L.",
    role: "Parks & Rec Supervisor",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    text: "We manage 4 locations and this is the only tool that keeps everyone on the same page. Highly recommend.",
    stars: 5,
  },
];

const plans = [
  {
    name: "Starter",
    price: "$4.99",
    users: "1–25 users",
    highlight: false,
    features: ["Scheduling", "Employee profiles", "Time off management", "Basic reports"],
  },
  {
    name: "Pro",
    price: "$3.99",
    users: "25–249 users",
    highlight: true,
    features: ["Everything in Starter", "Compliance tracking", "Payroll integrations", "Alerts & notifications"],
  },
  {
    name: "Enterprise",
    price: "$2.49",
    users: "250+ users",
    highlight: false,
    features: ["Everything in Pro", "Multi-location management", "Advanced analytics", "Priority support"],
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then((auth) => {
      if (auth) {
        navigate(createPageUrl("Dashboard"));
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  const handleSignIn = () => {
    base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  };

  if (checking) return null;

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Top utility bar */}
      <div className="hidden sm:flex justify-end items-center gap-4 px-8 py-2 text-xs text-gray-500 border-b border-gray-100">
        <a href="mailto:support@lifeguardtracker.app" className="hover:text-gray-800">Support</a>
        <span>|</span>
        <Link to={createPageUrl("Contact")} className="hover:text-gray-800">Contact</Link>
        <span>|</span>
        <button onClick={handleSignIn} className="hover:text-gray-800">Login</button>
      </div>

      {/* Main Nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1a9c5b] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900 leading-none block">LifeGuard Tracker</span>
              <span className="text-xs text-gray-400 leading-none">Aquatic Workforce Management</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#testimonials" className="hover:text-gray-900">Benefits</a>
            <Link to={createPageUrl("Pricing")} className="hover:text-gray-900">Pricing</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSignIn}
              className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white rounded-lg px-5 font-semibold text-sm h-10"
            >
              Try It Free
            </Button>
            <Button
              onClick={handleSignIn}
              className="bg-gray-900 hover:bg-gray-700 text-white rounded-lg px-5 font-semibold text-sm h-10"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-20 pb-10 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          <span className="text-[#1a9c5b]">Smarter Scheduling,</span><br />
          Safer Facilities.
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Schedule lifeguards, track certifications, manage compliance, and keep your entire aquatic team aligned — from one simple dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleSignIn}
            className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-6 text-base font-bold rounded-lg h-auto"
          >
            Try It Free
          </Button>
          <Button
            onClick={handleSignIn}
            className="bg-gray-900 hover:bg-gray-700 text-white px-8 py-6 text-base font-bold rounded-lg h-auto"
          >
            Book a Demo
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Hero Photos */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-4 mt-10">
          <img
            src="https://images.unsplash.com/photo-1560090995-01632a28895b?w=500&h=380&fit=crop"
            alt="Lifeguard at pool"
            className="rounded-2xl object-cover w-full h-56 sm:h-72"
          />
          <img
            src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=500&h=380&fit=crop"
            alt="Aquatics team"
            className="rounded-2xl object-cover w-full h-56 sm:h-72 mt-6"
          />
          <img
            src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&h=380&fit=crop"
            alt="Pool facility"
            className="rounded-2xl object-cover w-full h-56 sm:h-72"
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything your facility needs</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              One platform to replace the spreadsheets, group texts, and paper logs you've been relying on.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-[#1a9c5b] transition-all group">
                <div className="w-10 h-10 bg-[#f0faf5] group-hover:bg-[#1a9c5b] rounded-lg flex items-center justify-center mb-4 transition-colors">
                  <f.icon className="w-5 h-5 text-[#1a9c5b] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="testimonials" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Trusted by aquatic teams</h2>
          <p className="text-lg text-gray-600">See what managers and directors are saying.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Simple, per-user pricing</h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            No hidden fees. No long-term contracts. Scale up or down as your team grows.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl border-2 p-8 relative transition-all ${
                plan.highlight ? "border-[#1a9c5b] shadow-xl" : "border-gray-200"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a9c5b] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{plan.users}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-gray-500 text-sm ml-1">/ user / month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-[#1a9c5b] flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleSignIn}
                className={`w-full font-semibold ${plan.highlight ? "bg-[#1a9c5b] hover:bg-[#158a4e] text-white" : "bg-gray-900 hover:bg-gray-700 text-white"}`}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to={createPageUrl("Pricing")}>
            <span className="text-sm text-[#1a9c5b] font-medium hover:underline cursor-pointer">View full pricing details →</span>
          </Link>
          <p className="text-sm text-gray-500 mt-2">No credit card required to get started</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ready to run better facilities?</h2>
        <p className="text-lg text-gray-600 mb-10">
          Join aquatic facilities already using LifeGuard Tracker to build smarter schedules and safer teams.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleSignIn}
            className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-10 py-6 text-base font-bold rounded-lg h-auto"
          >
            Try It Free
          </Button>
          <Button
            onClick={handleSignIn}
            className="bg-gray-900 hover:bg-gray-700 text-white px-10 py-6 text-base font-bold rounded-lg h-auto"
          >
            Book a Demo
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#1a9c5b] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">LifeGuard Tracker</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to={createPageUrl("Pricing")} className="hover:text-gray-900">Pricing</Link>
            <Link to={createPageUrl("Docs")} className="hover:text-gray-900">Docs</Link>
            <Link to={createPageUrl("Contact")} className="hover:text-gray-900">Contact</Link>
            <Link to={createPageUrl("Privacy")} className="hover:text-gray-900">Privacy</Link>
            <Link to={createPageUrl("Terms")} className="hover:text-gray-900">Terms</Link>
          </div>
          <p className="text-sm text-gray-400">© 2026 LifeGuard Tracker</p>
        </div>
      </footer>
    </div>
  );
}