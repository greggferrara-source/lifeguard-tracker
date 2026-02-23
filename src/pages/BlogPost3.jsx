import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPost3() {
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
          <span className="inline-block text-xs font-bold text-[#1a9c5b] uppercase tracking-wide mb-3">Safety & Compliance</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            OSHA Aquatic Facility Compliance Checklist
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-6">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Feb 23, 2026</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> 8 min read</div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg mb-10">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1000&h=500&fit=crop" 
            alt="Pool safety compliance" 
            className="w-full h-80 object-cover"
          />
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
          <p>
            <strong>If you manage a public or commercial aquatic facility, OSHA (Occupational Safety and Health Administration) compliance isn't optional—it's a legal requirement.</strong> OSHA sets baseline standards for workplace safety, and pools and water parks fall under this umbrella.
          </p>

          <p>
            Beyond OSHA, you'll also need to comply with CDC guidelines, state health codes, and industry standards like MAHC (Model Aquatic Health Code). This checklist covers the major OSHA requirements specific to aquatic facilities.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Part 1: Staffing & Lifeguard Requirements</h2>

          <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#1a9c5b] space-y-3">
            <div>
              <p className="font-semibold text-gray-900">✓ Adequate Lifeguard Coverage</p>
              <p className="text-sm text-gray-600 mt-1">Never operate with under-staffing. CDC/MAHC recommends 1 lifeguard per 40 swimmers (public pools); 1 per 30 for water parks. OSHA enforcement focuses on prevention of drowning incidents—understaffed shifts increase risk.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Current Certifications</p>
              <p className="text-sm text-gray-600 mt-1">All lifeguards must hold active Lifeguard Training, CPR, and First Aid certifications. OSHA inspectors will ask to see proof. Expired certs = non-compliance.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Regular Training & Drills</p>
              <p className="text-sm text-gray-600 mt-1">Conduct monthly in-service training (CPR refresh, rescue techniques, emergency procedures). Document all training. Have monthly emergency drills (near-drowning, cardiac arrest, evacuation).</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Job Descriptions & Duties</p>
              <p className="text-sm text-gray-600 mt-1">Document each lifeguard's role and responsibilities. This shows OSHA you have clear expectations.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Part 2: Water Quality & Testing</h2>

          <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#1a9c5b] space-y-3">
            <div>
              <p className="font-semibold text-gray-900">✓ Chemical Testing (Daily)</p>
              <p className="text-sm text-gray-600 mt-1">Test pH, chlorine, alkalinity, and stabilizer daily—at minimum before opening. Maintain logs. OSHA/CDC standards:</p>
              <ul className="text-sm text-gray-600 list-disc pl-5 mt-2">
                <li>Chlorine: 1.0–3.0 ppm (public pools); 2.0–4.0 ppm (spas)</li>
                <li>pH: 7.2–7.8</li>
                <li>Alkalinity: 80–120 ppm</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Filtration & Circulation</p>
              <p className="text-sm text-gray-600 mt-1">Equipment must run according to manufacturer specs. For public pools, turnover time (complete water circulation) is typically 6–8 hours. Filters must be cleaned/backwashed regularly.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Turbidity Testing</p>
              <p className="text-sm text-gray-600 mt-1">Water clarity must be sufficient to see the drain. Use a turbidity tube or secchi disk. Documentation required.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Backwash & Drain Maintenance</p>
              <p className="text-sm text-gray-600 mt-1">Drains must be accessible for inspection and maintenance. Main drain anti-entrapment compliance (Virginia Graeme Baker Act) is mandatory.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Part 3: Facility Maintenance & Safety Equipment</h2>

          <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#1a9c5b] space-y-3">
            <div>
              <p className="font-semibold text-gray-900">✓ Safety Equipment</p>
              <p className="text-sm text-gray-600 mt-1">All facilities must have:</p>
              <ul className="text-sm text-gray-600 list-disc pl-5 mt-2">
                <li>Lifeguard chairs / observation platforms</li>
                <li>Rescue tubes, ring buoys, throwing lines</li>
                <li>AED (Automated External Defibrillator) on site</li>
                <li>First aid kit</li>
                <li>Emergency communication system (phone, whistle)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Equipment Inspection & Maintenance</p>
              <p className="text-sm text-gray-600 mt-1">Document monthly inspections of rescue equipment, AED, first aid supplies, and facility condition. Repair or replace damaged items immediately.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Slip/Fall Prevention</p>
              <p className="text-sm text-gray-600 mt-1">Wet areas must have slip-resistant surfaces. Repair cracked deck surfaces. Post warning signs in hazardous areas.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Emergency Action Plan (EAP)</p>
              <p className="text-sm text-gray-600 mt-1">Written plan for medical emergencies, evacuations, severe weather, etc. Post it visibly. Train all staff on the plan annually.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Part 4: Incident Documentation & Reporting</h2>

          <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#1a9c5b] space-y-3">
            <div>
              <p className="font-semibold text-gray-900">✓ Incident Logs</p>
              <p className="text-sm text-gray-600 mt-1">Document all incidents: near-misses, minor injuries, rescues, and serious injuries. Include date, time, description, staff involved, and actions taken.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Injury Records (OSHA Form 300)</p>
              <p className="text-sm text-gray-600 mt-1">If your facility has 10+ employees, you must maintain an OSHA 300 log of workplace injuries and illnesses. Some aquatic injuries (lifeguard strain injuries) must be logged.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Serious Incident Reporting</p>
              <p className="text-sm text-gray-600 mt-1">Drowning or near-drowning incidents must be reported to your state health department within 24 hours. Keep investigation records.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Part 5: Training, Awareness & Communication</h2>

          <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#1a9c5b] space-y-3">
            <div>
              <p className="font-semibold text-gray-900">✓ Bloodborne Pathogens Training</p>
              <p className="text-sm text-gray-600 mt-1">Any staff who may handle blood (lifeguards, staff providing first aid) must receive annual bloodborne pathogens training.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Hazard Communication</p>
              <p className="text-sm text-gray-600 mt-1">Chemical storage areas must have Safety Data Sheets (SDS) visible. Staff must be trained on handling pool chemicals safely.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Annual Safety Meeting</p>
              <p className="text-sm text-gray-600 mt-1">Hold a facility-wide safety meeting at the start of each season. Review emergency procedures, equipment, and changes to protocols. Document attendance.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Quick Compliance Checklist</h2>

          <div className="space-y-2 text-sm">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" /> All lifeguards have current certifications (Lifeguard, CPR, First Aid)
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" /> Adequate lifeguard staffing (per MAHC ratios)
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" /> Daily water chemistry testing & logs
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" /> Monthly safety equipment inspections
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" /> AED on-site & staff trained in use
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" /> Written Emergency Action Plan (posted)
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" /> Monthly emergency drills conducted & documented
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" /> Incident logs maintained
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" /> OSHA 300 log (if 10+ employees)
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" /> Chemical safety training completed
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" /> Bloodborne pathogens training up-to-date
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" /> Annual safety meeting held & documented
            </label>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Bottom Line</h2>

          <p>
            <strong>OSHA compliance for aquatic facilities boils down to three priorities: trained staff, safe water, and clear documentation.</strong>
          </p>

          <p>
            Inspectors will ask to see your certifications, chemical logs, incident reports, and training records. If you can't produce them, you're at risk for violations and fines.
          </p>

          <p>
            Use a centralized system to track certifications, chemical testing, maintenance, and incidents. This eliminates paper, prevents mistakes, and makes inspections seamless.
          </p>
        </div>

        <div className="mt-12 p-8 rounded-2xl bg-[#f0faf5] border border-[#1a9c5b]/20">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Stay Inspection-Ready</h3>
          <p className="text-gray-600 mb-5">
            LifeGuard Tracker automates certification tracking, chemical logging, incident documentation, and compliance reporting—making OSHA and health dept audits effortless.
          </p>
          <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white font-bold">
            Try LifeGuard Tracker Free
          </Button>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to={createPageUrl("BlogPost2")} className="p-4 rounded-lg border border-gray-200 hover:border-[#1a9c5b] hover:bg-[#f0faf5] transition-all">
              <span className="text-xs font-bold text-[#1a9c5b] uppercase">Compliance</span>
              <p className="font-semibold text-gray-900 mt-2">Lifeguard Certification Requirements by State</p>
            </Link>
            <Link to={createPageUrl("BlogPost4")} className="p-4 rounded-lg border border-gray-200 hover:border-[#1a9c5b] hover:bg-[#f0faf5] transition-all">
              <span className="text-xs font-bold text-[#1a9c5b] uppercase">Safety</span>
              <p className="font-semibold text-gray-900 mt-2">GPS Tracking for Lifeguards: Safety & Liability</p>
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