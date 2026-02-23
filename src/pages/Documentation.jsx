import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen, ChevronRight, ArrowLeft, Search } from 'lucide-react';

export default function Documentation() {
  const [search, setSearch] = useState('');

  const categories = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      articles: [
        { title: 'Welcome to LifeGuard Tracker', path: '/docs/getting-started/welcome' },
        { title: 'Setting Up Your Account', path: '/docs/getting-started/setup' },
        { title: 'First Steps: Creating Your Facility', path: '/docs/getting-started/facility' },
        { title: 'Inviting Your Team', path: '/docs/getting-started/team' },
      ]
    },
    {
      title: 'Scheduling',
      icon: BookOpen,
      articles: [
        { title: 'Creating Shifts', path: '/docs/scheduling/shifts' },
        { title: 'Managing Schedules', path: '/docs/scheduling/management' },
        { title: 'Shift Swaps & Requests', path: '/docs/scheduling/swaps' },
        { title: 'Time Off Management', path: '/docs/scheduling/timeoff' },
      ]
    },
    {
      title: 'Compliance',
      icon: BookOpen,
      articles: [
        { title: 'Certification Tracking', path: '/docs/compliance/certifications' },
        { title: 'Incident Reporting', path: '/docs/compliance/incidents' },
        { title: 'Compliance Workflows', path: '/docs/compliance/workflows' },
        { title: 'Audit Preparation', path: '/docs/compliance/audits' },
      ]
    },
    {
      title: 'Administration',
      icon: BookOpen,
      articles: [
        { title: 'Managing Employees', path: '/docs/admin/employees' },
        { title: 'Role-Based Access', path: '/docs/admin/roles' },
        { title: 'Location Management', path: '/docs/admin/locations' },
        { title: 'System Settings', path: '/docs/admin/settings' },
      ]
    },
    {
      title: 'Integrations',
      icon: BookOpen,
      articles: [
        { title: 'Payroll Integration', path: '/docs/integrations/payroll' },
        { title: 'Weather Alerts', path: '/docs/integrations/weather' },
        { title: 'LMS Integration', path: '/docs/integrations/lms' },
        { title: 'Event Calendar Sync', path: '/docs/integrations/calendar' },
      ]
    },
    {
      title: 'Mobile App',
      icon: BookOpen,
      articles: [
        { title: 'iOS & Android Setup', path: '/docs/mobile/setup' },
        { title: 'Clock In/Out', path: '/docs/mobile/clockinout' },
        { title: 'Mobile Chat', path: '/docs/mobile/chat' },
        { title: 'Push Notifications', path: '/docs/mobile/notifications' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-[#1a9c5b]" />
            <h1 className="text-4xl font-bold text-gray-900">Documentation</h1>
          </div>
          <p className="text-lg text-gray-600">Complete guides to help you master LifeGuard Tracker</p>
        </div>

        {/* Search */}
        <div className="mb-12 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]"
            />
          </div>
        </div>

        {/* Documentation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category.title} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <category.icon className="w-6 h-6 text-[#1a9c5b]" />
                <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
              </div>
              <ul className="space-y-2">
                {category.articles.map(article => (
                  <li key={article.title}>
                    <a href={article.path} className="flex items-center gap-2 text-[#1a9c5b] hover:underline text-sm">
                      {article.title}
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Video Tutorials */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Video Tutorials</h2>
          <p className="text-gray-600 mb-8">
            Learn by watching step-by-step video guides. <Link to={createPageUrl('Tutorials')} className="text-[#1a9c5b] hover:underline">View all tutorials →</Link>
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-12 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page and follow the email link.' },
              { q: 'Can I import my current schedule?', a: 'Yes! We offer free data migration from your current system.' },
              { q: 'How do I set up GPS tracking?', a: 'Enable it in settings and opt-in employees will be tracked when clocked in.' },
              { q: 'Is there a mobile app?', a: 'Yes, iOS and Android apps are available for clock in/out and schedule access.' },
            ].map((faq, i) => (
              <details key={i} className="border border-gray-200 rounded-lg p-4 group cursor-pointer">
                <summary className="font-semibold text-gray-900 flex items-center justify-between">
                  {faq.q}
                  <span className="text-[#1a9c5b] group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-gray-600 text-sm mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Support CTA */}
        <div className="mt-16 pt-12 border-t border-gray-200 text-center">
          <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
          <Link to={createPageUrl('Contact')}>
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}