import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPost1() {
  return (
    <article className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 z-40 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-xs text-gray-400">Blog</span>
        </div>
      </header>

      {/* Article */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Meta */}
        <div className="mb-8">
          <span className="inline-block text-xs font-bold text-[#1a9c5b] uppercase tracking-wide mb-3">Scheduling</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            How to Schedule Lifeguards for a Busy Summer Season
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-6">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Feb 23, 2026</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> 6 min read</div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="rounded-2xl overflow-hidden shadow-lg mb-10">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1000&h=500&fit=crop" 
            alt="Lifeguard scheduling" 
            className="w-full h-80 object-cover"
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
          <p>
            Summer is peak season for aquatic facilities, but with the increased patron volume comes one of the toughest operational challenges: <strong>scheduling enough lifeguards to maintain full coverage while staying within budget</strong>.
          </p>

          <p>
            Whether you manage a municipal pool, YMCA, water park, or recreation center, the stakes are high. Under-staffing creates safety risks and liability. Over-staffing drains your budget. Getting it right requires strategy, tools, and a system that prevents the last-minute scrambles that plague so many facilities.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">The Lifeguard Scheduling Problem</h2>
          <p>
            Most pool managers still use spreadsheets, email chains, or pen-and-paper rosters to manage schedules. The results?
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Gaps in coverage when guards call out sick</li>
            <li>Duplicate shifts or forgotten assignments</li>
            <li>Poor visibility into guard availability</li>
            <li>Hours spent chasing staff for schedule confirmations</li>
            <li>No data on scheduling patterns or cost-per-hour trends</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Step 1: Map Your Coverage Needs</h2>
          <p>
            Before scheduling a single shift, define your facility's baseline coverage requirements:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Minimum guards per zone:</strong> How many guards do you need watching each area? (Many facilities use MAHC guidelines: 1 guard per 40 swimmers.)</li>
            <li><strong>Peak vs. off-peak hours:</strong> Are mornings busier than afternoons? Are weekends packed?</li>
            <li><strong>Rotation breaks:</strong> Don't let guards scan the same zone for 8 hours straight. Rotate every 30–45 minutes to prevent fatigue.</li>
            <li><strong>Skill-based assignments:</strong> Which guards are certified for deep water? Who can manage the lazy river?</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Step 2: Gather Guard Availability & Constraints</h2>
          <p>
            Next, collect real data on your team's availability:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Weekly preferences:</strong> Ask each guard which days/times they prefer.</li>
            <li><strong>Hard constraints:</strong> School schedules, certification expiry dates, max hours per week (labor laws + union rules).</li>
            <li><strong>Skills & certifications:</strong> CPR, First Aid, NLS, water safety instructor, etc.</li>
            <li><strong>Seasonal capacity:</strong> Many guards are summer-only. Plan accordingly.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Step 3: Build Your Master Schedule</h2>
          <p>
            With data in hand, build a rolling 4–6 week schedule:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Start with full-time or senior guards.</strong> Lock in your core team first.</li>
            <li><strong>Fill gaps with part-timers.</strong> Match shift times to their availability.</li>
            <li><strong>Respect the constraints.</strong> Don't schedule someone over their max hours or right after a long shift.</li>
            <li><strong>Build in redundancy.</strong> Always have a backup plan if someone calls out.</li>
            <li><strong>Rotate responsibilities.</strong> Don't assign the same person to the hardest shifts every week.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Step 4: Communicate Early & Often</h2>
          <p>
            Once the schedule is live:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Post it at least 2 weeks in advance (labor best practice).</li>
            <li>Send a summary email to all staff.</li>
            <li>Use a digital system that alerts guards to schedule changes in real-time.</li>
            <li>Make shift-swapping easy — many call-outs happen because guards can't trade shifts smoothly.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Step 5: Monitor & Adjust</h2>
          <p>
            Track your actual performance throughout summer:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Which shifts are hardest to fill?</li>
            <li>Who's taking the most time off?</li>
            <li>Are you regularly over or understaffed?</li>
            <li>What's your cost per staffed hour?</li>
          </ul>
          <p>
            Use this data to refine next year's plan and catch problems before they become crises mid-summer.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Tools That Help</h2>
          <p>
            Manual scheduling works—barely—for tiny facilities. But as you grow, a <strong>dedicated lifeguard scheduling platform</strong> pays for itself in hours saved and mistakes prevented:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Real-time visibility into guard availability</li>
            <li>Automated conflict detection (prevents double-booking)</li>
            <li>One-click shift swaps & approvals</li>
            <li>Payroll export (no manual re-entry)</li>
            <li>Mobile app so guards can check schedules anywhere</li>
            <li>Forecasting tools to predict understaffing before it happens</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">The Bottom Line</h2>
          <p>
            Summer scheduling doesn't have to be chaotic. Start by mapping your coverage needs, gathering real availability data, building a solid master schedule, communicating clearly, and monitoring performance. If you're managing more than 10 guards, invest in a scheduling tool—it'll save you 5–10 hours per week and eliminate the stress of manual coordination.
          </p>

          <p>
            The best-run facilities schedule 4–6 weeks out, have clear rotation policies, and make swapping frictionless. Your guards will appreciate the predictability, your patrons will notice the consistent coverage, and your budget will thank you.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 rounded-2xl bg-[#f0faf5] border border-[#1a9c5b]/20">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Simplify Lifeguard Scheduling</h3>
          <p className="text-gray-600 mb-5">
            LifeGuard Tracker automates shift assignments, conflict detection, and staff communication—so you spend less time managing schedules and more time running a safe facility.
          </p>
          <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white font-bold">
            Try LifeGuard Tracker Free
          </Button>
        </div>

        {/* Related Posts */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to={createPageUrl("BlogPost2")} className="p-4 rounded-lg border border-gray-200 hover:border-[#1a9c5b] hover:bg-[#f0faf5] transition-all">
              <span className="text-xs font-bold text-[#1a9c5b] uppercase">Compliance</span>
              <p className="font-semibold text-gray-900 mt-2">Lifeguard Certification Requirements by State</p>
            </Link>
            <Link to={createPageUrl("BlogPost3")} className="p-4 rounded-lg border border-gray-200 hover:border-[#1a9c5b] hover:bg-[#f0faf5] transition-all">
              <span className="text-xs font-bold text-[#1a9c5b] uppercase">Safety</span>
              <p className="font-semibold text-gray-900 mt-2">OSHA Aquatic Facility Compliance Checklist</p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16 py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-500">
          <p>© 2026 LifeGuard Tracker. All rights reserved.</p>
        </div>
      </footer>
    </article>
  );
}