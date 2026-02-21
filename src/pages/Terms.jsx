import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14 space-y-10">
      <div>
        <Link to={createPageUrl("Dashboard")} className="text-sm text-[#1a9c5b] hover:underline">← Back to Dashboard</Link>
        <h1 className="text-4xl font-bold text-gray-900 mt-4">Terms of Service</h1>
        <p className="text-gray-500 mt-2">Last updated: February 2026</p>
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">1. Agreement to Terms</h2>
          <p>By accessing and using LifeGuard Tracker, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">2. Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials (information or software) on LifeGuard Tracker for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software contained on the service</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">3. Disclaimer</h2>
          <p>The materials on LifeGuard Tracker are provided on an 'as is' basis. LifeGuard Tracker makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">4. Limitations</h2>
          <p>In no event shall LifeGuard Tracker or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption,) arising out of the use or inability to use the materials on LifeGuard Tracker, even if LifeGuard Tracker or a LifeGuard Tracker authorized representative has been notified orally or in writing of the possibility of such damage.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">5. Accuracy of Materials</h2>
          <p>The materials appearing on LifeGuard Tracker could include technical, typographical, or photographic errors. LifeGuard Tracker does not warrant that any of the materials on our website are accurate, complete, or current. LifeGuard Tracker may make changes to the materials contained on our website at any time without notice.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">6. Links</h2>
          <p>LifeGuard Tracker has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by LifeGuard Tracker of the site. Use of any such linked website is at the user's own risk.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">7. Modifications</h2>
          <p>LifeGuard Tracker may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">8. Governing Law</h2>
          <p>These terms and conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">9. Contact Information</h2>
          <p>If you have any questions about these Terms of Service, please <Link to={createPageUrl("Contact")} className="text-[#1a9c5b] hover:underline">contact our team</Link>.</p>
        </section>
      </div>
    </div>
  );
}