import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, ChevronDown, ChevronRight, Shield, CalendarDays, Users, MapPin,
  AlertTriangle, BarChart2, BookOpen, Wrench, Clock, Zap, MessageSquare,
  FileText, Award, Activity, Eye, Globe, Lightbulb, TrendingDown, Droplets,
  Bell, CreditCard, Settings
} from "lucide-react";

const sections = [
  {
    category: "Getting Started",
    icon: Shield,
    color: "bg-green-100 text-green-700",
    items: [
      {
        title: "What is LifeGuard Tracker?",
        content: `LifeGuard Tracker is an all-in-one aquatic facility management platform designed for lifeguard supervisors, facility managers, and aquatic operations teams. It covers scheduling, compliance, certifications, incident logging, pool chemistry, asset management, and much more.

Plans available:
• Starter — Core scheduling, employees, locations, and time-off management
• Pro — Adds compliance tools, advanced reporting, asset management, pool test tracking, and AI-powered scheduling
• Enterprise — Adds GPS tracking, workforce forecasting, performance reviews, multi-location dashboards, AI guard insights, and emergency dispatch`
      },
      {
        title: "Initial Setup Checklist",
        content: `Follow these steps to go live quickly:

1. Add Locations — Go to Locations and create each pool zone, beach area, or facility.
2. Add Employees — Go to Employees → Add Employee. Fill in name, role, certifications, and hourly rate.
3. Build Your First Schedule — Go to Schedule and drag employees onto shift blocks.
4. Configure Alerts — Go to Admin Setup → Automations to enable scheduled functions like certification expiry checks and weather alerts.
5. Invite Your Team — Go to Settings → Invite Employees to send login invites by email.
6. Set Notification Preferences — Each user can customize their alerts under their profile avatar → Notification Preferences.`
      },
      {
        title: "User Roles & Access",
        content: `LifeGuard Tracker uses role-based access control:

• Lifeguard — Can view their schedule, submit time-off requests, swap shifts, log incidents, and access the mobile guard dashboard.
• Head Lifeguard — Same as Lifeguard, plus can view team schedules.
• Supervisor / Admin — Full access to scheduling, employees, certifications, locations, reports, and onboarding.
• Manager / Enterprise Admin — All features including performance reviews, multi-location dashboards, payroll integrations, and admin setup.

Roles are assigned when you invite employees. You can update a user's role in the Employee Management page.`
      },
    ]
  },
  {
    category: "Scheduling",
    icon: CalendarDays,
    color: "bg-blue-100 text-blue-700",
    items: [
      {
        title: "Building & Managing Shifts",
        content: `Navigate to the Schedule page to view and manage all shifts in a weekly grid view.

Creating a shift:
• Click any empty cell on the grid or use the "+ Add Shift" button.
• Select employee, location, start/end time, and any notes.
• Shifts are color-coded by employee for easy visual scanning.

Editing & deleting:
• Click any existing shift block to edit or delete it.

Recurring shifts:
• Use the "Recurring Shift" option to create a repeating weekly pattern.

Templates:
• Save common shift configurations as templates via the Shift Templates panel.

Conflict detection:
• The schedule automatically flags overlapping shifts and understaffing alerts.`
      },
      {
        title: "AI Shift Planner (Pro/Enterprise)",
        content: `The Auto Shift Planner uses AI to suggest optimal shift assignments based on:
• Employee availability and preferences
• Certification requirements per zone
• Maximum weekly hours limits
• Historical scheduling patterns

To use it:
1. Go to Enterprise → Scheduling → Auto Shift Planner.
2. Select the week you want to plan.
3. Click "Generate Suggestions" — the AI proposes a full week's schedule.
4. Review and approve, edit, or reject individual suggestions.
5. Publish the schedule to notify employees.`
      },
      {
        title: "Workforce Scheduler (Enterprise)",
        content: `The Workforce Scheduler provides a full drag-and-drop multi-location scheduling view for enterprise operations.

Key features:
• View all locations side-by-side in one calendar
• Drag employees between time slots
• Filter by location, role, or certification
• See real-time coverage warnings (locations with insufficient guards)
• Export schedule to PDF or CSV

Access via Enterprise → Scheduling → Workforce Scheduler.`
      },
      {
        title: "Shift Swaps & Time Off",
        content: `Employees can request shift swaps and time off directly in the app.

Shift Swaps:
1. Employee goes to Team → Shift Swaps → Request Swap.
2. Selects their shift and the shift they want in return.
3. The other employee is notified and can accept or decline.
4. Managers can then approve or deny the swap.

Time Off:
1. Employee goes to Team → Time Off → New Request.
2. Sets date range and reason.
3. Managers approve or deny with one click.
4. Approved time off appears on the schedule automatically.

Shift Preferences:
• Employees can set preferred days, locations, and hours via Team → Shift Preferences. The AI Planner respects these when generating suggestions.`
      },
    ]
  },
  {
    category: "Employees & Certifications",
    icon: Users,
    color: "bg-purple-100 text-purple-700",
    items: [
      {
        title: "Managing Employees",
        content: `Go to Employees to manage your entire team roster.

Adding an employee:
• Click "Add Employee" and fill in first/last name, role, email, phone, hourly rate, and certifications.
• Upload a profile photo and assign a location.
• Add emergency contact details (name, phone, relationship).

Employee profiles include:
• Certification records with expiry tracking
• Shift history and hours worked
• Performance reviews (Enterprise)
• Onboarding workflow status
• Badges earned

Employee Directory:
• Public-facing phone/email directory for your team. Access via Enterprise → People → Directory.`
      },
      {
        title: "Certification Tracking & Alerts",
        content: `LifeGuard Tracker tracks all staff certifications and sends automated alerts before they expire.

Supported certification types:
• Lifeguard Certification (Red Cross, YMCA, Ellis & Associates, etc.)
• CPR/AED
• First Aid
• Water Safety Instructor (WSI)
• Oxygen Administration
• Any custom certification you define

Expiry alerts:
• Critical alert: certification already expired
• Urgent alert: expires within 14 days
• Warning: expires within 30 days

To enable automated daily alerts, configure the certificationExpiryNotify function in Admin Setup → Automations.

Cert Compliance Dashboard:
• View team-wide certification compliance at a glance via Enterprise → Compliance → Cert Compliance.`
      },
      {
        title: "Employee Onboarding",
        content: `Automate new hire onboarding with structured task flows.

Starting onboarding:
1. Go to Enterprise → Staff Development → Employee Onboarding.
2. Click "Start Onboarding" for any new employee.
3. The system auto-generates role-specific tasks (IT setup, HR paperwork, safety training, certification review, etc.).
4. Tasks appear with due dates, assigned staff, and status tracking.

Tracking progress:
• Each onboarding workflow shows an overall completion % with a visual progress bar.
• Mark tasks complete as they are finished.
• When all tasks are done, the workflow is marked complete.

Custom Onboarding Rules:
• Admins can define custom rule-based onboarding tasks in the Onboarding Rule Builder.`
      },
      {
        title: "Performance Reviews (Enterprise)",
        content: `Enterprise users can create AI-assisted performance reviews for any employee.

Creating a review:
1. Go to Enterprise → Staff Development → Performance Reviews.
2. Click "New Review", select employee and review period.
3. Fill in skill ratings (1-5 scale) with specific feedback.
4. Click "Generate AI Summary" for a professional narrative.
5. Add manager notes and set status to Completed or Published.

Metrics tracked:
• Total hours worked
• Average hours per week
• Certifications held and training modules completed
• Incidents responded to
• Attendance rate

Review history is visible directly on each employee's profile page.`
      },
    ]
  },
  {
    category: "Compliance & Safety",
    icon: Shield,
    color: "bg-red-100 text-red-700",
    items: [
      {
        title: "Compliance Dashboard",
        content: `The Compliance Dashboard provides a centralized view of your facility's regulatory standing.

Key sections:
• Compliance score by category (Facility Maintenance, Daily Ops, Risk Management, Staff Training, Safety Teams)
• Open compliance gaps with priority levels
• Upcoming assessment deadlines
• Trend chart showing compliance over time

Access via Enterprise → Compliance → Compliance Dashboard.

Standards supported: MAHC, OSHA, ANSI, and local health guidelines.`
      },
      {
        title: "Incident Logging",
        content: `Log all incidents quickly and accurately from any device.

Creating an incident log:
1. Go to Enterprise → Compliance → Incident & Rescue Logs → Log Incident.
2. Select location, date/time, incident type (rescue, first aid, near-miss, injury, etc.), and severity.
3. Describe the incident and action taken.
4. Record patron info if applicable.
5. Note whether EMS was called or patron was transported.
6. Attach photos as documentation evidence.
7. Capture a digital signature to confirm accountability.
8. Submit — the incident is logged and open for review.

Follow-up workflows:
• Open incidents can be assigned follow-up steps and closed when resolved.
• Incident Dashboard shows all open, reviewed, and closed incidents.

Digital signatures:
• All incident reports require a digital signature before submission. Signatures are stored securely.`
      },
      {
        title: "Pool Test Reporting",
        content: `Log water chemistry tests directly from poolside on any device.

Parameters logged:
• Free chlorine (ppm) — acceptable: 1.0–3.0
• Total chlorine (ppm)
• pH — acceptable: 7.2–7.8
• Total alkalinity (ppm) — acceptable: 80–120
• Calcium hardness (ppm)
• Cyanuric acid/stabilizer (ppm)
• Water temperature (°F)

Compliance checking:
• Automatic flag when any parameter falls outside MAHC or local standards.
• Out-of-range parameters highlighted in red.
• Corrective actions recorded alongside test results.

Trend charts:
• View chemical balance patterns over time to spot drifts before they become violations.

Compliance status: pass / warning / fail auto-calculated per test.
Access via Enterprise → Facilities & Assets → Pool Test Reporting.`
      },
      {
        title: "AI Compliance Advisor (Pro/Enterprise)",
        content: `The AI Compliance Advisor automatically analyzes your facility data to surface regulatory risks before they become violations.

What it analyzes:
• Certification expiry status across your team
• Pool chemistry compliance trends
• Incident frequency and severity patterns
• Asset maintenance overdue items
• Checklist completion rates

Output:
• Ranked list of compliance risks with confidence scores
• Severity levels (critical, high, medium, low)
• Specific actionable recommendations with effort estimates
• Acknowledgement tracking for ongoing monitoring

Access via Enterprise → Reports & Admin → AI Compliance Advisor.`
      },
      {
        title: "Emergency Action Plans",
        content: `Create and manage Emergency Action Plans (EAPs) for each location.

EAPs include:
• Step-by-step emergency procedures
• Contact lists and escalation paths
• Equipment locations
• Evacuation routes
• Specific scenarios (drowning, spinal injury, lightning, chemical spill)

Access via Enterprise → Facilities & Assets → Emergency Action Plans.

The Emergency Dispatch (Enterprise) page provides a one-tap panic button and team-wide emergency communication tool.`
      },
      {
        title: "Checklist & Operational Forms",
        content: `Create custom checklists and operational forms for daily operations.

Checklist Dashboard:
• View daily/weekly/monthly checklists and their completion status.
• Assign checklists to specific staff and locations.
• Track audit history of all submitted checklists.

Operational Forms:
• Build custom forms with checkboxes, text fields, and number inputs.
• Configure required fields, alert recipients, and submission frequency.
• View all form submissions with filterable history.

Access via Enterprise → Comms & Forms.`
      },
    ]
  },
  {
    category: "GPS & Location Tracking",
    icon: MapPin,
    color: "bg-teal-100 text-teal-700",
    items: [
      {
        title: "Real-Time GPS Tracking",
        content: `Enterprise plans include optional real-time GPS location tracking for guards while on duty.

Enabling tracking:
• GPS tracking is opt-in per employee. Enable it in the employee profile under "GPS Tracking Enabled".
• When a guard clocks in and GPS is enabled, their location is tracked and displayed on the live map.

Live Map view:
• See all active guards on an interactive map in real-time.
• Color-coded markers show each guard's last known position.
• Clicking a marker shows employee name, location, and last update timestamp.

Access via Enterprise → Staff Development → Location Tracking.`
      },
      {
        title: "Coverage Heatmap",
        content: `The Coverage Heatmap shows patrol zone coverage in real-time so supervisors can spot gaps immediately.

How it works:
• All active locations are displayed as zones.
• Zones with active guards are highlighted green.
• Zones with partial coverage are orange.
• Uncovered zones are flagged red with an alert panel below the map.

Coverage summary pills at the top of the page show:
• Number of guards on duty
• Number of active locations
• Number of uncovered zones

Access via Enterprise → Staff Development → Location Tracking → Coverage Map tab.`
      },
      {
        title: "GPS Clock-In Verification",
        content: `Guards can be required to clock in within a geofenced radius of their assigned location.

Setup:
• Set the geofence radius (meters) on each Location record.
• When a guard clocks in, their GPS coordinates are compared to the location coordinates.
• If within the geofence, clock-in is verified. If outside, a flag is recorded with the distance.

Clock entries store:
• GPS latitude/longitude at clock-in and clock-out
• Whether the clock-in was geofence-verified
• Distance from expected location in meters

This data is available in the Clock Reports and Location History Report.`
      },
    ]
  },
  {
    category: "Asset Management",
    icon: Wrench,
    color: "bg-amber-100 text-amber-700",
    items: [
      {
        title: "Managing Assets & Equipment",
        content: `Track all facility equipment with full lifecycle management.

Creating an asset:
• Go to Enterprise → Facilities & Assets → Asset Management.
• Add equipment with name, type, location, condition, purchase date, warranty expiry, and expected service intervals.

Asset conditions: excellent, good, fair, poor, out of service.

Service History:
• Log every service event (maintenance, repair, inspection, replacement, upgrade).
• Record technician, cost, parts used, duration, and next service date.
• Attach before/after photos for documentation.

Maintenance Requests:
• Staff can submit maintenance requests with priority levels.
• Managers approve and assign requests.
• Approved requests trigger service history entries.

Preventative maintenance alerts:
• Assets nearing their next service date surface automatically in the dashboard.`
      },
    ]
  },
  {
    category: "Reporting & Analytics",
    icon: BarChart2,
    color: "bg-indigo-100 text-indigo-700",
    items: [
      {
        title: "Safety Metrics Dashboard",
        content: `The Safety Metrics Dashboard provides a high-level view of incident trends, patron counts, and guard performance.

KPIs shown:
• Total incidents in selected period
• Rescues logged
• Open (unresolved) cases
• EMS activations

Charts included:
• Incidents over time (bar chart)
• Patron count trend (7-day line)
• Incidents by type (ranked list with progress bars)
• Incidents by severity (color-coded breakdown)
• Recent incidents list with location and severity

Date range filter: 7 days, 30 days, or 90 days.

Access via Enterprise → Reports & Admin → Safety Metrics Dashboard.`
      },
      {
        title: "Advanced Reporting",
        content: `Generate detailed reports across all modules in PDF, CSV, or JSON format.

Report types:
• Asset Performance — MTBF, availability, maintenance costs
• Pool Test Summary — compliance rates, parameter trends
• Compliance Scorecard — scores by category with trend visualization
• Staff Performance — shifts worked, hours, certifications
• Safety Trends — incident patterns and hotspot analysis
• Maintenance Forecast — predictive service scheduling

Select a date range and location, then generate or schedule recurring reports.

Access via Enterprise → Reports & Admin → Advanced Reporting.`
      },
      {
        title: "Incident Trend Report",
        content: `The Incident Trend Report surfaces patterns in your incident data to help prevent future events.

What you'll see:
• Incident volume over time by type
• Severity distribution heatmap
• Hourly hotspot chart (which hours have most incidents)
• Location-based breakdown
• Year-over-year comparison if sufficient data exists

Use this report to identify peak risk hours and make shift scheduling decisions accordingly.

Access via Enterprise → Reports & Admin → Incident Trends.`
      },
      {
        title: "Staffing Forecast Dashboard (Enterprise)",
        content: `The Staffing Forecast generates 7-day predictions of staffing needs versus scheduled staff.

How it works:
• The generateStaffingForecast function (run daily at 6 AM) analyzes historical patron counts, incident patterns, weather, and seasonal trends.
• It outputs a confidence-scored forecast per day showing predicted patron volume and recommended guard count.
• Days highlighted red = high risk (understaffed), yellow = moderate risk, green = adequately covered.

Enable the automation in Admin Setup → Automations.

Access via Enterprise → Reports & Admin → Staffing Forecast.`
      },
      {
        title: "Employee Performance Dashboard",
        content: `Track individual and team performance metrics over time.

Metrics tracked per employee:
• Overall performance rating (1–5 stars)
• Attendance rate (%)
• Total hours worked
• Incidents responded to and average response time
• Certifications current vs. expired
• Safety violations recorded
• Reliability score

Run updateEmployeePerformance daily via Automations for fresh data.

Access via Enterprise → Analytics & Team → Employee Performance.`
      },
      {
        title: "Multi-Location Dashboard (Enterprise)",
        content: `Get a bird's-eye view across all facilities simultaneously.

Shows per location:
• Current staffing level vs. required minimum
• Today's open incidents
• Compliance score
• Pool chemistry status
• Recent alerts

Drill down into any location for full detail.

Access via Enterprise → Reports & Admin → Multi-Location Dashboard.`
      },
    ]
  },
  {
    category: "Communications",
    icon: MessageSquare,
    color: "bg-pink-100 text-pink-700",
    items: [
      {
        title: "Announcements",
        content: `Post organization-wide announcements visible to all staff.

Creating an announcement:
• Go to Enterprise → Comms & Forms → Announcements.
• Write a title and body (supports rich text).
• Set an expiry date (optional) and priority level.
• Post — all users see it in their announcement feed.

Staff can comment on announcements, and admins can pin important announcements to the top.`
      },
      {
        title: "Channels & Messaging",
        content: `Team messaging is available in two forms:

Direct Messages (Messages):
• Send one-on-one messages to any team member.
• Messages are threaded by conversation.
• Unread message count shown in the Team menu.

Channels:
• Create group channels for locations, teams, or projects.
• All channel members receive new messages in real-time.
• Channel history is fully searchable.

Urgent Alerts:
• Admins can send urgent broadcast alerts (lightning strikes, facility closure, emergency, etc.) to all or specific staff.
• Alerts are delivered in-app and optionally via SMS.`
      },
    ]
  },
  {
    category: "AI & Automation",
    icon: Lightbulb,
    color: "bg-yellow-100 text-yellow-700",
    items: [
      {
        title: "AI Guard Insights (Enterprise)",
        content: `The AI Guard Insights page analyzes guard activity patterns and surfaces anomalies and recommendations.

What it detects:
• Guards with unusually high or low incident response rates
• Coverage gaps based on historical patrol data
• Peak risk time predictions
• Fatigue risk based on consecutive shift patterns
• Recommended patrol adjustments by zone

Access via Enterprise → Analytics & Team → AI Guard Insights.`
      },
      {
        title: "Weather Alert System (Pro/Enterprise)",
        content: `Real-time weather monitoring with automatic pool closure recommendations.

Alert types:
• Lightning / Thunderstorm — immediate pool closure recommended
• Extreme Heat (>100°F) — increased hydration and rotation protocols
• Extreme Cold — hypothermia risk for open water facilities
• High Wind — watercraft and deep water restrictions
• Heavy Rain — reduced visibility protocols
• Poor Air Quality — outdoor exposure limits

Configure checkWeatherAlerts to run every 30 minutes in Admin Setup → Automations.

Access active and resolved weather alerts via Enterprise → Reports & Admin → Weather Alerts.`
      },
      {
        title: "Workflow Automation Engine (Pro/Enterprise)",
        content: `Build multi-step automated workflows triggered by system events.

Trigger types:
• Document uploaded
• Asset status changed
• Certification expiry approaching
• Incident logged
• Pool test out of range
• Manual trigger

Workflow steps can:
• Create tasks assigned to specific staff
• Create compliance assessments
• Send notifications to specified roles
• Update entity records
• Require approval before proceeding

Example workflow:
Upload inspection document → Auto-trigger compliance assessment → Require manager sign-off → Create follow-up tasks with due dates.

Access via Enterprise → Reports & Admin → Workflow Automation.`
      },
      {
        title: "Scheduled Automations",
        content: `Configure these backend functions to run automatically for optimal operation:

• certificationExpiryNotify — Daily 9 AM: Sends alerts for expiring/expired certifications
• checkWeatherAlerts — Every 30 min: Monitors real-time weather and creates alerts
• generateStaffingForecast — Daily 6 AM: Calculates 7-day staffing predictions
• updateEmployeePerformance — Daily 7 AM: Refreshes performance metrics
• awardBadges — Daily 8 AM: Auto-awards achievement badges
• sendShiftReminder — Configure for shift start reminders
• sendBookingReminders — Sends resource booking reminders

Set these up in Admin Setup → Automations.`
      },
    ]
  },
  {
    category: "Mobile & Guard Dashboard",
    icon: Activity,
    color: "bg-cyan-100 text-cyan-700",
    items: [
      {
        title: "Mobile Guard Dashboard",
        content: `Guards on the go can access a mobile-optimized dashboard with the most critical tools.

Features:
• One-tap clock in/out with GPS verification
• View today's shift and location assignment
• Log incidents from the field
• Submit operational forms and checklists
• View team announcements and messages
• Panic/emergency button to notify all supervisors instantly

Access by navigating to Team → Guard Mobile View, or on a mobile device the layout automatically adapts.

Offline support:
• Clock-ins and incident logs can be queued offline and synced when connectivity is restored.`
      },
      {
        title: "Public Status Widget (Pro/Enterprise)",
        content: `Embed a real-time status display on your facility's public website.

Shows patrons:
• Current guard count on duty
• Pool open/closed status
• Crowd density level (low, moderate, high)
• Real-time weather conditions
• Any active alerts (lightning hold, etc.)

Configure the widget in Enterprise → Reports & Admin → Public Status Widget.
Embed via an <iframe> snippet provided on that page.`
      },
    ]
  },
  {
    category: "Billing & Settings",
    icon: CreditCard,
    color: "bg-gray-100 text-gray-700",
    items: [
      {
        title: "Plans & Billing",
        content: `LifeGuard Tracker offers three plan tiers:

Starter — $29/month or $290/year
• Core scheduling, employee management, locations, time off, shift swaps, certifications, basic incident logs, mobile access.

Pro — $99/month or $990/year
• Everything in Starter, plus: compliance dashboard, assessment manager, pool test reporting, asset management, AI compliance advisor, advanced reporting, workflow automation, document management, AI scheduling assistant, weather alerts, staffing forecast.

Enterprise — $499/month or $4,990/year
• Everything in Pro, plus: GPS tracking, workforce scheduler, performance reviews, AI guard insights, emergency dispatch, multi-location dashboard, patron management, payroll integrations, public status widget, data import tools.

Manage your subscription at Enterprise → Reports & Admin → Billing.`
      },
      {
        title: "Settings & Admin Setup",
        content: `The Settings page (site owners only) covers:
• Organization name and branding
• Location and timezone configuration
• Invite employees by email
• Roster import (CSV upload)
• Data deletion requests
• Integrations (Stripe, Twilio SMS, payroll providers)

Admin Setup covers:
• Role and permission configuration
• Automation scheduling
• Default compliance standards
• Alert thresholds

Access via Enterprise → Reports & Admin → Settings / Admin Setup.`
      },
      {
        title: "Data Import",
        content: `Import existing data in bulk via CSV upload.

Import modules available:
• Employees — name, role, email, phone, certifications
• Locations — name, type, address, GPS coordinates
• Shifts — date, start/end time, employee, location
• Certifications — employee, cert name, expiry date
• Assets — name, type, location, condition, purchase date

Access via Enterprise → Reports & Admin → Data Import.

Download the CSV template for each module to ensure correct column formatting before uploading.`
      },
    ]
  },
  {
    category: "Staff Recognition",
    icon: Award,
    color: "bg-orange-100 text-orange-700",
    items: [
      {
        title: "Badges & Gamification",
        content: `LifeGuard Tracker automatically awards achievement badges to recognize standout staff.

Available badges:
• Perfect Attendance — zero absences in a period
• Incident Responder — high incident response count
• Certified Trainer — holds WSI or trainer certification
• Safety Hero — zero safety violations + high performance
• Team Player — helps with shift swaps frequently
• 500 Hour Commitment — 500+ hours logged
• Rapid Responder — consistently fast incident response times
• Zero Violations — clean compliance record
• Mentor — assists with onboarding tasks
• Lifesaver — logged a rescue

Run awardBadges daily via Automations. View badges on each employee's profile or on the Staff Recognition leaderboard.

Access via Enterprise → Analytics & Team → Staff Recognition.`
      },
    ]
  },
];

export default function Docs() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  const toggle = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filtered = search.trim()
    ? sections.map(sec => ({
        ...sec,
        items: sec.items.filter(
          item =>
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.content.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(sec => sec.items.length > 0)
    : sections;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      <div>
        <Link to={createPageUrl("Dashboard")} className="text-sm text-[#1a9c5b] hover:underline">← Back to Dashboard</Link>
        <h1 className="text-4xl font-bold text-gray-900 mt-4">Documentation</h1>
        <p className="text-gray-500 mt-2">Everything you need to get the most out of LifeGuard Tracker.</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Tutorials", page: "Tutorials", icon: BookOpen },
          { label: "Contact Support", page: "Contact", icon: MessageSquare },
          { label: "Billing", page: "Billing", icon: CreditCard },
        ].map(link => (
          <Link key={link.page} to={createPageUrl(link.page)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 hover:border-[#1a9c5b] hover:bg-[#f0faf5] text-sm font-medium text-gray-700 transition-colors">
            <link.icon className="w-4 h-4 text-[#1a9c5b]" />
            {link.label}
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search documentation..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {filtered.map((section, catIdx) => (
          <div key={section.category}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${section.color}`}>
                <section.icon className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{section.category}</h2>
              <Badge className={section.color}>{section.items.length}</Badge>
            </div>
            <div className="space-y-2">
              {section.items.map((item, itemIdx) => {
                const key = `${catIdx}-${itemIdx}`;
                const open = !!expanded[key];
                return (
                  <Card key={itemIdx} className="overflow-hidden">
                    <button
                      onClick={() => toggle(catIdx, itemIdx)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 text-left"
                    >
                      <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                      {open ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                    </button>
                    {open && (
                      <CardContent className="border-t bg-gray-50 py-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{item.content}</pre>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">No results for "{search}"</div>
      )}
    </div>
  );
}