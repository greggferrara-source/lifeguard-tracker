import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Award, AlertTriangle, BookOpen, FlaskConical, Wrench, CheckCircle2 } from "lucide-react";

const sections = [
  {
    id: "documents",
    icon: FileText,
    title: "Track Documents",
    subtitle: "All your compliance paperwork. One place. Always ready.",
    description:
      "Attach, organize, and retrieve important facility documents in seconds. Upload inspection certificates, permits, insurance policies, employee handbooks, and safety protocols so everything is instantly accessible when an auditor walks through the door.",
    bullets: [
      "Upload any file type — PDF, images, spreadsheets",
      "Link documents to specific locations or employees",
      "Never scramble before an inspection again",
      "Full history and version tracking"
    ],
    image: "https://images.unsplash.com/photo-1568219557405-376e23e4f7cf?w=700&h=500&fit=crop&crop=center",
    reverse: false
  },
  {
    id: "certifications",
    icon: Award,
    title: "Employee Certifications",
    subtitle: "Zero certification surprises.",
    description:
      "Every guard's CPR, First Aid, NLS, and pool operator certifications tracked automatically. LifeGuard Tracker alerts you 30 days and 7 days before any certification expires — so you're always compliant and never caught off guard.",
    bullets: [
      "Track CPR, First Aid, NLS, and custom certs",
      "30-day and 7-day expiry notifications",
      "Attach digital copies of certificates",
      "Manager review and approval workflow"
    ],
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&h=500&fit=crop&crop=center",
    reverse: true
  },
  {
    id: "incidents",
    icon: AlertTriangle,
    title: "Incident & Rescue Logs",
    subtitle: "Document every incident the moment it happens.",
    description:
      "When something happens at your pool, fast and accurate documentation is critical. Staff can submit incident and rescue reports directly from their phone — including written notes and photo attachments. Every record is timestamped, searchable, and ready for regulatory review.",
    bullets: [
      "Mobile-friendly incident submission",
      "Attach photos and supporting documents",
      "Automatic manager notifications",
      "Searchable log for audits and reviews"
    ],
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=700&h=500&fit=crop&crop=center",
    reverse: false
  },
  {
    id: "training",
    icon: BookOpen,
    title: "Employee Training",
    subtitle: "Keep your team trained and your records clean.",
    description:
      "Log in-service training sessions, track completion by employee, and store supporting materials all in one place. Know exactly who has completed what training and when — so you can confidently answer any question an inspector asks.",
    bullets: [
      "Log training sessions with attendance records",
      "Track completion per employee",
      "Attach training materials and sign-off sheets",
      "Onboarding checklists for new staff"
    ],
    image: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=700&h=500&fit=crop&crop=center",
    reverse: true
  },
  {
    id: "chemical",
    icon: FlaskConical,
    title: "Log Chemical Levels",
    subtitle: "Stay on top of your pool chemistry — every session.",
    description:
      "Record chlorine, pH, alkalinity, and other chemical readings directly from your device. LifeGuard Tracker flags readings outside safe ranges and keeps a complete chemical log history that's ready for health authority inspections at any time.",
    bullets: [
      "Log chlorine, pH, alkalinity, and more",
      "Out-of-range readings flagged instantly",
      "Complete historical log per location",
      "Export logs for regulatory reporting"
    ],
    image: "https://images.unsplash.com/photo-1564053489984-317bbd824340?w=700&h=500&fit=crop&crop=center",
    reverse: false
  },
  {
    id: "maintenance",
    icon: Wrench,
    title: "Upkeep & Compliance",
    subtitle: "Facility maintenance tracked, not forgotten.",
    description:
      "Log routine maintenance, equipment inspections, and facility upkeep tasks with notes and photos attached. Whether it's a broken gate latch or a pump issue, every item is logged, assigned, and followed up on — giving you a clean paper trail to show regulators.",
    bullets: [
      "Log maintenance tasks and equipment inspections",
      "Attach before/after photos",
      "Assign follow-up actions to staff",
      "Complete audit trail per facility"
    ],
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&h=500&fit=crop&crop=center",
    reverse: true
  }
];

export default function Compliance() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center">
        <span className="inline-block text-xs font-bold tracking-widest text-[#1a9c5b] uppercase mb-5">Compliance</span>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-5 leading-tight">Compliance made easy</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Ease your regulatory requirements. Facilitate compliance logging, and keep everything you need for inspections just a click away.
        </p>
        <Link to={createPageUrl("Dashboard")}>
          <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white px-8 py-5 text-base font-bold rounded-md h-auto">
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Quick feature badges */}
      <section className="border-t border-b border-gray-100 bg-gray-50 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-3">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-5 py-2.5 text-sm font-medium text-gray-700">
                <Icon className="w-4 h-4 text-[#1a9c5b]" />
                {s.title}
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Sections */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-28">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={section.id}>
                <div className={`flex flex-col ${section.reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-20`}>
                  {/* Text */}
                  <div className="w-full lg:w-1/2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#f0faf5] rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#1a9c5b]" />
                      </div>
                      <span className="text-xs font-bold tracking-widest text-[#1a9c5b] uppercase">{section.title}</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">{section.subtitle}</h2>
                    <p className="text-lg text-gray-600 leading-relaxed mb-7">{section.description}</p>
                    <ul className="space-y-3">
                      {section.bullets.map((b, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-[#1a9c5b] flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Image */}
                  <div className="w-full lg:w-1/2">
                    <div className="rounded-2xl overflow-hidden shadow-xl">
                      <img src={section.image} alt={section.title} className="w-full h-80 lg:h-96 object-cover" />
                    </div>
                  </div>
                </div>

                {idx < sections.length - 1 && (
                  <div className="h-px bg-gray-100 mt-28" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gray-50 border-t border-gray-100 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-5">Always inspection-ready</h2>
          <p className="text-lg text-gray-500 mb-10">
            Everything your facility needs to stay compliant, organized, and ahead of any audit.
          </p>
          <Link to={createPageUrl("Dashboard")}>
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white px-8 py-5 text-base font-bold rounded-md h-auto">
              Start for Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}