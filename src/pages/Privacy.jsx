import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14 space-y-10">
      <div>
        <Link to={createPageUrl("Dashboard")} className="text-sm text-[#1a9c5b] hover:underline">← Back to Dashboard</Link>
        <h1 className="text-4xl font-bold text-gray-900 mt-4">Privacy Policy</h1>
        <p className="text-gray-500 mt-2">Last updated: February 2026</p>
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed">

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
          <p>ShiftGuard collects the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account data:</strong> Name, email address, and role when you register.</li>
            <li><strong>Employee data:</strong> Information entered by administrators including contact details, certifications, availability, and scheduling history.</li>
            <li><strong>Usage data:</strong> How you interact with the platform, including pages visited and features used.</li>
            <li><strong>Communication data:</strong> Messages sent through in-app notifications or email.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">2. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and improve the ShiftGuard service</li>
            <li>Send scheduling notifications, shift reminders, and alerts</li>
            <li>Support administrators in managing their workforce</li>
            <li>Analyze usage patterns to improve the platform</li>
            <li>Respond to support requests</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">3. Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Service providers:</strong> Third-party tools that help us operate the platform (e.g., SMS providers for notifications).</li>
            <li><strong>Legal requirements:</strong> When required by law or to protect the rights and safety of users.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">4. Data Retention</h2>
          <p>We retain your data for as long as your account is active. If you close your account, we will delete or anonymize your personal data within 90 days, unless retention is required for legal purposes.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">5. Security</h2>
          <p>We implement industry-standard security measures including encryption in transit and at rest. Access to personal data is restricted to authorized personnel. However, no method of electronic transmission is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">6. Employee Rights</h2>
          <p>Employees whose data is stored in ShiftGuard have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access the personal information held about them</li>
            <li>Request corrections to inaccurate data</li>
            <li>Request deletion of their data (subject to legal obligations)</li>
          </ul>
          <p>To exercise these rights, contact your organization's ShiftGuard administrator or reach out to us directly.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">7. Cookies</h2>
          <p>ShiftGuard uses essential cookies to maintain your session and preferences. We do not use advertising or tracking cookies.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">8. Contact</h2>
          <p>For privacy-related questions or requests, please <Link to={createPageUrl("Contact")} className="text-[#1a9c5b] hover:underline">contact our team</Link>.</p>
        </section>
      </div>
    </div>
  );
}