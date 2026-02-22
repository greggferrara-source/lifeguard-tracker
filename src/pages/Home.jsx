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
  FileText,
  BookOpen,
  MapPin,
  Zap,
  Globe,
  ClipboardList,
  Droplets,
  Wrench,
  UserCheck,
  DollarSign,
  Bell,
  Eye,
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
  { icon: CalendarDays, title: "Smart Scheduling", desc: "Drag-and-drop schedule builder with conflict detection, open shifts, and rotation management." },
  { icon: Users, title: "Team Management", desc: "Employee profiles, roles, availability, certifications, and onboarding in one place." },
  { icon: Clock, title: "Time & Attendance", desc: "Clock in/out, time-off requests, shift swap approvals, and payroll-ready exports." },
  { icon: Shield, title: "Compliance Dashboard", desc: "Audit-ready compliance checks, certification expiry alerts, and inspection logs." },
  { icon: AlertTriangle, title: "Incident Logs", desc: "Log rescues, injuries, and near-misses with photo attachments, severity tracking, and follow-up workflows." },
  { icon: ClipboardList, title: "Checklists & Forms", desc: "Digital daily checklists and custom operational forms for every area of your facility." },
  { icon: Droplets, title: "Chemical Logs", desc: "Track pH, chlorine, and other chemical readings with automated alerts for out-of-range values." },
  { icon: Wrench, title: "Asset Tracking", desc: "Manage rescue tubes, AEDs, and all facility assets with maintenance schedules and status tracking." },
  { icon: BookOpen, title: "Staff Training", desc: "Assign training modules with quizzes, track completion rates, and ensure every guard is prepared." },
  { icon: FileText, title: "Emergency Action Plans", desc: "Build and distribute step-by-step EAPs for every emergency scenario — drowning, lightning, missing patron, and more." },
  { icon: BarChart2, title: "Reports & Analytics", desc: "Staffing reports, patron counts, chemical trends, labor cost analysis, and exportable compliance records." },
  { icon: MessageSquare, title: "Communications", desc: "Announcements, team channels, direct messages, and instant broadcast alerts." },
  { icon: UserCheck, title: "Patron Counts", desc: "Track pool capacity in real time. Log entries and exits with occupancy alerts." },
  { icon: DollarSign, title: "Payroll Integration", desc: "Sync timesheets and schedules directly to Gusto, ADP, Paychex, and other payroll providers." },
  { icon: Globe, title: "Multi-Location Dashboard", desc: "Manage multiple pools and facilities from a single enterprise dashboard with rollup reporting." },
  { icon: Bell, title: "Alerts & Notifications", desc: "Automated alerts for expiring certifications, unresolved incidents, chemical failures, and more." },
  { icon: Eye, title: "Public Safety Dashboard", desc: "A shareable, real-time status board showing guard coverage and safety conditions to patrons." },
  { icon: MapPin, title: "Locations Management", desc: "Manage unlimited facility locations with per-location settings, staff, and compliance records." },
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
    price: "$29",
    period: "/month",
    annual: "$290/year",
    highlight: false,
    features: ["Scheduling & shifts", "Employee profiles", "Time off management", "Basic reports"],
  },
  {
    name: "Pro",
    price: "$149",
    period: "/month",
    annual: "$990/year",
    highlight: true,
    features: ["Everything in Starter", "Compliance & cert tracking", "Payroll integrations", "Automated alerts"],
  },
  {
    name: "Enterprise",
    price: "$999",
    period: "/month",
    annual: "$4,990/year",
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
    <div className="bg-white min-h-screen" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", WebkitTextSizeAdjust: "100%" }}>

      {/* ── Top utility bar ── */}
      <div className="hidden lg:flex justify-end items-center gap-5 px-8 py-2 text-xs text-gray-500 border-b border-gray-100 bg-white">
        <a href="mailto:support@lifeguardtracker.app" className="hover:text-gray-900 transition-colors">Support</a>
        <span className="text-gray-300">|</span>
        <Link to={createPageUrl("Contact")} className="hover:text-gray-900 transition-colors">Contact</Link>
        <span className="text-gray-300">|</span>
        <button onClick={handleSignIn} className="hover:text-gray-900 transition-colors">Login</button>
      </div>

      {/* ── Main Nav ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#1a9c5b] flex-shrink-0 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-base sm:text-lg text-gray-900 leading-none block truncate">LifeGuard Tracker</span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 leading-none tracking-wide uppercase hidden sm:block">Aquatic Workforce Management</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#benefits" className="hover:text-gray-900 transition-colors">Benefits</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Industries</a>
            <Link to={createPageUrl("Pricing")} className="hover:text-gray-900 transition-colors">Pricing</Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSignIn}
              className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-bold text-sm h-10 px-5 rounded-md transition-all"
            >
              Try It Free
            </Button>
            <Button
              onClick={() => setShowDemoModal(true)}
              className="bg-gray-900 hover:bg-[#1a9c5b] text-white font-bold text-sm h-10 px-5 rounded-md transition-all"
            >
              <Play className="w-4 h-4" />
              Watch a Demo
            </Button>
          </div>

          {/* Mobile: CTA + menu toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              onClick={handleSignIn}
              className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white font-bold text-xs h-8 px-3 rounded-md"
            >
              Try Free
            </Button>
            <button className="p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 px-4 py-4 space-y-1 bg-white shadow-lg">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-700 py-3 px-2 rounded-lg hover:bg-gray-50 active:bg-gray-100">Features</a>
            <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-700 py-3 px-2 rounded-lg hover:bg-gray-50 active:bg-gray-100">Benefits</a>
            <Link to={createPageUrl("Pricing")} onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-700 py-3 px-2 rounded-lg hover:bg-gray-50 active:bg-gray-100">Pricing</Link>
            <div className="pt-3 border-t border-gray-100 mt-2">
              <button onClick={() => { setMobileMenuOpen(false); setShowDemoModal(true); }} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-gray-700 border-2 border-gray-300 rounded-lg mb-2 active:bg-gray-50">
                <Play className="w-4 h-4" /> Watch a Demo
              </button>
              <button onClick={() => { setMobileMenuOpen(false); handleSignIn(); }} className="w-full py-3 text-sm font-bold text-white bg-[#1a9c5b] rounded-lg active:bg-[#158a4e]">
                Sign In / Sign Up
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="px-4 sm:px-6 pt-12 sm:pt-20 pb-8 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-4 sm:mb-6 tracking-tight">
          <span className="text-[#1a9c5b]">Smarter Scheduling,</span><br />
          <span className="text-gray-900">Safer Facilities.</span>
        </h1>
        <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
          Get the right <span className="text-[#1a9c5b] font-semibold">lifeguards</span> in the right <span className="text-gray-800 font-semibold">location</span> at the right <span className="text-[#1a9c5b] font-semibold">time</span>. Purpose-built for aquatic facilities.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
          <Button
            variant="outline"
            onClick={handleSignIn}
            className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-5 text-base font-bold rounded-md h-auto transition-all w-full sm:w-auto"
          >
            Try It Free
          </Button>
          <Button
            onClick={() => setShowDemoModal(true)}
            className="bg-gray-900 hover:bg-[#1a9c5b] text-white px-8 py-5 text-base font-bold rounded-md h-auto transition-all w-full sm:w-auto"
          >
            <Play className="w-4 h-4" />
            Watch a Demo
          </Button>
        </div>
      </section>

      {/* ── Hero Image Grid ── */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-16 max-w-6xl mx-auto">
        {/* Mobile: single image */}
        <div className="block sm:hidden rounded-2xl overflow-hidden shadow-lg h-52">
          <img
            src="https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=500&fit=crop&crop=center"
            alt="Lifeguard on duty at pool"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Tablet+: staggered grid */}
        <div className="hidden sm:grid grid-cols-3 gap-4">
          <div className="rounded-2xl overflow-hidden shadow-lg h-64 sm:h-72 lg:h-80">
            <img
              src="https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=500&fit=crop&crop=center"
              alt="Lifeguard on duty at pool"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg h-64 sm:h-72 lg:h-80 mt-10">
            <img
              src="https://images.unsplash.com/photo-1560090995-01632a28895b?w=600&h=500&fit=crop&crop=center"
              alt="Aquatics team briefing"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg h-64 sm:h-72 lg:h-80">
            <img
              src="https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&h=500&fit=crop&crop=center"
              alt="Lifeguard watching pool"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-t border-b border-gray-100 bg-gray-50 py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold text-[#1a9c5b]">{s.value}</p>
              <p className="text-sm text-gray-500 mt-2 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section id="benefits" className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">
          {benefits.map((b) => (
            <div
              key={b.tag}
              className={`flex flex-col ${b.reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-8 sm:gap-12`}
            >
              {/* Image */}
              <div className="w-full lg:w-1/2 relative">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img src={b.img} alt={b.imgAlt} className="w-full h-56 sm:h-72 lg:h-80 object-cover" />
                </div>
                {/* Floating accent card — desktop only */}
                <div className={`absolute -bottom-5 ${b.reverse ? "-left-5" : "-right-5"} bg-white rounded-xl shadow-lg p-4 border border-gray-100 max-w-xs hidden lg:block`}>
                  <p className="text-xs font-bold text-[#1a9c5b] uppercase tracking-wide mb-1">By the Numbers</p>
                  <p className="text-sm text-gray-700 font-medium leading-snug">{b.stat}</p>
                </div>
              </div>

              {/* Text */}
              <div className="w-full lg:w-1/2">
                <span className="inline-block text-xs font-bold tracking-widest text-[#1a9c5b] uppercase mb-3">{b.tag}</span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-5 leading-tight">{b.title}</h2>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4 sm:mb-6">{b.body}</p>
                {/* Inline stat on mobile */}
                <p className="text-sm text-[#1a9c5b] font-semibold mb-4 lg:hidden">{b.stat}</p>
                <button
                  onClick={handleSignIn}
                  className="inline-flex items-center gap-2 text-[#1a9c5b] font-bold text-sm"
                >
                  Learn More <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="px-4 sm:px-6 py-14 sm:py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block text-xs font-bold tracking-widest text-[#1a9c5b] uppercase mb-3">FULL FEATURE LIST</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Everything your facility needs</h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
              One platform to replace the spreadsheets, group texts, and paper logs — 18 purpose-built tools for aquatic professionals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-[#1a9c5b] transition-all group cursor-default h-full"
              >
                <div className="w-10 h-10 bg-[#f0faf5] group-hover:bg-[#1a9c5b] rounded-lg flex items-center justify-center mb-4 transition-colors">
                  <f.icon className="w-5 h-5 text-[#1a9c5b] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-base">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button onClick={handleSignIn} className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white font-bold px-8 py-5 rounded-md h-auto text-base">
              Get Started Free — No Credit Card Required
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="px-4 sm:px-6 py-14 sm:py-20 max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Trusted by aquatic teams</h2>
          <p className="text-base sm:text-lg text-gray-500">See what managers and directors are saying.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
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
      <section className="px-4 sm:px-6 py-12 sm:py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Built for Every Aquatic Facility</h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">From community pools to water parks — LifeGuard Tracker works everywhere.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
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
      <section className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto text-center mb-10 sm:mb-12">
          <span className="inline-block text-xs font-bold tracking-widest text-[#1a9c5b] uppercase mb-4">PRICING</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Flat-fee pricing. Add your whole team free.</h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
            No per-user fees — ever. One flat monthly price for your entire facility, no matter how many guards you add. Cheaper than competitors once you factor in headcount.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-10">
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
              <p className="text-sm text-gray-400 mb-5">Flat fee · {plan.annual}</p>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-gray-400 text-sm ml-1">{plan.period}</span>
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

      {/* ── No Reason Not To Box ── */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: headline */}
            <div className="bg-[#1a9c5b] px-8 sm:px-12 py-10 flex flex-col justify-center">
              <p className="text-xs font-bold tracking-widest text-white/70 uppercase mb-3">Get Started Today</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                No reason<br />not to start.
              </h2>
              <p className="text-white/80 text-sm mt-3 leading-relaxed">
                Everything you need to get your facility running — with zero upfront commitment.
              </p>
              <button
                onClick={handleSignIn}
                className="mt-6 inline-flex items-center gap-2 bg-white text-[#1a9c5b] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors w-fit"
              >
                Create Free Account <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {/* Right: benefits list */}
            <div className="px-8 sm:px-12 py-10 flex flex-col justify-center gap-5">
              {[
                { icon: CheckCircle2, title: "Free to Get Started", body: "Full access with no credit card required. Upgrade only when you're ready." },
                { icon: CheckCircle2, title: "Unlimited Onboarding Support", body: "Our team will train your staff and walk you through setup at no cost." },
                { icon: CheckCircle2, title: "Legacy Data Migration", body: "We'll help you import your existing schedules, employees, and records." },
                { icon: CheckCircle2, title: "Works on Any Device", body: "No special hardware or software installs. Works in any modern browser." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-[#1a9c5b] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA Banner ── */}
      <section className="mx-4 sm:mx-6 mb-12 sm:mb-16 rounded-2xl sm:rounded-3xl bg-gray-900 px-6 sm:px-10 py-12 sm:py-16 max-w-6xl lg:mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
          Ready to transform how you manage your aquatic team?
        </h2>
        <p className="text-gray-400 text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">
          Join hundreds of facilities already running smarter, safer operations with LifeGuard Tracker.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleSignIn}
            className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-gray-900 px-8 py-5 text-base font-bold rounded-md h-auto transition-all w-full sm:w-auto"
          >
            Try It Free
          </Button>
          <Button
            onClick={() => setShowDemoModal(true)}
            className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white px-8 py-5 text-base font-bold rounded-md h-auto transition-all w-full sm:w-auto"
          >
            <Play className="w-4 h-4" />
            Watch a Demo
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 px-4 sm:px-6 py-10 bg-white">
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

      {/* ── Demo Video Modal ── */}
      {showDemoModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-0 sm:px-4"
          onClick={() => setShowDemoModal(false)}
        >
          <div
            className="relative w-full sm:max-w-3xl bg-black rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="aspect-video flex items-center justify-center bg-gray-900">
              <div className="text-center text-white px-8">
                <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mx-auto mb-6">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Demo Video Coming Soon</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">
                  We're putting the finishing touches on our product demo. In the meantime, sign up free and explore the app yourself.
                </p>
                <button
                  onClick={() => { setShowDemoModal(false); handleSignIn(); }}
                  className="mt-6 inline-flex items-center gap-2 bg-[#1a9c5b] hover:bg-[#158a4e] text-white font-bold px-6 py-3 rounded-md transition-colors"
                >
                  Try It Free <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}