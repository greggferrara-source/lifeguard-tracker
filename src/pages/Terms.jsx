import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield } from "lucide-react";

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14 space-y-10">
      <div>
        <Link to={createPageUrl("Dashboard")} className="text-sm text-[#1a9c5b] hover:underline">← Back to Dashboard</Link>
        <h1 className="text-4xl font-bold text-gray-900 mt-4">Terms of Service</h1>
        <p className="text-gray-500 mt-2">Last updated: February 2026</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
          <p>By accessing or using LifeGuard Tracker ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service. These terms apply to all users, including administrators, managers, and employees.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">2. Description of Service</h2>
          <p>LifeGuard Tracker is a workforce management platform designed for aquatic and outdoor recreation facilities. The Service provides tools for employee scheduling, shift management, time-off tracking, onboarding, and related workforce operations.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">3. Account Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. LifeGuard Tracker is not liable for any loss resulting from unauthorized access to your account.</p>
          <p>Administrators are responsible for managing employee access levels and ensuring that user permissions are appropriately assigned within their organization.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">4. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Violate any applicable laws or regulations</li>
            <li>Transmit any harmful, offensive, or disruptive content</li>
            <li>Attempt to gain unauthorized access to any systems or data</li>
            <li>Interfere with or disrupt the integrity or performance of the Service</li>
            <li>Harvest or collect personal information of other users without consent</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">5. Employee Data</h2>
          <p>Organizations using LifeGuard Tracker are responsible for obtaining appropriate consent from their employees before inputting personal data into the platform. This includes but is not limited to contact information, certifications, availability, and scheduling data.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">6. Service Availability</h2>
          <p>We strive to maintain high availability but do not guarantee uninterrupted access to the Service. We may perform scheduled or emergency maintenance that temporarily affects availability. We will make reasonable efforts to notify users in advance of planned downtime.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">7. Limitation of Liability</h2>
          <p>LifeGuard Tracker is provided "as is" without warranties of any kind. To the maximum extent permitted by law, LifeGuard Tracker shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service, including but not limited to staffing errors, missed shifts, or scheduling conflicts.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">8. Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated terms. We will notify users of significant changes via email or in-app notification.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">9. Contact</h2>
          <p>For questions about these Terms of Service, please <Link to={createPageUrl("Contact")} className="text-[#1a9c5b] hover:underline">contact our support team</Link>.</p>
        </section>
      </div>
    </div>
  );
}