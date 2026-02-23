import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, CalendarDays, Users, AlertTriangle, Droplets, BarChart2, 
  BookOpen, Zap, Trophy, Radio, TrendingUp, CheckCircle2
} from 'lucide-react';

const allFeatures = [
  {
    category: "Scheduling & Team Management",
    icon: CalendarDays,
    features: [
      { title: "Smart Scheduling", desc: "Drag-and-drop schedule builder with conflict detection, open shifts, and rotation management" },
      { title: "Team Management", desc: "Employee profiles, roles, availability, certifications, and onboarding in one place" },
      { title: "Time & Attendance", desc: "Clock in/out, time-off requests, shift swap approvals, and payroll-ready exports" },
      { title: "Workforce Forecasting", desc: "Predict staffing needs based on incident history and facility patterns" }
    ]
  },
  {
    category: "Compliance & Safety",
    icon: Shield,
    features: [
      { title: "Compliance Dashboard", desc: "Audit-ready compliance checks, certification expiry alerts, and inspection logs" },
      { title: "Incident Management", desc: "Comprehensive incident reporting with AI analysis, trend detection, and predictive recommendations" },
      { title: "Emergency Action Plans", desc: "Build and distribute EAPs for every emergency scenario with step-by-step procedures" },
      { title: "Safety Risk Prediction", desc: "AI predicts incident risk levels, recommends staffing, identifies training gaps" }
    ]
  },
  {
    category: "IoT & Analytics",
    icon: Radio,
    features: [
      { title: "Real-time Sensor Monitoring", desc: "Live water/air quality monitoring for pH, chlorine, temperature, humidity" },
      { title: "Historical Analytics", desc: "Visualize trends over time with detailed metrics and statistical analysis" },
      { title: "Anomaly Detection", desc: "Automatically identify abnormal readings and correlate with facility conditions" },
      { title: "Predictive Reports", desc: "AI-generated insights and recommendations based on historical patterns" }
    ]
  },
  {
    category: "Training & Development",
    icon: BookOpen,
    features: [
      { title: "Gamified Training", desc: "Earn points, badges, streaks, and compete on leaderboards" },
      { title: "Personalized Recommendations", desc: "AI recommends modules based on incident trends and performance" },
      { title: "Progress Tracking", desc: "Visual progress indicators, completion rates, and achievement tracking" },
      { title: "Quiz & Certification", desc: "Build custom quizzes with multiple choice, true/false, and short answer questions" }
    ]
  },
  {
    category: "Communications",
    icon: Users,
    features: [
      { title: "Announcements", desc: "Broadcast important messages to entire team or specific groups" },
      { title: "Team Channels", desc: "Organized discussions by topic or department" },
      { title: "Direct Messaging", desc: "One-on-one conversations with team members" },
      { title: "Instant Alerts", desc: "Real-time notifications for critical events and emergencies" }
    ]
  },
  {
    category: "Advanced Analytics",
    icon: BarChart2,
    features: [
      { title: "Custom Reports", desc: "Generate reports with your choice of metrics and time periods" },
      { title: "PDF/CSV Export", desc: "Download reports for sharing and external compliance" },
      { title: "Multi-Location Rollup", desc: "View combined analytics across all your facilities" },
      { title: "Incident Trend Analysis", desc: "Identify patterns and root causes to prevent future incidents" }
    ]
  }
];

export default function Features() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">LifeGuard Tracker Features</h1>
          <p className="text-lg text-gray-600">Complete tools for lifeguard scheduling, facility management, incident response, and staff development</p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {allFeatures.map((category, idx) => {
            const Icon = category.icon;
            return (
              <Card key={idx} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-[#1a9c5b]" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.features.map((feature, i) => (
                    <div key={i} className="pb-4 border-b last:border-b-0 last:pb-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Key Differentiators */}
        <div className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Why Choose LifeGuard Tracker?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Insights",
                desc: "Machine learning predicts safety risks, recommends staffing, and suggests training based on incident trends"
              },
              {
                title: "IoT Integration",
                desc: "Connect water quality sensors for real-time monitoring, anomaly detection, and automated alerts"
              },
              {
                title: "Gamified Engagement",
                desc: "Boost training completion with points, badges, leaderboards, and achievement tracking"
              },
              {
                title: "Comprehensive Analytics",
                desc: "Analyze incident patterns, staffing efficiency, training effectiveness, and facility performance"
              },
              {
                title: "Flat-Fee Pricing",
                desc: "No per-user charges. One price for your entire facility no matter how many staff you add"
              },
              {
                title: "Enterprise-Ready",
                desc: "Multi-location management, centralized reporting, audit trails, and compliance automation"
              }
            ].map((item, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#1a9c5b] flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}