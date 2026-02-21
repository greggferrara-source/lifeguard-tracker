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
  CheckCircle2,
  Star,
  ArrowRight,
  MessageSquare,
  Menu,
  X,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Data ───────────────────────────────────────────────────────────────────

const benefits = [
  {
    tag: "LIFEGUARD SCHEDULING",
    title: "Fill Every Guard Chair, Every Shift",
    body: "Build pool-side schedules that account for minimum guard ratios, zone coverage, and rotation breaks. Spot understaffed shifts before they happen and fill open positions instantly — keeping your patrons safe at all times.",
    stat: "50% less time spent scheduling every week.",
    img: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=700&h=500&fit=crop&crop=center",
    imgAlt: "Lifeguard on duty at pool",
    reverse: false,
  },
  {
    tag: "CERTIFICATION & COMPLIANCE",
    title: "Keep Your Guards Certified & Your Facility Legal",
    body: "Automatically track CPR, First Aid, NLS, and pool operator certifications for every guard. Get alerts 30 and 7 days before any cert lapses — so you're always compliant with health authority regulations and never scrambling before an inspection.",
    stat: "Zero certification surprises with automated expiry tracking.",
    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&h=500&fit=crop&crop=center",
    imgAlt: "Lifeguard certification records",
    reverse: true,
  },
  {
    tag: "AQUATIC TEAM COORDINATION",
    title: "Coordinate Your Entire Aquatic Team Instantly",
    body: "Send pool closures, weather alerts, chemical level updates, and shift changes directly to your guards in seconds. With built-in announcements and direct messaging, your team is always informed — from the head lifeguard to seasonal staff.",
    stat: "Instant communication across all your pools and locations.",
    img: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=700&h=500&fit=crop&crop=center",
    imgAlt: "Aquatic team coordination",
    reverse: false,
  },
];

const features = [
  { icon: CalendarDays, title: "Smart Scheduling", desc: "Drag-and-drop schedule builder with conflict detection and open shift management." },
  { icon: Users, title: "Team Management", desc: "Employee profiles, roles, availability, and certification tracking in one place." },
  { icon: Clock, title: "Time & Attendance", desc: "Clock in/out, time-off requests, and shift swap approvals — all streamlined." },
  { icon: Shield, title: "Compliance & Safety", desc: "Certification expiry alerts, compliance checks, and audit-ready digital records." },
  { icon: BarChart2, title: "Reports & Analytics", desc: "Staffing reports, chemical logs, patron counts, and payroll-ready exports." },
  { icon: MessageSquare, title: "Communications", desc: "Announcements, direct messages, and broadcast alerts to your whole team." },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Aquatics Director, City Recreation Center",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    text: "LifeGuard Tracker cut our scheduling time in half. I can see the whole week at a glance and my team shows up on time. It's transformed how we run our pools.",
    stars: 5,
  },
  {
    name: "Jason R.",
    role: "Head Pool Manager, Aquatic Center",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    text: "The certification tracking alone is worth it. No more scrambling when an auditor shows up — everything is right there, organized and up to date.",
    stars: 5,
  },
  {
    name: "Tina L.",
    role: "Parks & Recreation Supervisor",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    text: "We manage 4 locations and this is the only tool that keeps everyone aligned. The communication features alone have eliminated so much confusion.",
    stars: 5,
  },
];

const stats = [
  { value: "500+", label: "Aquatic Facilities" },
  { value: "10,000+", label: "Lifeguards Scheduled" },
  { value: "50%", label: "Less Scheduling Time" },
  { value: "98%", label: "Customer Satisfaction" },
];

const plans = [
  {
    name: "Starter",
    price: "$4.99",
    users: "1–25 users",
    highlight: false,
    features: ["Scheduling & shifts", "Employee profiles", "Time off management", "Basic reports"],
  },
  {
    name: "Pro",
    price: "$3.99",
    users: "25–249 users",
    highlight: true,
    features: ["Everything in Starter", "Compliance & cert tracking", "Payroll integrations", "Automated alerts"],
  },
  {
    name: "Enterprise",
    price: "$2.49",
    users: "250+ users",
    highlight: false,
    features: ["Everything in Pro", "Multi-location management", "Advanced analytics", "Priority support"],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then((auth) => {
      if (auth) navigate(createPageUrl("Dashboard"));
      else setChecking(false);
    });
  }, [navigate]);

  const handleSignIn = () => base44.auth.redirectToLogin(createPageUrl("Dashboard"));

  if (checking) return null;

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── Top utility bar ── */}
      <div className="hidden sm:flex justify-end items-center gap-5 px-8 py-2 text-xs text-gray-500 border-b border-gray-100 bg-white">
        <a href="mailto:support@lifeguardtracker.app" className="hover:text-gray-900 transition-colors">Support</a>
        <span className="text-gray-300">|</span>
        <Link to={createPageUrl("Contact")} className="hover:text-gray-900 transition-colors">Contact</Link>
        <span className="text-gray-300">|</span>
        <button onClick={handleSignIn} className="hover:text-gray-900 transition-colors">Login</button>
      </div>

      {/* ── Main Nav ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1a9c5b] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900 leading-none block">LifeGuard Tracker</span>
              <span className="text-[10px] text-gray-400 leading-none tracking-wide uppercase">Aquatic Workforce Management</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#benefits" className="hover:text-gray-900 transition-colors">Benefits</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Industries</a>
            <Link to={createPageUrl("Pricing")} className="hover:text-gray-900 transition-colors">Pricing</Link>
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSignIn}
              className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-bold text-sm h-10 px-5 rounded-md transition-all"
            >
              Try It Free
            </Button>
            <Button
              onClick={handleSignIn}
              className="bg-gray-900 hover:bg-[#1a9c5b] text-white font-bold text-sm h-10 px-5 rounded-md transition-all"
            >
              Book a Demo
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 px-6 py-4 space-y-3 bg-white">
            <a href="#features" className="block text-sm text-gray-700 py-1">Features</a>
            <a href="#benefits" className="block text-sm text-gray-700 py-1">Benefits</a>
            <Link to={createPageUrl("Pricing")} className="block text-sm text-gray-700 py-1">Pricing</Link>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleSignIn} className="flex-1 border-2 border-gray-800 text-gray-800 font-bold text-sm">Try It Free</Button>
              <Button onClick={handleSignIn} className="flex-1 bg-gray-900 text-white font-bold text-sm">Book Demo</Button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="px-6 pt-20 pb-8 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
          <span className="text-[#1a9c5b]">Smarter Scheduling,</span><br />
          <span className="text-gray-900">Safer Facilities.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Get the right <span className="text-[#1a9c5b] font-semibold">lifeguards</span> in the right <span className="text-gray-800 font-semibold">location</span> at the right <span className="text-[#1a9c5b] font-semibold">time</span>. Purpose-built for aquatic facilities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleSignIn}
            className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-10 py-6 text-base font-bold rounded-md h-auto transition-all"
          >
            Try It Free
          </Button>
          <Button
            onClick={handleSignIn}
            className="bg-gray-900 hover:bg-[#1a9c5b] text-white px-10 py-6 text-base font-bold rounded-md h-auto transition-all"
          >
            Book a Demo
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* ── Hero Image Grid (MakeShift style staggered) ── */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl overflow-hidden shadow-lg h-64 sm:h-80">
            <img
              src="https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=500&fit=crop&crop=center"
              alt="Lifeguard on duty at pool"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg h-64 sm:h-80 mt-10">
            <img
              src="https://images.unsplash.com/photo-1560090995-01632a28895b?w=600&h=500&fit=crop&crop=center"
              alt="Aquatics team briefing"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg h-64 sm:h-80">
            <img
              src="https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&h=500&fit=crop&crop=center"
              alt="Lifeguard watching pool"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-t border-b border-gray-100 bg-gray-50 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold text-[#1a9c5b]">{s.value}</p>
              <p className="text-sm text-gray-500 mt-2 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits (MakeShift alternating layout) ── */}
      <section id="benefits" className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-24">
          {benefits.map((b, i) => (
            <div
              key={b.tag}
              className={`flex flex-col ${b.reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12`}
            >
              {/* Image */}
              <div className="w-full lg:w-1/2 relative">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img src={b.img} alt={b.imgAlt} className="w-full h-80 object-cover" />
                </div>
                {/* Floating accent card */}
                <div className={`absolute -bottom-5 ${b.reverse ? "-left-5" : "-right-5"} bg-white rounded-xl shadow-lg p-4 border border-gray-100 max-w-xs hidden sm:block`}>
                  <p className="text-xs font-bold text-[#1a9c5b] uppercase tracking-wide mb-1">By the Numbers</p>
                  <p className="text-sm text-gray-700 font-medium leading-snug">{b.stat}</p>
                </div>
              </div>

              {/* Text */}
              <div className="w-full lg:w-1/2">
                <span className="inline-block text-xs font-bold tracking-widest text-[#1a9c5b] uppercase mb-3">{b.tag}</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">{b.title}</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">{b.body}</p>
                <button
                  onClick={handleSignIn}
                  className="inline-flex items-center gap-2 text-[#1a9c5b] font-bold text-sm hover:gap-3 transition-all"
                >
                  Learn More <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="px-6 py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything your facility needs</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              One platform to replace the spreadsheets, group texts, and paper logs.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl border border-gray-200 p-7 hover:shadow-lg hover:border-[#1a9c5b] transition-all group cursor-pointer"
              >
                <div className="w-11 h-11 bg-[#f0faf5] group-hover:bg-[#1a9c5b] rounded-xl flex items-center justify-center mb-5 transition-colors">
                  <f.icon className="w-5 h-5 text-[#1a9c5b] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Trusted by aquatic teams</h2>
          <p className="text-lg text-gray-500">See what managers and directors are saying.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-7 text-sm">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.img} alt={t.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-[#1a9c5b]/20" />
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Industry Section ── */}
      <section className="px-6 py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Built for Every Aquatic Facility</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">From community pools to water parks — LifeGuard Tracker works everywhere.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: "Community Pools", img: "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=400&h=280&fit=crop" },
              { label: "Water Parks", img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=280&fit=crop" },
              { label: "Beach & Lakes", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=280&fit=crop" },
              { label: "Recreation Centers", img: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=400&h=280&fit=crop" },
            ].map((ind) => (
              <div key={ind.label} className="rounded-xl overflow-hidden group cursor-pointer" onClick={handleSignIn}>
                <div className="relative h-40 overflow-hidden">
                  <img src={ind.img} alt={ind.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                  <div className="absolute inset-0 bg-gray-900/30 group-hover:bg-gray-900/10 transition-colors" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-white font-bold text-sm drop-shadow">{ind.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <span className="inline-block text-xs font-bold tracking-widest text-[#1a9c5b] uppercase mb-4">PRICING</span>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Simple, per-user pricing</h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            No hidden fees. No long-term contracts. Scale up or down as your team grows.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl border-2 p-8 relative transition-all hover:shadow-xl ${
                plan.highlight ? "border-[#1a9c5b] shadow-lg" : "border-gray-200"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1a9c5b] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-400 mb-5">{plan.users}</p>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-gray-400 text-sm ml-1">/ user / month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-[#1a9c5b] flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleSignIn}
                className={`w-full font-bold py-5 rounded-md h-auto ${
                  plan.highlight
                    ? "bg-[#1a9c5b] hover:bg-[#158a4e] text-white"
                    : "bg-gray-900 hover:bg-gray-700 text-white"
                }`}
              >
                Get Started Free
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to={createPageUrl("Pricing")} className="text-sm text-[#1a9c5b] font-semibold hover:underline">
            View full pricing details →
          </Link>
          <p className="text-xs text-gray-400 mt-2">No credit card required</p>
        </div>
      </section>

      {/* ── Final CTA Banner ── */}
      <section className="mx-6 mb-16 rounded-3xl bg-gray-900 px-10 py-16 max-w-6xl lg:mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
          Ready to transform how you<br className="hidden sm:block" /> manage your aquatic team?
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          Join hundreds of facilities already running smarter, safer operations with LifeGuard Tracker.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleSignIn}
            className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-gray-900 px-10 py-6 text-base font-bold rounded-md h-auto transition-all"
          >
            Try It Free
          </Button>
          <Button
            onClick={handleSignIn}
            className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white px-10 py-6 text-base font-bold rounded-md h-auto transition-all"
          >
            Book a Demo
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 px-6 py-10 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-[#1a9c5b] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">LifeGuard Tracker</span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs">Aquatic workforce management for pools, beaches, and recreation centers.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wide">Product</p>
                <div className="space-y-2">
                  <a href="#features" className="block text-gray-500 hover:text-gray-900">Features</a>
                  <Link to={createPageUrl("Pricing")} className="block text-gray-500 hover:text-gray-900">Pricing</Link>
                  <Link to={createPageUrl("Docs")} className="block text-gray-500 hover:text-gray-900">Documentation</Link>
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wide">Company</p>
                <div className="space-y-2">
                  <Link to={createPageUrl("Contact")} className="block text-gray-500 hover:text-gray-900">Contact</Link>
                  <Link to={createPageUrl("Tutorials")} className="block text-gray-500 hover:text-gray-900">Tutorials</Link>
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wide">Legal</p>
                <div className="space-y-2">
                  <Link to={createPageUrl("Privacy")} className="block text-gray-500 hover:text-gray-900">Privacy</Link>
                  <Link to={createPageUrl("Terms")} className="block text-gray-500 hover:text-gray-900">Terms</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">© 2026 LifeGuard Tracker. All rights reserved.</p>
            <p className="text-xs text-gray-400">Built for aquatic professionals.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}