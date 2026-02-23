import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500">Effective Date: February 23, 2026 | Last Updated: February 23, 2026</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using LifeGuard Tracker, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. License and Access</h2>
            <p>
              LifeGuard Tracker grants you a limited, non-exclusive, non-transferable license to use the service in accordance with these Terms of Service and your subscription plan. You may not reproduce, distribute, transmit, create derivative works of, or otherwise exploit the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. User Content</h2>
            <p>
              You retain all rights to any content you submit. By submitting content, you grant LifeGuard Tracker a worldwide, royalty-free license to use, reproduce, modify, and distribute the content for service improvement purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit harmful or malicious code</li>
              <li>Attempt to gain unauthorized access</li>
              <li>Harass, threaten, or defame others</li>
              <li>Spam or send unsolicited communications</li>
              <li>Reverse engineer or attempt to extract source code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Compliance with Laws</h2>
            <p>
              You agree that the service will be used in compliance with all applicable federal, state, and local laws, including OSHA regulations, MAHC standards, and data protection laws (GDPR, CCPA).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Payment Terms</h2>
            <p>
              Payment terms vary by subscription plan. Billing occurs automatically on the date specified in your subscription. You may cancel at any time. Refunds are not provided for partial months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
            <p>
              LifeGuard Tracker shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. Our total liability is limited to the amount you paid in the last 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Disclaimers</h2>
            <p>
              The service is provided on an "as-is" basis without warranties of any kind. We do not warrant that the service will be uninterrupted or error-free. While we strive for accuracy, we do not guarantee the accuracy of all information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless LifeGuard Tracker from any claims, damages, or expenses arising from your use of the service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Termination</h2>
            <p>
              LifeGuard Tracker reserves the right to suspend or terminate your account for violation of these Terms, non-payment, or other reasons at our discretion. Upon termination, your right to use the service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Material changes will be communicated via email or prominent notice on the service. Continued use indicates acceptance of updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Contact</h2>
            <p>
              For questions about these Terms, contact: <a href="mailto:legal@lifeguardtracker.app" className="text-[#1a9c5b] hover:underline">legal@lifeguardtracker.app</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}