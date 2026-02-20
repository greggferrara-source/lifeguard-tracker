import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Star, Shield, Award, CheckCircle2, Mail, BookOpen, Play, MessageSquare } from "lucide-react";

const testimonials = [
  {
    quote: "ShiftGuard cut our scheduling time in half. The automated alerts for understaffing alone saved us from multiple incidents this summer.",
    name: "Maria T.",
    title: "Aquatic Director, Riverside Rec Center",
    avatar: "MT",
    color: "bg-blue-500",
  },
  {
    quote: "Finally a system that understands what pool managers actually need. The chemical log tracking and cert expiry alerts are game changers.",
    name: "James K.",
    title: "Head Lifeguard Supervisor, Oceanview Waterpark",
    avatar: "JK",
    color: "bg-purple-500",
  },
  {
    quote: "Our staff actually use it because it's so simple. The shift swap feature has practically eliminated the frantic group texts.",
    name: "Sarah M.",
    title: "Pool Manager, Lakeside Community Center",
    avatar: "SM",
    color: "bg-[#1a9c5b]",
  },
];

const awards = [
  {
    icon: Shield,
    title: "SOC 2 Compliant",
    subtitle: "Security & Privacy",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    icon: Award,
    title: "NRPA Recognized",
    subtitle: "Parks & Rec Partner",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    icon: CheckCircle2,
    title: "PHTA Certified",
    subtitle: "Pool & Hot Tub Industry",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  {
    icon: Star,
    title: "4.9★ Rated",
    subtitle: "500+ facilities",
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
];

const support = [
  { icon: BookOpen, label: "Documentation", page: "Docs" },
  { icon: Play, label: "Video Tutorials", page: "Tutorials" },
  { icon: Mail, label: "Contact Support", page: "Contact" },
  { icon: MessageSquare, label: "Live Chat", page: "Contact" },
];

export default function DashboardFooter() {
  return (
    <div>
      {/* Testimonials */}
      <section className="px-6 py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#1a9c5b] uppercase tracking-widest mb-2">Trusted by aquatic teams</p>
            <h2 className="text-4xl font-bold text-gray-900">What managers are saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 border border-gray-200 flex flex-col gap-5 shadow-sm">
                <div className="flex gap-0.5">
                  {Array(5).fill(0).map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed text-sm flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Links */}
      <section className="px-6 py-16 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Need help?</h2>
            <p className="text-gray-500">We're here to make sure your team succeeds with ShiftGuard.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {support.map((s, i) => (
              <Link key={i} to={createPageUrl(s.page)} className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-200 hover:border-[#1a9c5b] hover:bg-[#f0faf5] transition-all group text-center">
                <div className="w-11 h-11 rounded-xl bg-gray-50 group-hover:bg-[#1a9c5b] flex items-center justify-center transition-colors">
                  <s.icon className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1a9c5b]">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Awards / Certification Banners */}
      <section className="px-6 py-12 bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest mb-8">Recognized & Certified</p>
          <div className="flex flex-wrap justify-center gap-4">
            {awards.map((a, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${a.border} ${a.bg} bg-opacity-10 border-opacity-30`} style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)" }}>
                <a.icon className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="text-sm font-semibold text-white leading-none">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#1a9c5b]" />
              <span className="font-semibold text-gray-300">ShiftGuard</span>
              <span>— Workforce management for aquatic facilities</span>
            </div>
            <div className="flex items-center gap-5">
              <Link to={createPageUrl("Terms")} className="hover:text-gray-300 transition-colors">Terms</Link>
              <Link to={createPageUrl("Privacy")} className="hover:text-gray-300 transition-colors">Privacy</Link>
              <Link to={createPageUrl("Contact")} className="hover:text-gray-300 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}