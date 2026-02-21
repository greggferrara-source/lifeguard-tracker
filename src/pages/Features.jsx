import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Clock, Users, BarChart2, AlertTriangle, Shield, CheckCircle2, Zap, Calendar, Lock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Features() {
  const location = useLocation();
  const [selectedModule, setSelectedModule] = useState("scheduling");

  useEffect(() => {
    // Extract module from URL path (e.g., /features/scheduling -> scheduling)
    const pathParts = location.pathname.split('/');
    const moduleParam = pathParts[pathParts.length - 1];
    if (moduleParam && moduleParam !== 'features' && moduleParam !== '') {
      setSelectedModule(moduleParam);
    }
  }, [location.pathname]);

  const modules = [
    {
      id: "scheduling",
      title: "Staff Scheduling",
      subtitle: "Scheduling your staff has never been easier.",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      features: [
        {
          title: "Spend Less Time Scheduling",
          description: "Set up locations, positions, and preferences once. Then quickly import employees via spreadsheet. Summer schedules that used to take days now take hours.",
          highlight: true
        },
        {
          title: "24/7 Mobile Access",
          description: "Staff access their schedule anytime from their phone, get shift reminders, swap shifts with one click, and sync to Google Calendar and iCloud."
        },
        {
          title: "Cross-Device Compatibility",
          description: "Web-based system. No installations needed. Build or adjust schedules on desktop, tablet, or mobile device."
        },
        {
          title: "Auto-Schedule Algorithm",
          description: "Fill unassigned shifts automatically while respecting availability, time off requests, desired hours, and max weekly hours. Then manually adjust as needed."
        },
        {
          title: "Employee Availability Management",
          description: "Employees manage their own availability on any device. Automatically integrates with your schedule so you instantly see who can work which shifts."
        },
        {
          title: "Prevent Conflicts & Compliance",
          description: "Automatically detect underage employees and prevent scheduling outside DOL regulations. Identify shift conflicts before they happen."
        }
      ]
    },
    {
      id: "timeclock",
      title: "Time Clock & Attendance",
      subtitle: "Time and attendance tracking built with your operation in mind",
      icon: Clock,
      color: "from-green-500 to-green-600",
      features: [
        {
          title: "Multiple Job Titles & Pay Rates",
          description: "Employees with lifeguard, manager, and instructor roles with different pay rates? No problem. Add multiple positions per employee and track hours by role automatically.",
          highlight: true
        },
        {
          title: "Multi-Facility Clock-In Tracking",
          description: "Check clock-ins across multiple locations from one dashboard. Get instant notifications when staff don't clock in, so you can follow up immediately."
        },
        {
          title: "GPS Verification",
          description: "See exactly where staff are when they clock in/out from mobile. Option to require a scheduled shift to clock in, keeping everything accountable."
        },
        {
          title: "Labor Cost Tracking",
          description: "Enter employee pay rates and get instant reports on labor expenses. Two clicks to see how much it costs to run each pool or program."
        },
        {
          title: "Payroll Export",
          description: "Export timesheets in multiple formats for quick payroll entry. Track to the minute or use rounding options for HR compliance."
        }
      ]
    },
    {
      id: "reports",
      title: "Shift Reports & Communications",
      subtitle: "Your one-stop-shop for simple staff communication",
      icon: AlertTriangle,
      color: "from-purple-500 to-purple-600",
      features: [
        {
          title: "Simple Report Submission",
          description: "Staff submit shift reports from mobile devices or workstations. Attach incident reports, facility inspections, and documents with one click.",
          highlight: true
        },
        {
          title: "Instant Notifications",
          description: "Get automatically notified via email or text when shift reports are submitted. Follow up on accidents or issues immediately."
        },
        {
          title: "Smart Tagging",
          description: "Reports are automatically tagged by relevant keywords like 'rescue,' 'training,' or 'incident.' Find related reports instantly by searching tags."
        },
        {
          title: "OCR & Document Indexing",
          description: "Handwritten notes on scanned PDFs are searchable. Attachments including images, office documents, and PDFs are automatically indexed for easy retrieval."
        }
      ]
    },
    {
      id: "employees",
      title: "Employee Management",
      subtitle: "Your staff. Your way.",
      icon: Users,
      color: "from-orange-500 to-orange-600",
      features: [
        {
          title: "Comprehensive Employee Profiles",
          description: "Track everything: address, date of birth, emergency contacts, phone, email, sizing information, and custom fields your organization needs.",
          highlight: true
        },
        {
          title: "Access Controls & Permissions",
          description: "Assign locations, positions, and access levels per employee. Control which modules staff can view (chemical records, maintenance, etc.)."
        },
        {
          title: "Supervisor Notes & Private Files",
          description: "Add confidential notes about employees for supervisors only. Upload documents like write-ups, recommendations, and performance files to profiles."
        },
        {
          title: "Seasonal Staff Management",
          description: "Built for summer-only and year-round operations. Easily activate/deactivate seasonal staff and handle mass importing/exporting of records."
        },
        {
          title: "Certifications Tracking",
          description: "Monitor certification expiry dates, renewal status, and get alerts when certifications are about to expire. Keep compliance effortless."
        }
      ]
    },
    {
      id: "alerts",
      title: "Alerts & Issue Tracking",
      subtitle: "Stay on top of operational issues before they become problems",
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
      features: [
        {
          title: "Real-Time Alerts",
          description: "Get instant notifications for understaffing, scheduling conflicts, certification expirations, and other critical operational issues.",
          highlight: true
        },
        {
          title: "Staffing Visibility",
          description: "Always know your coverage status. See which shifts are open, which locations are understaffed, and how many certified guards you have on duty."
        },
        {
          title: "Chemical & Compliance Tracking",
          description: "Log chemical levels and compliance checks. System flags when levels are out of range or inspections are due."
        },
        {
          title: "Overtime Monitoring",
          description: "Get alerted when employees approach or exceed their max weekly hours. Prevent costly overtime surprises."
        }
      ]
    }
  ];

  const current = modules.find(m => m.id === selectedModule);
  const IconComponent = current.icon;

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="px-6 py-20 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">Powerful Features Built for Aquatics</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to run your facility efficiently. From scheduling to compliance, we've got you covered.</p>
      </section>

      {/* Module Selector */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-5 gap-3">
          {modules.map((module) => {
            const isActive = module.id === selectedModule;
            return (
              <button
                key={module.id}
                onClick={() => setSelectedModule(module.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isActive
                    ? `border-[#1a9c5b] bg-[#f0faf5]`
                    : "border-gray-200 hover:border-[#1a9c5b]"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center mb-2`}>
                  <module.icon className="w-5 h-5 text-white" />
                </div>
                <p className={`font-semibold text-sm ${isActive ? "text-[#1a9c5b]" : "text-gray-900"}`}>
                  {module.title}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Module Details */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${current.color} flex items-center justify-center`}>
              <IconComponent className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900">{current.title}</h2>
              <p className="text-lg text-gray-600">{current.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {current.features.map((feature, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-xl border ${
                feature.highlight
                  ? `border-[#1a9c5b] bg-gradient-to-br from-[#f0faf5] to-white`
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                {feature.highlight && (
                  <div className="w-6 h-6 rounded-full bg-[#1a9c5b] flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="px-6 py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">What makes us different?</h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            We're built specifically for aquatics operations, not just generic workforce management.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Fast Setup",
                description: "Import employees and locations in minutes. Start scheduling immediately without complex configurations."
              },
              {
                icon: Lock,
                title: "Enterprise Security",
                description: "Role-based access controls, encrypted data, and compliance with aquatics industry standards."
              },
              {
                icon: Bell,
                title: "Smart Notifications",
                description: "Receive alerts for staffing gaps, compliance issues, and operational problems before they impact your facility."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-[#f0faf5] rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-[#1a9c5b]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to transform your operations?</h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Join hundreds of aquatic facilities using LifeGuard Tracker to streamline scheduling, time tracking, and compliance.
        </p>
        <Link to={createPageUrl("Dashboard")}>
          <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white px-8 py-6 text-lg rounded-xl h-auto">
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  );
}