import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-[#1a9c5b]" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-500">Effective Date: February 23, 2026</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p>
              LifeGuard Tracker ("we," "us," "our," or "Company") operates the LifeGuard Tracker application. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
            <p>We collect information you provide directly, such as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (name, email, password)</li>
              <li>Profile data (job title, location, certifications)</li>
              <li>Facility information (location, address, coordinates)</li>
              <li>Work schedules and time tracking data</li>
              <li>Communication data (messages, announcements)</li>
              <li>GPS location data (when enabled for geofencing)</li>
              <li>Payment information (processed through Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
            <p>We use collected information for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Operating and improving our service</li>
              <li>Personalizing your experience</li>
              <li>Communicating with you about updates and offers</li>
              <li>Compliance with legal obligations</li>
              <li>Preventing fraud and ensuring security</li>
              <li>Analytics and performance optimization</li>
              <li>Scheduling and workforce management</li>
              <li>Compliance verification and auditing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
            <p>
              We implement comprehensive security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>AES-256 encryption for data in transit and at rest</li>
              <li>Secure authentication with password hashing</li>
              <li>Regular security audits and penetration testing</li>
              <li>Role-based access control</li>
              <li>Two-factor authentication support</li>
              <li>Compliance with OSHA and MAHC standards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Retention</h2>
            <p>
              We retain personal data for as long as necessary to provide our services. You may request deletion of your data at any time, subject to legal obligations to maintain records.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Third-Party Sharing</h2>
            <p>
              We do not sell your data. We may share information with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service providers (Stripe for payments, Twilio for SMS)</li>
              <li>Legal authorities (when required by law)</li>
              <li>Facility administrators (for legitimate business purposes)</li>
              <li>Analytics providers (anonymized data only)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. User Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Compliance</h2>
            <p>
              LifeGuard Tracker complies with GDPR, CCPA, and other applicable privacy regulations. Lifeguard certifications are tracked according to OSHA and MAHC standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
            <p>
              For privacy concerns, contact us at <a href="mailto:privacy@lifeguardtracker.app" className="text-[#1a9c5b] hover:underline">privacy@lifeguardtracker.app</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}