import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPost2() {
  return (
    <article className="min-h-screen bg-white">
      <header className="border-b border-gray-200 sticky top-0 z-40 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-xs text-gray-400">Blog</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-8">
          <span className="inline-block text-xs font-bold text-[#1a9c5b] uppercase tracking-wide mb-3">Compliance</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Lifeguard Certification Requirements by State
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-6">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Feb 23, 2026</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> 7 min read</div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg mb-10">
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000&h=500&fit=crop" 
            alt="Lifeguard certification" 
            className="w-full h-80 object-cover"
          />
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
          <p>
            <strong>Lifeguard certification requirements vary significantly by state, region, and facility type.</strong> For aquatic facility managers and directors, staying on top of these regulations is critical—not just for compliance with health departments, but for patron safety and liability protection.
          </p>

          <p>
            This guide breaks down the core certifications required across the United States and provides best practices for tracking, renewing, and managing them.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Core Certifications (Required Nearly Everywhere)</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">1. Lifeguard Training / Water Safety Certification</h3>
          <p>
            The foundation. Most states require guards to hold a current <strong>Lifeguard Certification from an approved provider</strong> such as:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>American Red Cross (most common)</li>
            <li>Ellis & Associates</li>
            <li>United States Lifesaving Association (USLA)</li>
            <li>Starfish Aquatics</li>
          </ul>
          <p><strong>Validity:</strong> Typically 2–3 years. Must be renewed before expiry.</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">2. CPR / AED Certification</h3>
          <p>
            <strong>Required in every state.</strong> Lifeguards must hold current CPR certification for either:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>CPR/AED for the Professional Rescuer (or "Professional Rescuer" variant)</li>
            <li>Basic Life Support (BLS) for Healthcare Providers</li>
          </ul>
          <p><strong>Validity:</strong> 2 years (typically). Renewal is mandatory before expiry.</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">3. First Aid Certification</h3>
          <p>
            <strong>Required in most states.</strong> Usually must accompany CPR certification. Covers:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Wound care & bleeding control</li>
            <li>Shock management</li>
            <li>Fracture & spine injury response</li>
          </ul>
          <p><strong>Validity:</strong> 2–3 years. Often bundled with CPR.</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Specialized Certifications (State/Facility Specific)</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">National Lifeguard Service (NLS)</h3>
          <p>
            <strong>Required in some states; recommended in others.</strong> Focuses on open-water rescue (beach, lake) rather than pool environments. Ask your health department if it's mandated.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">Water Safety Instructor (WSI) / Aquatics Instructor</h3>
          <p>
            <strong>Required if your facility offers swimming lessons.</strong> Only instructors with WSI or equivalent can teach.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">Oxygen Administration</h3>
          <p>
            <strong>Some states/counties require lifeguards to be trained in oxygen administration.</strong> Check local health department rules.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">State-by-State Snapshot</h2>

          <p>
            <strong>Note:</strong> Requirements can change and vary by county. Always verify with your state health department and local AHJ (Authority Having Jurisdiction).
          </p>

          <table className="w-full text-sm border-collapse mt-4 mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">State</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Lifeguard Cert</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">CPR/First Aid</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">California</td>
                <td className="border border-gray-300 px-4 py-2">Red Cross or approved</td>
                <td className="border border-gray-300 px-4 py-2">CPR + First Aid</td>
                <td className="border border-gray-300 px-4 py-2">Health code strict; annual training required</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">Florida</td>
                <td className="border border-gray-300 px-4 py-2">Red Cross or approved</td>
                <td className="border border-gray-300 px-4 py-2">CPR + First Aid</td>
                <td className="border border-gray-300 px-4 py-2">Department of Health oversight</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">Texas</td>
                <td className="border border-gray-300 px-4 py-2">Red Cross or approved</td>
                <td className="border border-gray-300 px-4 py-2">CPR + First Aid</td>
                <td className="border border-gray-300 px-4 py-2">DSHS requirements</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">New York</td>
                <td className="border border-gray-300 px-4 py-2">Red Cross or approved</td>
                <td className="border border-gray-300 px-4 py-2">CPR + First Aid</td>
                <td className="border border-gray-300 px-4 py-2">Department of Health and Mental Hygiene rules</td>
              </tr>
            </tbody>
          </table>

          <p className="text-sm text-gray-500 italic">
            This table is representative. Verify exact requirements with your state's health department and local pool inspector.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Best Practices for Cert Tracking</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">1. Create a Centralized Registry</h3>
          <p>
            Maintain a master list of all staff certifications with expiry dates. Include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Guard name & ID</li>
            <li>Certification type (Lifeguard, CPR, First Aid, etc.)</li>
            <li>Issue date & expiry date</li>
            <li>Certifying organization</li>
            <li>Certificate copy (stored securely)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">2. Set Alerts 30 & 7 Days Before Expiry</h3>
          <p>
            Don't wait until the last minute. Alert staff early so they have time to renew. A guard with an expired cert cannot work.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">3. Make Renewal Easy</h3>
          <p>
            Partner with local training providers. Some facilities cover renewal costs as a benefit. Others reimburse staff or offer on-site training.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">4. Document Everything</h3>
          <p>
            Keep copies of all certifications. When audited or inspected, you need proof that your staff is current.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">5. Audit Quarterly</h3>
          <p>
            Every 3 months, review your registry. Pull expirations for the next 90 days and reach out to guards.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Common Mistakes to Avoid</h2>

          <ul className="list-disc pl-6 space-y-3">
            <li><strong>Not tracking renewal dates:</strong> Expired certs mean a guard can't work—leaving you short-staffed.</li>
            <li><strong>Assuming all states are the same:</strong> They're not. Know YOUR state's rules.</li>
            <li><strong>Not keeping digital copies:</strong> If an inspector asks, you need proof. Paper gets lost.</li>
            <li><strong>Forgetting about multi-location requirements:</strong> If you manage multiple pools, each may have different staffing rules.</li>
            <li><strong>Waiting too long to renew:</strong> Schedule training at 30 days before expiry, not 1 day.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Bottom Line</h2>

          <p>
            <strong>Certification compliance is non-negotiable.</strong> A single expired lifeguard certificate can expose your facility to liability, health department fines, and most importantly, safety risks.
          </p>

          <p>
            Use a centralized tracking system, set automated reminders, document everything, and audit regularly. If you're managing more than a handful of staff, invest in software that automates this—it'll save you hours and prevent costly mistakes.
          </p>
        </div>

        <div className="mt-12 p-8 rounded-2xl bg-[#f0faf5] border border-[#1a9c5b]/20">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Never Miss a Certification Expiry Again</h3>
          <p className="text-gray-600 mb-5">
            LifeGuard Tracker automatically tracks lifeguard certifications, sends 30 & 7-day alerts, and keeps your facility audit-ready.
          </p>
          <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white font-bold">
            Try LifeGuard Tracker Free
          </Button>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to={createPageUrl("BlogPost1")} className="p-4 rounded-lg border border-gray-200 hover:border-[#1a9c5b] hover:bg-[#f0faf5] transition-all">
              <span className="text-xs font-bold text-[#1a9c5b] uppercase">Scheduling</span>
              <p className="font-semibold text-gray-900 mt-2">How to Schedule Lifeguards for Summer</p>
            </Link>
            <Link to={createPageUrl("BlogPost3")} className="p-4 rounded-lg border border-gray-200 hover:border-[#1a9c5b] hover:bg-[#f0faf5] transition-all">
              <span className="text-xs font-bold text-[#1a9c5b] uppercase">Safety</span>
              <p className="font-semibold text-gray-900 mt-2">OSHA Aquatic Facility Compliance Checklist</p>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 mt-16 py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-500">
          <p>© 2026 LifeGuard Tracker. All rights reserved.</p>
        </div>
      </footer>
    </article>
  );
}