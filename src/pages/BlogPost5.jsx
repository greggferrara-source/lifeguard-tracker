import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPost5() {
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
          <span className="inline-block text-xs font-bold text-[#1a9c5b] uppercase tracking-wide mb-3">Water Chemistry</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Chemical Log Management for Pools: MAHC Standards & Best Practices
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-6">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Feb 23, 2026</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> 7 min read</div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg mb-10">
          <img 
            src="https://images.unsplash.com/photo-1531746790731-6c26595ae2ad?w=1000&h=500&fit=crop" 
            alt="Pool chemical testing" 
            className="w-full h-80 object-cover"
          />
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
          <p>
            <strong>Water chemistry is the foundation of a safe, compliant aquatic facility.</strong> Poor water quality leads to patron health issues (chlorine-resistant pathogens), algae blooms, and most importantly, fails health department inspections.
          </p>

          <p>
            But maintaining accurate chemical logs isn't just good practice—it's legally required. The MAHC (Model Aquatic Health Code), which most states follow, mandates specific testing frequencies and documentation standards.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">The MAHC Standard for Chemical Testing</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">Minimum Testing Frequency</h3>
          <p>
            According to MAHC and most state health codes, pool water must be tested:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li><strong>At opening (before opening to public)</strong></li>
            <li><strong>At least once during operating hours</strong> (typically mid-day)</li>
            <li><strong>At closing</strong> (end of operating day)</li>
          </ul>

          <p className="text-sm text-gray-600 italic">
            Busy facilities may test 4–6 times daily. Water parks and competition pools may have even stricter requirements.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">Parameters You Must Test (The "Big Four")</h3>

          <div className="space-y-4">
            <div className="border-l-4 border-[#1a9c5b] pl-4">
              <p className="font-semibold text-gray-900">1. Free Chlorine (or other disinfectant)</p>
              <p className="text-sm text-gray-600">Target: 1.0–3.0 ppm (public pools), 2.0–4.0 ppm (spas)</p>
              <p className="text-sm text-gray-600 mt-2">Why: Kills bacteria, viruses, and waterborne pathogens. Too low = bacteria growth. Too high = irritation.</p>
            </div>

            <div className="border-l-4 border-[#1a9c5b] pl-4">
              <p className="font-semibold text-gray-900">2. pH (Acidity/Alkalinity)</p>
              <p className="text-sm text-gray-600">Target: 7.2–7.8</p>
              <p className="text-sm text-gray-600 mt-2">Why: pH affects chlorine effectiveness. Too acidic = corrosion. Too alkaline = cloudy water & reduced disinfection.</p>
            </div>

            <div className="border-l-4 border-[#1a9c5b] pl-4">
              <p className="font-semibold text-gray-900">3. Total Alkalinity</p>
              <p className="text-sm text-gray-600">Target: 80–120 ppm</p>
              <p className="text-sm text-gray-600 mt-2">Why: Alkalinity stabilizes pH. It's a "buffer" that prevents rapid pH swings.</p>
            </div>

            <div className="border-l-4 border-[#1a9c5b] pl-4">
              <p className="font-semibold text-gray-900">4. Stabilizer (Cyanuric Acid)</p>
              <p className="text-sm text-gray-600">Target: 30–50 ppm (outdoor pools)</p>
              <p className="text-sm text-gray-600 mt-2">Why: Protects chlorine from UV degradation in sunlight. Indoor pools may not need it.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Additional Tests (Recommended)</h2>

          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Calcium Hardness:</strong> 200–400 ppm (prevents scaling & corrosion)</li>
            <li><strong>Turbidity:</strong> Should be clear enough to see the drain (prevents hiding of pathogens)</li>
            <li><strong>Copper & Iron:</strong> Should be < 0.2 ppm (aesthetic & health concern)</li>
            <li><strong>Bacterial testing (weekly or monthly):</strong> ATP, total plate count, or plate count testing to verify disinfection is working</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Documentation Requirements</h2>

          <p>
            MAHC and health codes require you to maintain records that include:
          </p>

          <div className="bg-gray-50 p-6 rounded-lg space-y-3">
            <div>
              <p className="font-semibold text-gray-900">✓ Date & Time of Test</p>
              <p className="text-sm text-gray-600">Exact time must be recorded. This shows you tested at the required frequency.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Actual Test Results</p>
              <p className="text-sm text-gray-600">Write down the exact ppm or pH reading from your test kit. Not "looks good"—actual numbers.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Who Performed the Test</p>
              <p className="text-sm text-gray-600">Name or initials of the staff member who conducted the test. Accountability is key.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Corrective Actions (If Out of Range)</p>
              <p className="text-sm text-gray-600">If chlorine is low, note what you did to correct it (e.g., "Added 2 lbs liquid chlorine at 10:15 AM"). Re-test to confirm the fix.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Equipment Used</p>
              <p className="text-sm text-gray-600">Which test kit? Digital or strips? This helps explain variations if questioned.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">How to Create a Chemical Log System</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">Option 1: Printed Forms (Traditional)</h3>
          <p>
            Create a simple paper log with columns for:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Date & Time</li>
            <li>Free Chlorine (ppm)</li>
            <li>pH</li>
            <li>Total Alkalinity (ppm)</li>
            <li>Stabilizer (ppm)</li>
            <li>Tested By (name/initials)</li>
            <li>Corrective Actions (if needed)</li>
          </ul>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Pros:</strong> Simple, no technology required.
          </p>
          <p className="text-sm text-gray-600">
            <strong>Cons:</strong> Easy to lose, hard to analyze trends, no backup if destroyed.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">Option 2: Digital Spreadsheet (Excel/Google Sheets)</h3>
          <p>
            Create a shared spreadsheet where staff log results. You can add formulas to highlight out-of-range values automatically.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Pros:</strong> Searchable, automatic alerts for out-of-range, easy to share.
          </p>
          <p className="text-sm text-gray-600">
            <strong>Cons:</strong> Requires access device (tablet/phone); data entry errors possible.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">Option 3: Dedicated Pool Management Software (Best)</h3>
          <p>
            Use a platform designed for aquatic facility management. Staff log tests via mobile app or web interface. System:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Automatically timestamps entries</li>
            <li>Sends alerts if values are out of range</li>
            <li>Generates reports for health inspections</li>
            <li>Maintains cloud backup (no lost records)</li>
            <li>Shows trends & patterns</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">What to Do When Results Are Out of Range</h2>

          <table className="w-full text-sm border-collapse mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Parameter</th>
                <th className="border border-gray-300 px-4 py-2 text-left">If Low</th>
                <th className="border border-gray-300 px-4 py-2 text-left">If High</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">Free Chlorine</td>
                <td className="border border-gray-300 px-4 py-2">Add chlorine (liquid or powder)</td>
                <td className="border border-gray-300 px-4 py-2">Reduce dose or turn off feeder; run circulation</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">pH</td>
                <td className="border border-gray-300 px-4 py-2">Add pH increaser (sodium bicarbonate)</td>
                <td className="border border-gray-300 px-4 py-2">Add pH decreaser (muriatic acid or CO2)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">Alkalinity</td>
                <td className="border border-gray-300 px-4 py-2">Add alkalinity increaser</td>
                <td className="border border-gray-300 px-4 py-2">Add pH decreaser or partial water exchange</td>
              </tr>
            </tbody>
          </table>

          <p className="font-semibold text-gray-900 mt-6">Critical Rule: Always document corrective actions & re-test</p>
          <p className="text-sm text-gray-600">
            Write down what you added, how much, and at what time. Re-test after 30 minutes to confirm it worked. Health inspectors want to see this.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Common Mistakes That Get Facilities Cited</h2>

          <ul className="list-disc pl-6 space-y-3">
            <li><strong>Skipped tests:</strong> "We ran out of test strips" or "Someone forgot to test." If you can't produce logs, you lose your compliance defense.</li>
            <li><strong>Falsified logs:</strong> Never backfill logs with guesses. Inspectors can tell. This is fraud and opens you to prosecution.</li>
            <li><strong>Out-of-range values with no correction:</strong> If chlorine is 0.5 ppm (dangerously low) and your log shows no action taken, that's a violation. Always correct & document.</li>
            <li><strong>No records:</strong> Paper logs get wet or lost. Keep digital backups.</li>
            <li><strong>Wrong test kit:</strong> Using expired test strips or a kit that hasn't been calibrated gives unreliable results.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Bottom Line</h2>

          <p>
            <strong>Chemical logs aren't just compliance paperwork—they're your evidence that your facility is safe.</strong> A well-maintained log shows regulators and the public that you take water quality seriously.
          </p>

          <p>
            Test at the frequency required by MAHC (opening, mid-day, closing minimum). Document everything—date, time, who tested, results, and corrective actions. Keep records for at least 1–3 years (varies by state).
          </p>

          <p>
            Use digital logging when possible—it eliminates lost records, automates alerts, and makes inspections effortless.
          </p>
        </div>

        <div className="mt-12 p-8 rounded-2xl bg-[#f0faf5] border border-[#1a9c5b]/20">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Simplify Chemical Logging</h3>
          <p className="text-gray-600 mb-5">
            LifeGuard Tracker automates chemical testing logs, alerts you to out-of-range values, and generates inspection-ready reports in seconds.
          </p>
          <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white font-bold">
            Try LifeGuard Tracker Free
          </Button>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to={createPageUrl("BlogPost3")} className="p-4 rounded-lg border border-gray-200 hover:border-[#1a9c5b] hover:bg-[#f0faf5] transition-all">
              <span className="text-xs font-bold text-[#1a9c5b] uppercase">Compliance</span>
              <p className="font-semibold text-gray-900 mt-2">OSHA Aquatic Facility Compliance Checklist</p>
            </Link>
            <Link to={createPageUrl("BlogPost1")} className="p-4 rounded-lg border border-gray-200 hover:border-[#1a9c5b] hover:bg-[#f0faf5] transition-all">
              <span className="text-xs font-bold text-[#1a9c5b] uppercase">Scheduling</span>
              <p className="font-semibold text-gray-900 mt-2">How to Schedule Lifeguards for Summer</p>
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