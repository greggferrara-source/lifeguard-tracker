import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPost8() {
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
          <span className="inline-block bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
            Compliance
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Aquatic Facility Compliance: MAHC vs OSHA Requirements
          </h1>
          <div className="flex items-center gap-6 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Feb 7, 2026
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              9 min read
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1200&h=600&fit=crop"
            alt="Aquatic facility compliance"
            className="w-full h-auto"
          />
        </div>

        <div className="prose prose-lg max-w-none">
          <p>
            Aquatic facility managers must navigate two distinct regulatory frameworks: MAHC (Model Aquatic Health Code) and OSHA requirements. 
            While both aim to protect public health and worker safety, they address different aspects of facility operations with varying requirements 
            and enforcement mechanisms.
          </p>

          <h2>Understanding MAHC vs OSHA</h2>
          <p>
            <strong>MAHC</strong> (Model Aquatic Health Code) is developed by the CDC and focuses on guest water quality, safety, and facility 
            operations. It's a recommended standard that most states adopt into their local health codes.
          </p>
          <p>
            <strong>OSHA</strong> (Occupational Safety and Health Administration) is a federal agency that enforces workplace safety standards, 
            including requirements specific to lifeguards and aquatic workers.
          </p>

          <h2>Water Quality Standards</h2>
          <p>
            MAHC sets specific water quality parameters:
          </p>
          <ul>
            <li><strong>Chlorine residual:</strong> 1.0-3.0 mg/L (free chlorine)</li>
            <li><strong>pH:</strong> 7.2-7.8 for pools, 6.5-8.2 for hot tubs</li>
            <li><strong>Testing frequency:</strong> Minimum twice daily for pools, hourly for water slides</li>
            <li><strong>Alkalinity:</strong> 80-120 mg/L for pools</li>
            <li><strong>Stabilizer (cyanuric acid):</strong> 30-100 mg/L</li>
          </ul>

          <h2>Lifeguard Staffing Requirements</h2>
          <p>
            Both MAHC and OSHA address lifeguard-to-patron ratios, though slightly differently:
          </p>
          <ul>
            <li>MAHC recommends 1 guard per 50-75 patrons depending on water depth and visibility</li>
            <li>OSHA enforces mandatory one-on-one supervision for very young children</li>
            <li>Both standards require additional supervision for special populations</li>
            <li>Minimum staffing applies even at reduced hours</li>
          </ul>

          <h2>Facility Infrastructure & Safety Equipment</h2>
          <p>
            MAHC specifies facility requirements including:
          </p>
          <ul>
            <li>Rescue equipment (ring buoys, rescue tubes, reaching poles)</li>
            <li>Communication systems for all lifeguard stations</li>
            <li>First aid and AED accessibility</li>
            <li>Proper pool deck dimensions and slope</li>
            <li>Adequate lighting (minimum 50 foot-candles at water surface)</li>
          </ul>

          <h2>Documentation & Record-Keeping</h2>
          <p>
            Both frameworks require detailed documentation:
          </p>
          <ul>
            <li><strong>Water quality testing logs:</strong> Daily records of chemical levels and adjustments</li>
            <li><strong>Equipment maintenance records:</strong> Pool equipment, rescue equipment, and safety devices</li>
            <li><strong>Incident reports:</strong> All incidents, near-misses, and injuries</li>
            <li><strong>Staff training records:</strong> Certifications, recertifications, and continuing education</li>
            <li><strong>Facility inspections:</strong> Regular walkthroughs and maintenance notes</li>
          </ul>

          <h2>Inspection & Enforcement</h2>
          <p>
            MAHC violations are enforced by state and local health departments, while OSHA violations can result in federal penalties. Facilities 
            should be prepared for unannounced inspections and maintain comprehensive documentation to demonstrate compliance.
          </p>

          <h2>Common Compliance Gaps</h2>
          <p>
            Facilities often struggle with:
          </p>
          <ul>
            <li>Inconsistent water testing and documentation</li>
            <li>Inadequate lifeguard coverage during transitions</li>
            <li>Insufficient staff training documentation</li>
            <li>Poor incident reporting and follow-up procedures</li>
            <li>Outdated emergency response plans</li>
          </ul>

          <p>
            Successfully maintaining compliance requires understanding both MAHC and OSHA requirements, implementing robust documentation systems, 
            and maintaining a culture of safety throughout your facility. Regular staff training, comprehensive record-keeping, and proactive 
            inspections are essential.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <p className="text-sm text-red-900">
              <strong>Stay compliant with confidence.</strong> LifeGuard Tracker's compliance dashboard automates documentation, tracks certification 
              expiries, and ensures you meet all MAHC and OSHA requirements.
            </p>
            <Link to={createPageUrl("Home")}>
              <Button className="mt-4 bg-[#1a9c5b] hover:bg-[#158a4e]">
                Explore Compliance Tools
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