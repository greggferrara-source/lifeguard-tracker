import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen, ChevronRight, ArrowLeft, Search, Radio, Trophy, TrendingUp, CheckCircle2, Zap, AlertTriangle, Shield } from 'lucide-react';

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
      title: 'IoT & Analytics',
      icon: Radio,
      articles: [
        { title: 'Setting Up IoT Sensors', path: '/docs/iot/setup' },
        { title: 'Water Quality Monitoring', path: '/docs/iot/water-quality' },
        { title: 'Anomaly Detection', path: '/docs/iot/anomalies' },
        { title: 'Predictive Reports', path: '/docs/iot/predictions' },
      ]
    },
    {
      title: 'Incident Management',
      icon: AlertTriangle,
      articles: [
        { title: 'Reporting Incidents', path: '/docs/incidents/reporting' },
        { title: 'Incident Analysis', path: '/docs/incidents/analysis' },
        { title: 'AI Insights & Trends', path: '/docs/incidents/ai-insights' },
        { title: 'Follow-up Actions', path: '/docs/incidents/followup' },
      ]
    },
    {
      title: 'Training & Gamification',
      icon: Trophy,
      articles: [
        { title: 'Creating Training Modules', path: '/docs/training/creation' },
        { title: 'Assigning Training', path: '/docs/training/assignment' },
        { title: 'Gamification System', path: '/docs/training/gamification' },
        { title: 'Leaderboards & Badges', path: '/docs/training/leaderboards' },
      ]
    },
    {
      title: 'Safety Predictions',
      icon: TrendingUp,
      articles: [
        { title: 'Risk Assessment', path: '/docs/safety/risk-assessment' },
        { title: 'Staffing Recommendations', path: '/docs/safety/staffing' },
        { title: 'Training Gap Analysis', path: '/docs/safety/gaps' },
        { title: 'Predictive Insights', path: '/docs/safety/insights' },
      ]
    },
    {
      title: 'Advanced Features',
      icon: Zap,
      articles: [
        { title: 'AI Safety Advisor', path: '/docs/advanced/ai-advisor' },
        { title: 'Multi-Location Management', path: '/docs/advanced/multi-location' },
        { title: 'Document Management', path: '/docs/advanced/documents' },
        { title: 'Compliance Automation', path: '/docs/advanced/compliance' },
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
              { q: 'How do I set up IoT sensors?', a: 'Connect your water quality sensors via our integration platform. Configure thresholds and alerts in the IoT settings dashboard.' },
              { q: 'How does AI predict safety risks?', a: 'Our system analyzes incident history, staff certifications, sensor data, and performance metrics to predict incident likelihood and recommend preventive actions.' },
              { q: 'Can I gamify training for my staff?', a: 'Yes! The training system includes points, badges, streaks, and leaderboards. Staff earn rewards for completing modules and quiz success.' },
              { q: 'How are training modules recommended?', a: 'AI analyzes your incident trends and employee performance to recommend personalized training modules addressing identified skill gaps.' },
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