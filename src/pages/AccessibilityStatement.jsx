import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Eye, ArrowLeft } from 'lucide-react';

export default function AccessibilityStatement() {
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
            <Eye className="w-8 h-8 text-[#1a9c5b]" />
            <h1 className="text-4xl font-bold text-gray-900">Accessibility Statement</h1>
          </div>
          <p className="text-gray-500">Last Updated: February 23, 2026</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Commitment to Accessibility</h2>
            <p>
              LifeGuard Tracker is committed to ensuring that our platform is accessible to all users, including those with disabilities. We strive to meet or exceed the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Accessibility Features</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keyboard navigation throughout the application</li>
              <li>Screen reader compatibility (tested with NVDA and JAWS)</li>
              <li>High contrast mode support</li>
              <li>Text resizing without loss of functionality</li>
              <li>Alt text for all images and icons</li>
              <li>Semantic HTML structure</li>
              <li>ARIA labels and landmarks</li>
              <li>Color-not-dependent indicators</li>
              <li>Form validation with clear error messages</li>
              <li>Accessible data tables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Known Limitations</h2>
            <p>
              While we work continuously to improve accessibility, some areas may have limitations:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Some complex data visualizations may require alternative text descriptions</li>
              <li>Real-time collaborative features may have varying levels of accessibility support</li>
              <li>Third-party integrations may not fully meet accessibility standards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Browser & Assistive Technology Support</h2>
            <p>
              LifeGuard Tracker is tested and supported on:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chrome, Firefox, Safari, and Edge (latest versions)</li>
              <li>NVDA (Windows)</li>
              <li>JAWS (Windows)</li>
              <li>VoiceOver (macOS/iOS)</li>
              <li>TalkBack (Android)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Feedback & Accessibility Issues</h2>
            <p>
              If you encounter accessibility barriers or have suggestions for improvement, please contact us:
            </p>
            <p className="mt-3">
              <strong>Email:</strong> <a href="mailto:accessibility@lifeguardtracker.app" className="text-[#1a9c5b] hover:underline">accessibility@lifeguardtracker.app</a>
            </p>
            <p>
              <strong>Response Time:</strong> We aim to respond within 5 business days
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Ongoing Accessibility Improvements</h2>
            <p>
              Accessibility is an ongoing commitment. We regularly:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Conduct accessibility audits and user testing</li>
              <li>Update our platform with accessibility improvements</li>
              <li>Monitor for accessibility issues and bugs</li>
              <li>Train our team on accessibility best practices</li>
              <li>Review third-party tools for accessibility compliance</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}