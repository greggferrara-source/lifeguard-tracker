import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPost10() {
  return (
    <div className="bg-white min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <span className="text-sm text-gray-500">Blog</span>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <span className="inline-block bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
            Safety
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Incident Reporting Best Practices for Aquatic Facilities
          </h1>
          <div className="flex items-center gap-6 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Feb 13, 2026
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              7 min read
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1576091160683-112943ae9537?w=1200&h=600&fit=crop"
            alt="Incident reporting"
            className="w-full h-auto"
          />
        </div>

        <div className="prose prose-lg max-w-none">
          <p>
            Comprehensive incident reporting is critical for aquatic facility safety and legal protection. Proper documentation enables trend 
            identification, regulatory compliance, staff training improvements, and effective risk management.
          </p>

          <h2>What Counts as an Incident?</h2>
          <p>
            Facilities should report more than just injuries. Incident categories include:
          </p>
          <ul>
            <li>Rescues (failed entry prevention, assist rescues, save)</li>
            <li>Injuries (minor to serious, including near-misses)</li>
            <li>Equipment failures or deficiencies</li>
            <li>Policy violations or safety procedure breaches</li>
            <li>Unsafe conditions or environmental hazards</li>
            <li>Medical emergencies</li>
            <li>Guest or staff conflicts requiring intervention</li>
          </ul>

          <h2>Immediate Response Protocol</h2>
          <p>
            When an incident occurs:
          </p>
          <ol>
            <li><strong>Ensure safety first:</strong> Address the emergency and provide aid as needed</li>
            <li><strong>Secure the scene:</strong> Prevent further incidents if necessary</li>
            <li><strong>Contact emergency services:</strong> If injuries are involved</li>
            <li><strong>Gather information:</strong> Document details while fresh, including witness accounts</li>
            <li><strong>Notify management:</strong> Escalate appropriately based on severity</li>
            <li><strong>Capture photos/video:</strong> When appropriate and not interfering with care</li>
          </ol>

          <h2>Documentation Standards</h2>
          <p>
            Incident reports should include:
          </p>
          <ul>
            <li><strong>Date, time, and location:</strong> Specific area of facility and exact time</li>
            <li><strong>Individuals involved:</strong> Names, ages, roles (staff/guest), contact information</li>
            <li><strong>Detailed description:</strong> Chronological account of events leading to and following incident</li>
            <li><strong>Witnesses:</strong> Names and statements from those who observed the incident</li>
            <li><strong>Contributing factors:</strong> Environmental conditions, equipment status, staffing</li>
            <li><strong>Response actions:</strong> Who responded, what was done, outcomes</li>
            <li><strong>Medical information:</strong> Injuries, treatment provided, transport details</li>
            <li><strong>Follow-up:</strong> Actions taken to prevent recurrence</li>
          </ul>

          <h2>Timeliness & Filing</h2>
          <p>
            Prompt documentation is critical for accuracy and liability protection:
          </p>
          <ul>
            <li>Complete initial report within 24 hours of incident</li>
            <li>Provide supplemental documentation as additional information becomes available</li>
            <li>Store reports securely with appropriate access controls</li>
            <li>Maintain reports for recommended 7-year period minimum</li>
            <li>Create copies for insurance notifications when appropriate</li>
          </ul>

          <h2>Trend Analysis & Prevention</h2>
          <p>
            Systematic incident tracking reveals patterns:
          </p>
          <ul>
            <li>Recurring incident types may indicate training gaps</li>
            <li>Specific times/areas suggest environmental or staffing issues</li>
            <li>Patterns in guest incidents can inform safety messaging and policies</li>
            <li>Equipment failure trends justify maintenance investment</li>
          </ul>

          <h2>Legal Considerations</h2>
          <p>
            Incident documentation provides crucial legal protection:
          </p>
          <ul>
            <li><strong>Demonstrates due diligence:</strong> Shows facility took safety seriously</li>
            <li><strong>Supports claims decisions:</strong> Detailed information helps insurance investigations</li>
            <li><strong>Protects against liability:</strong> Proves appropriate response procedures were followed</li>
            <li><strong>Supports regulatory compliance:</strong> Documents adherence to safety standards</li>
          </ul>

          <h2>Common Reporting Mistakes</h2>
          <p>
            Avoid these pitfalls:
          </p>
          <ul>
            <li>Incomplete details or vague descriptions</li>
            <li>Delayed reporting leading to inaccurate information</li>
            <li>Statements that assign blame rather than describe facts</li>
            <li>Missing or incomplete witness information</li>
            <li>Failure to follow up on preventive actions</li>
          </ul>

          <p>
            Effective incident reporting transforms individual events into facility-wide learning opportunities. By implementing comprehensive 
            documentation practices, analyzing trends, and taking corrective action, aquatic facilities demonstrate their commitment to safety 
            and protect themselves legally.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <p className="text-sm text-orange-900">
              <strong>Streamline incident reporting and analysis.</strong> LifeGuard Tracker's incident management system enables comprehensive 
              documentation, trend analysis, and follow-up tracking.
            </p>
            <Link to={createPageUrl("Home")}>
              <Button className="mt-4 bg-[#1a9c5b] hover:bg-[#158a4e]">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </article>

      <footer className="border-t border-gray-100 px-4 sm:px-6 py-10 bg-white mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-sm text-gray-500">© 2026 LifeGuard Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}