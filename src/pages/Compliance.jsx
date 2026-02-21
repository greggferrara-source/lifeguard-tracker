import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, CheckCircle2, FileText, Award, BarChart3, BookOpen, Star, ArrowRight, AlertCircle, Zap } from "lucide-react";

export default function Compliance() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const features = [
    {
      icon: AlertTriangle,
      title: "Real-Time Labor Law Alerts",
      description: "Get proactive alerts when labor laws shift. We monitor federal, state, and local regulations affecting aquatic facilities and flag potential violations before they become problems.",
      features: ["Minimum wage changes", "Overtime rule updates", "Safety regulation changes", "Certification requirements"]
    },
    {
      icon: CheckCircle2,
      title: "Automated Compliance Workflows",
      description: "Prebuilt workflows enforce compliance for everything from lifeguard certifications to pool safety inspections. Set it and forget it.",
      features: ["Certification tracking", "Safety inspections", "Chemical log compliance", "Guard rotation requirements"]
    },
    {
      icon: FileText,
      title: "Centralized Document & Policy Management",
      description: "All compliance documents stored in one accessible place. Employee handbooks, safety protocols, and policy sheets always current and auditable.",
      features: ["Policy templates", "Document storage", "Version control", "Employee acknowledgment"]
    },
    {
      icon: Award,
      title: "Training & Certification Management",
      description: "Automatically track and assign required certifications. CPR, lifeguard, first aid, and more—with expiry alerts and renewal reminders.",
      features: ["Certification tracking", "Renewal notifications", "Training records", "Compliance verification"]
    },
    {
      icon: BarChart3,
      title: "Streamlined Payroll Compliance & Reporting",
      description: "Automated tax calculations, payroll filings, and reporting with full audit trails and customizable reports on demand.",
      features: ["Wage & hour tracking", "Tax filings", "Audit-ready reports", "Regulatory reporting"]
    },
    {
      icon: BookOpen,
      title: "Aquatic Facility Safety Standards",
      description: "Built-in compliance with ADA, OSHA, and local aquatic facility safety standards. Know you're always meeting requirements.",
      features: ["ADA compliance", "OSHA standards", "Local regulations", "Safety protocols"]
    }
  ];

  const testimonials = [
    {
      name: "Riverside Community Pool",
      role: "Facility Manager",
      quote: "Having all our compliance documentation in one place has saved us hours every week. We can prove our safety standards instantly.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
      name: "Olympic Training Center",
      role: "Operations Manager",
      quote: "The certification tracking alone is worth it. No more missed renewals or compliance gaps. Peace of mind.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
      name: "Metro Aquatics Network",
      role: "Director",
      quote: "Automated alerts keep us ahead of regulation changes. We've never been better prepared for inspections.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">Compliance Software</p>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Compliance built around your pool
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                LifeGuard Tracker keeps your facility running smoothly with built-in compliance features that monitor labor laws, track certifications, and manage safety protocols—so you can focus on what matters.
              </p>

              <form onSubmit={handleSignup} className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Start Free Trial
                  </Button>
                </div>
                {submitted && (
                  <p className="text-green-600 text-sm mt-3">✓ Check your email to get started!</p>
                )}
              </form>

              <div className="flex gap-4">
                <Link to={createPageUrl("Dashboard")}>
                  <Button variant="outline" className="h-12 px-6">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-blue-200 to-cyan-200 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden">
                <div className="text-center">
                  <BarChart3 className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold">Compliance Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to stay compliant</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From labor law monitoring to certification tracking—all integrated with your scheduling and payroll.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by aquatic facilities</h2>
            <div className="flex justify-center items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-gray-600 font-semibold">4.9 out of 5</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-md">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Take control of your compliance</h2>
          <p className="text-xl mb-8 opacity-90">
            Stay ahead of labor laws, keep certifications current, and prove you meet every safety standard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 h-12 px-8 font-semibold flex items-center gap-2">
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10 h-12 px-8 font-semibold"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}