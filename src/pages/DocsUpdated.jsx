import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";

const sections = [
  {
    title: "Advanced Notification System",
    content: "Real-time alert system for critical events with configurable user preferences. Notifications for pool test out-of-range results, maintenance due dates, compliance gaps, and task assignments. Support for email, in-app, and SMS notifications with severity levels and quiet hours. Users can customize notification types, delivery methods, and alert thresholds. Unread notification badges and comprehensive notification history with archive. Access via Notifications menu."
  },
  {
    title: "Enterprise Document Management",
    content: "Centralized document storage with version control, categorization, and lifecycle management. Upload certifications, inspection reports, equipment manuals, compliance documents, and training materials. Associate documents with employees, assets, locations, or compliance items. Document expiry tracking with automatic alerts for expiring certifications. Version history tracking with previous version links. Full-text search with tags and metadata filtering. Access via Admin → Reports & Admin → Document Management."
  },
  {
    title: "Advanced Reporting & Analytics Suite",
    content: "Comprehensive reporting across all modules with customizable dashboards and data visualizations. Asset performance dashboards showing MTBF, availability, and maintenance costs. Pool test trends with compliance rates and parameter analysis over time. Compliance analysis by category with scoring and trend visualization. Staff performance metrics including shifts worked and hours logged. Generate multi-format reports (PDF, CSV, JSON) for any date range and location. Trend analysis visualizations with predictive maintenance insights. Access via Admin → Reports & Admin → Advanced Reporting."
  },
  {
    title: "AI-Powered Compliance Advisor",
    content: "Intelligent AI system that analyzes facility data to identify potential regulatory violations and compliance gaps. Detects violations against OSHA, MAHC, and ANSI standards. Analyzes trends across Employee Management, Asset Management, Pool Testing, and Compliance modules. Generates confidence-scored insights with severity levels. Provides specific, actionable recommendations for each identified issue with priority levels and effort estimates. Supports manual analysis across all facilities or specific locations. Tracks acknowledged vs. unacknowledged insights for ongoing compliance monitoring. Access via Admin → Reports & Admin → AI Compliance Advisor."
  },
  {
    title: "Comprehensive Compliance Assessment Manager",
    content: "Digital self-assessment and action-planning tool for aquatic operations. Complete assessments across facility maintenance, daily operations, risk management, staff training, and safety teams using standardized questions based on MAHC and aquatic safety best practices. Convert findings into actionable gap tasks assigned to specific staff with accountability tracking. Retest and verify improvements with photo documentation and before/after evidence. Multi-site compliance oversight with radar charts and comparative analysis across locations. Built-in resource library with templates, guidance documents, glossary, and safety references. Track compliance scores over time and maintain audit-ready records of due diligence efforts. Access via Admin → Compliance → Assessment Manager."
  },
  {
    title: "Pool Test Reporting & Compliance",
    content: "Digital pool water chemistry testing with compliance tracking. Log chlorine (free/total), pH, alkalinity, calcium hardness, cyanuric acid, and temperature. Automatic compliance alerts when parameters fall outside MAHC standards. Visual trend graphs showing chemical balance patterns over time. Instant out-of-range notifications with corrective action tracking. Mobile-friendly test entry from poolside. Historical data access for compliance audits and inspections. Customizable test standards (MAHC vs local guidelines). Signature capture and timestamp verification for audit readiness. Access via Admin → Operations → Pool Test Reporting."
  },
  {
    title: "Advanced Asset Management Hub",
    content: "Complete equipment lifecycle management with maintenance request workflows, approval processes, and service history tracking. Submit maintenance requests with priority levels and cost estimates. Track service records with before/after photos and parts documentation. Equipment performance dashboard shows maintenance patterns, service costs, and warranty status. Preventative maintenance scheduling with automatic alerts for overdue maintenance. Access via Admin → Operations → Asset Management. Includes warranty expiry tracking and condition-based reporting."
  },
  {
    title: "Advanced Employee Management",
    content: "Comprehensive staff certification tracking with automated expiration reminders and alerts. Monitor in-service training progress, view team performance metrics, and generate audit-ready compliance reports. Real-time compliance dashboard showing certification status. Access via Admin → People → Employee Management. Includes automated certification expiry notifications (critical alerts for expired, urgent alerts for 14-day expiry), supervisor oversight tools, and renewal reminders."
  },
  {
    title: "Digital Signature Capture for Incidents",
    content: "All incident reports now support digital signature capture using a draw-on-canvas signature pad. Required before incident submission to ensure accountability. Signature URLs stored securely. Includes supervisor approval workflows with signature verification. Enhances compliance and legal protections."
  },
  {
    title: "Facility Manager Real-Time Widgets",
    content: "Live dashboard showing open incidents today, checklists completed, inspection issues, and chemical balance status. Quick-glance metrics for open incident count, failed checklist count, and out-of-range chemical logs. Recent incidents list with severity indicators and compliance status progress bars. Access from main Dashboard for administrators."
  },
  {
    title: "Comprehensive Onboarding System",
    content: "Automate employee onboarding with customizable task flows. Start onboarding for new hires, auto-generates profile completion, role assignment, training module tasks, and equipment access steps. Track progress with visual indicators. Access via Admin → People → Onboarding. Create custom checklist and report templates to match facility workflows. Tasks automatically assigned with due dates."
  },
  {
    title: "Checklist & Report Template Builder",
    content: "Admin-friendly template builders for creating custom checklists and incident reports. Customize field types (checkbox, number, text), set required fields, configure alert recipients, and define frequency (daily, weekly, monthly, per-shift). Templates adapt to various facility management needs and workflows."
  },
  {
    title: "Shift Preferences Engine",
    content: "Employees can set preferred days, times, locations, max consecutive shifts, and blackout dates. Assign priority weights to preferences. Access via Team dropdown → Shift Preferences. Improves scheduling satisfaction and efficiency."
  },
  {
    title: "Incident Trend Reports",
    content: "Visual analytics showing incident types, severity breakdown, hourly hotspots, and trending patterns. Access via Reports & Admin → Incident Trends. Helps identify peak risk times and prevent incidents at high-incident hours."
  },
  {
    title: "Weather Alert System",
    content: "Real-time monitoring for lightning, extreme heat, cold, high wind, heavy rain, and air quality. Uses Open-Meteo API (free). Recommends pool closure or operations reduction based on severity. Configure checkWeatherAlerts to run every 30 minutes."
  },
  {
    title: "Staffing Forecast Dashboard",
    content: "7-day predictions of staffing needs vs. scheduled staff with confidence levels. Identifies high/medium/low risk days. Run generateStaffingForecast daily at 6 AM. Access via Reports & Admin → Staffing Forecast. Recommends specific hiring or hour reduction actions."
  },
  {
    title: "Employee Performance Dashboard",
    content: "Tracks performance ratings (1-5 stars), attendance rate, hours worked, incidents responded to, response times, certifications, reliability scores, and safety violations. Sortable and filterable by metrics. Access via Admin → Analytics & Team → Employee Performance. Run updateEmployeePerformance daily."
  },
  {
    title: "Employee Badges & Gamification",
    content: "Auto-awards badges for achievements: Perfect Attendance, Incident Responder, Certified Trainer, Safety Hero, Team Player, 500 Hour Commitment, Rapid Responder, Zero Violations, Mentor, Lifesaver. Motivates staff, recognizes excellence, and builds team culture."
  },
  {
    title: "Patron Profile Management",
    content: "Track guest swimming ability (non-swimmer, beginner, intermediate, advanced), age group, medical conditions, emergency contacts, incident history, visit frequency, and auto-calculated risk levels. Access via Admin → Analytics & Team → Patron Management. Helps identify high-risk patrons and tailor safety measures."
  },
  {
    title: "Complete Entity Suite",
    content: "New entities: ShiftPreference, IncidentTrend, WeatherAlert, StaffingForecast, EmployeePerformance, EmployeeBadge, PatronProfile, TrainingModule, TrainingCompletion, Onboarding, OnboardingTask, ChecklistTemplate, ChecklistSubmission, OperationalForm, OperationalFormSubmission. All fully integrated with existing Employee, Location, Shift, and IncidentLog entities."
  }
];

export default function DocsUpdated() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold">LifeGuard Tracker - Complete Feature Suite</h1>
      <p className="text-lg text-gray-600">Enterprise-grade facility management platform with advanced compliance, certification tracking, and real-time operational monitoring</p>

      <div className="space-y-3">
        {sections.map((section, idx) => (
          <Card key={idx}>
            <button
              onClick={() => setExpanded(expanded === idx ? null : idx)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50"
            >
              <h3 className="text-lg font-bold text-left">{section.title}</h3>
              {expanded === idx ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            {expanded === idx && (
              <CardContent className="border-t bg-gray-50 py-4">
                <p className="text-gray-700">{section.content}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-300">
        <CardHeader>
          <CardTitle>🔧 Recommended Automations Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="font-semibold">Configure these scheduled functions for optimal operation:</p>
          <ul className="ml-4 space-y-2">
            <li><strong>checkWeatherAlerts</strong> - Every 30 minutes (real-time weather monitoring)</li>
            <li><strong>generateStaffingForecast</strong> - Daily 6:00 AM (forecasting)</li>
            <li><strong>updateEmployeePerformance</strong> - Daily 7:00 AM (performance tracking)</li>
            <li><strong>awardBadges</strong> - Daily 8:00 AM (gamification)</li>
            <li><strong>certificationExpiryNotify</strong> - Daily 9:00 AM (compliance alerts)</li>
          </ul>
          <p className="text-xs text-gray-600 mt-2">Go to Dashboard → Admin Setup → Automations to configure</p>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-300">
        <CardHeader>
          <CardTitle>📍 Feature Access Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-green-900">📊 Admin Dashboard (Home)</p>
            <ul className="ml-4 mt-1 space-y-1 text-xs">
              <li>• Facility Dashboard with real-time metrics</li>
              <li>• Open incidents, checklist status, chemical balance</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-green-900">👥 People Management</p>
            <ul className="ml-4 mt-1 space-y-1 text-xs">
              <li>• Employee Management - Certifications, training, performance</li>
              <li>• Onboarding - New employee workflows & task tracking</li>
              <li>• Directory & Certifications</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-green-900">📈 Reports & Analytics</p>
            <ul className="ml-4 mt-1 space-y-1 text-xs">
              <li>• Incident Trends - Historical patterns and hotspots</li>
              <li>• Staffing Forecast - 7-day predictions</li>
              <li>• Weather Alerts Monitor - Active & resolved alerts</li>
              <li>• Employee Performance - Individual & team metrics</li>
              <li>• Patron Management - Guest profiles & risk assessment</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-green-900">⚙️ Team & Forms</p>
            <ul className="ml-4 mt-1 space-y-1 text-xs">
              <li>• Shift Preferences - Employee preferences</li>
              <li>• Operational Forms - Custom checklists & reports</li>
              <li>• Incident Logs - Digital signatures included</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-300">
        <CardHeader>
          <CardTitle>✨ Key Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>✓ Asset Lifecycle Management:</strong> Maintenance requests, service history, warranty tracking, equipment performance dashboards</p>
          <p><strong>✓ Compliance & Certifications:</strong> Auto-expiry alerts, renewal reminders, audit-ready reports</p>
          <p><strong>✓ Incident Management:</strong> Digital signatures, trend analysis, pattern detection</p>
          <p><strong>✓ Staffing Intelligence:</strong> 7-day forecasts, shortage predictions, preference-based scheduling</p>
          <p><strong>✓ Real-Time Monitoring:</strong> Weather alerts, chemical balance tracking, staffing status, maintenance alerts</p>
          <p><strong>✓ Employee Development:</strong> Training modules, performance tracking, achievement badges</p>
          <p><strong>✓ Customizable Forms:</strong> Template builder for checklists and incident reports</p>
        </CardContent>
      </Card>
    </div>
  );
}