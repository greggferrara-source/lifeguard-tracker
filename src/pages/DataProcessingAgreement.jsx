import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

export default function DataProcessingAgreement() {
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
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-[#1a9c5b]" />
            <h1 className="text-4xl font-bold text-gray-900">Data Processing Agreement</h1>
          </div>
          <p className="text-gray-500">Effective Date: February 23, 2026</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Overview</h2>
            <p>
              This Data Processing Agreement ("DPA") is entered into between LifeGuard Tracker ("Processor") and your facility/organization ("Controller"). It governs the processing of personal data under GDPR, CCPA, and applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Scope of Processing</h2>
            <p>
              The Processor shall process personal data as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Categories of Data:</strong> Employee information, scheduling, certifications, performance data, location data</li>
              <li><strong>Purpose:</strong> Workforce management, compliance tracking, scheduling optimization</li>
              <li><strong>Duration:</strong> For the term of the service agreement</li>
              <li><strong>Nature of Processing:</strong> Collection, storage, analysis, deletion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Data Subject Rights</h2>
            <p>
              The Processor will assist the Controller in fulfilling data subject rights including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Right of access</li>
              <li>Right to rectification</li>
              <li>Right to erasure</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
            <p>
              The Processor implements and maintains:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption (AES-256 for at-rest data)</li>
              <li>TLS 1.3 for data in transit</li>
              <li>Access controls and authentication</li>
              <li>Regular security audits</li>
              <li>Incident response procedures</li>
              <li>Backup and disaster recovery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Sub-processors</h2>
            <p>
              The Processor uses the following sub-processors:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Stripe (payment processing)</li>
              <li>Twilio (SMS communications)</li>
              <li>Base44 Platform (infrastructure)</li>
              <li>Google Cloud (analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Compliance</h2>
            <p>
              The Processor complies with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>GDPR (General Data Protection Regulation)</li>
              <li>CCPA (California Consumer Privacy Act)</li>
              <li>OSHA standards for lifeguard operations</li>
              <li>MAHC (Model Aquatic Health Code)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Data Breach Notification</h2>
            <p>
              The Processor will notify the Controller of any personal data breach within 72 hours of discovery, or as required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Audit Rights</h2>
            <p>
              The Controller has the right to audit the Processor's compliance with this DPA upon reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Data Deletion</h2>
            <p>
              Upon termination of service, the Processor will delete all personal data within 30 days, unless retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Contact</h2>
            <p>
              For DPA inquiries, contact: <a href="mailto:dpa@lifeguardtracker.app" className="text-[#1a9c5b] hover:underline">dpa@lifeguardtracker.app</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}