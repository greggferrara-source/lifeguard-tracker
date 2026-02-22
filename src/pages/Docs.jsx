import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, CalendarDays, Users, Clock, ArrowLeftRight, AlertTriangle, BarChart2, Settings, CheckSquare, MapPin, ChevronRight } from "lucide-react";

const docs = [
  {
    section: "Getting Started",
    color: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-700",
    articles: [
      {
        title: "Welcome to LifeGuard Tracker",
        content: `LifeGuard Tracker is an all-in-one workforce management and safety compliance platform built for aquatic facilities — pools, beaches, waterparks, and recreation centers.

      **What you can do with LifeGuard Tracker:**
      - Build and manage weekly schedules with AI-powered shift recommendations
      - Track employee certifications and get automated expiry alerts
      - Log incidents, rescues, near-misses, and first aid events with photo attachments and structured follow-up workflows
      - Run digital checklists for chemical readings, equipment inspections, and opening/closing procedures
      - Manage chemical logs with automated out-of-range alerts and trend analysis
      - Assign and track facility assets (AEDs, rescue tubes, equipment) with maintenance scheduling
      - Run staff training modules with quizzes and completion tracking
      - Build and distribute Emergency Action Plans for every scenario
      - Manage time-off requests with an approval workflow
      - Send announcements and messages to your whole team
      - Generate professional PDF reports for compliance and regulatory inspections
      - Integrate with payroll systems (Gusto, ADP, Paychex, BambooHR, Rippling, Workday)
      - Monitor multi-location compliance and staffing in real-time

      **Who uses LifeGuard Tracker:**
      - **Enterprise Site Owners / Admins** — Full access including multi-location dashboards, EAPs, staff training, payroll integrations, compliance analytics, and enterprise billing/settings
      - **Site Owners / Admins (Pro)** — Compliance, incident management, operational forms, certifications, reports, alerts, team management, and scheduling
      - **Employees** — View schedules, submit time off, log incidents, complete training, upload certifications, and communicate with team`
      },
      {
        title: "Adding Your First Employee",
        content: `1. Navigate to **Employees** in the top navigation
2. Click **Add Employee** in the top right
3. Fill in the employee's name, email, role, and hourly rate
4. Optionally upload a profile photo and add certifications
5. Click **Save**

Once added, you can optionally start the onboarding process from the employee's menu (three dots → **Start Onboarding**).`
      },
      {
        title: "Setting Up Locations",
        content: `Locations are the physical areas where shifts take place — e.g., Main Pool, Beach Zone A, Lap Lane.

1. Go to **Locations** in the top nav
2. Click **Add Location**
3. Set the name, type, and minimum guards required
4. Choose a color to distinguish it on the schedule
5. Click **Save**

Locations with **minimum guards required** will trigger understaffing alerts if too few shifts are scheduled.`
      },
    ]
  },
  {
    section: "Scheduling",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    articles: [
      {
        title: "Creating a Shift",
        content: `1. Go to **Schedule**
2. Click any empty cell in the grid (row = location, column = day)
3. Fill in start time, end time, and assign an employee
4. Click **Save**

Alternatively, use **Shift Templates** to quickly apply pre-defined shifts. Conflicts (double-bookings, unavailability) are automatically highlighted in red.`
      },
      {
        title: "Using Shift Templates",
        content: `Shift templates let you define recurring shift patterns.

1. From the Schedule page, click **Templates**
2. Create a template with a name, start/end times, location, and days of the week it applies to
3. Apply templates in bulk to quickly populate a week

Templates save time when your schedule follows a repeating pattern.`
      },
      {
        title: "AI Scheduling Assistant",
        content: `LifeGuard Tracker includes an AI assistant that can suggest shift assignments based on employee availability, certifications, and hours.

1. Click **AI Suggest** on the Schedule page
2. The AI will analyze your team and recommend assignments
3. Review the suggestions and apply them individually or all at once

The AI respects maximum weekly hours and flagged unavailability.`
      },
    ]
  },
  {
    section: "Incident Management",
    color: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700",
    articles: [
      {
        title: "Logging an Incident",
        content: `Incidents include rescues, injuries, near-misses, first aid events, and other notable occurrences.

1. Go to **Enterprise → Compliance → Incident & Rescue Logs**
2. Click **Log Incident**
3. Fill in the incident type, severity, date/time, location, patron details (if applicable), and a description
4. Add the actions taken, witness names, and whether EMS was called
5. Attach photos by clicking **Add Photos** (supports multiple images)
6. Click **Submit**

The incident will appear with status **Open** and can be reviewed and closed by a manager.`
      },
      {
        title: "Photo Attachments on Incidents",
        content: `You can attach photos to any incident report for documentation purposes.

- Tap or click **Add Photos** in the incident log form
- Select one or more image files from your device
- Photos are uploaded securely and attached to the incident record
- Photos are visible in the **Incident Detail** drawer when clicking any logged incident

Photo documentation is especially important for insurance claims, legal proceedings, and internal reviews.`
      },
      {
        title: "Reviewing & Closing Incidents",
        content: `Managers and admins can update the status of incidents as they are reviewed.

1. Go to **Incident & Rescue Logs**
2. Click any incident card to open the detail drawer
3. Click **Mark Reviewed** to change status from Open → Reviewed
4. Once all follow-up actions are complete, click **Close Incident**

Incidents with **Follow-Up Required** will remain visible in the open queue until explicitly closed.`
      },
      {
        title: "Incident Follow-Up Workflow",
        content: `When an incident requires follow-up, LifeGuard Tracker provides a structured 5-step workflow to ensure nothing is missed.

**Follow-Up Steps:**
1. Notify management / facility director
2. Collect witness statements
3. Complete and file official incident report
4. Implement corrective action or preventive measures
5. Debrief staff and document lessons learned

**How to use it:**
1. Open any incident from **Incident & Rescue Logs**
2. Click the **Follow-Up** tab in the detail drawer
3. Check off each step as it is completed
4. Progress is saved automatically and visible to all managers

Incidents with incomplete follow-up steps are flagged with an orange dot on the Follow-Up tab. The workflow is especially important for serious or critical severity incidents.`
      },
      {
        title: "Incident Dashboard",
        content: `The Incident Dashboard gives a bird's-eye view of all safety events across your facility.

- View totals for rescues, incidents, injuries, and near-misses
- Filter by time period, type, severity, and location
- See trend charts to identify patterns
- Export incident data for regulatory reporting

Access it via **Enterprise → Compliance → Incident Management**.`
      },
    ]
  },
  {
    section: "Checklists & Operational Forms",
    color: "bg-orange-50 border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    articles: [
      {
        title: "Creating a Checklist Template",
        content: `Checklists are used for recurring daily, weekly, or per-shift inspections.

1. Go to **Enterprise → Compliance → Checklist Dashboard**
2. Click **New Template**
3. Set the name, type (chemical, equipment, safety, opening, closing), and frequency
4. Add checklist items — each can be a checkbox, number input, or text field
5. For number fields, set acceptable min/max ranges
6. Click **Save**

Once created, staff can submit the checklist from the same page.`
      },
      {
        title: "Submitting a Checklist",
        content: `1. Go to **Enterprise → Compliance → Checklist Dashboard**
2. Find the checklist template and click **Submit Checklist**
3. Fill in all required fields — out-of-range numeric values will be flagged automatically
4. Add any notes
5. Click **Submit**

Submissions are logged with timestamp and staff name. Failed items trigger a warning/fail status on the submission record.`
      },
      {
        title: "Operational Forms Builder",
        content: `Operational Forms are fully customizable forms for vehicle checks, patient assessments, equipment audits, and more.

1. Go to **Enterprise → Operational Forms**
2. Click **New Form**
3. Name the form, select a category, and add fields
4. Field types include: Pass/Fail, Yes/No, Number, Text, and Select (dropdown)
5. Mark fields as required and set **Alert on Fail** for critical items
6. Click **Save**

Staff can then fill out and submit these forms from the same page. Submissions with failures are flagged and logged.`
      },
    ]
  },
  {
    section: "Chemical Logs",
    color: "bg-cyan-50 border-cyan-200",
    badge: "bg-cyan-100 text-cyan-700",
    articles: [
      {
        title: "Logging Chemical Readings",
        content: `Regular chemical testing is required by health departments for all public aquatic facilities.

1. Go to **Enterprise → Operations → Chemical Logs**
2. Click **Add Reading**
3. Select the location, enter pH, chlorine (free and combined), alkalinity, and other readings
4. The system automatically flags readings outside safe ranges
5. Click **Save**

Out-of-range values will generate an alert and can trigger an automated notification email.`
      },
      {
        title: "Chemical Trends & Reporting",
        content: `LifeGuard Tracker tracks chemical readings over time so you can spot patterns and regulatory trends.

- Go to **Reports** and select the **Chemical Trends** report
- Filter by location and date range
- View charts showing pH and chlorine levels over time
- Export data for health department inspections

Maintaining consistent chemical logs protects your facility from regulatory violations and demonstrates due diligence.`
      },
    ]
  },
  {
    section: "Asset Tracking",
    color: "bg-yellow-50 border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
    articles: [
      {
        title: "Adding an Asset",
        content: `Track all your facility equipment — rescue tubes, AEDs, oxygen kits, vehicles, and more.

1. Go to **Enterprise → Operations → Asset Tracking**
2. Click **Add Asset**
3. Fill in the asset name, category, serial number, and current condition
4. Set the location and assign to a staff member or department if applicable
5. Set maintenance intervals and next maintenance due date
6. Click **Save**

Assets that are overdue for maintenance will be highlighted on the asset list.`
      },
      {
        title: "Tracking Maintenance",
        content: `When maintenance is performed on an asset:

1. Open the asset record from the Asset Tracking page
2. Click **Edit**
3. Update the **Last Maintenance Date** — the system will automatically calculate the next due date based on the maintenance interval
4. Update the status and condition if needed
5. Save

Assets with status **Needs Maintenance** or **Out of Service** are highlighted for immediate attention.`
      },
    ]
  },
  {
    section: "Staff Training",
    color: "bg-indigo-50 border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
    articles: [
      {
        title: "Creating a Training Module",
        content: `Training modules allow you to build structured lessons with content, videos, and quizzes.

1. Go to **Enterprise → Operations → Staff Training**
2. Click **New Module**
3. Add a title, description, and category (lifeguarding, first aid, chemical safety, etc.)
4. Write the training content using the text editor (supports markdown formatting)
5. Optionally add a video URL or document link
6. Add quiz questions with multiple-choice answers and mark the correct answer
7. Set the passing score percentage (default 80%)
8. Click **Save**`
      },
      {
        title: "Taking a Training Module",
        content: `Employees can take assigned training modules directly in the app.

1. Go to **Enterprise → Operations → Staff Training**
2. Click **Start Training** on any available module
3. Read through the training content
4. Complete the quiz at the end
5. Submit your answers — the system calculates your score automatically
6. If you pass, your completion is recorded. If you fail, you can retry.

Completion records include the score, date, and pass/fail status.`
      },
      {
        title: "Tracking Staff Completion",
        content: `Managers can see training progress for all staff.

- The **Training Dashboard** shows completion rates per module
- View which employees have completed, are in progress, or haven't started
- Filter by module or employee
- Completion data is visible in employee profiles

Use this to ensure every guard is properly trained before staffing shifts.`
      },
    ]
  },
  {
    section: "Emergency Action Plans",
    color: "bg-rose-50 border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    articles: [
      {
        title: "Creating an Emergency Action Plan",
        content: `Emergency Action Plans (EAPs) document your step-by-step response for every foreseeable emergency at your facility.

1. Go to **Enterprise → Operations → Emergency Action Plans**
2. Click **New EAP**
3. Select the emergency type (drowning, lightning, missing patron, fire, chemical leak, etc.)
4. Add a title, version number, and review dates
5. Build the response steps in order — each step includes a title, description, responsible role, and time target
6. Add emergency contacts and equipment locations
7. Click **Save**

EAPs should be reviewed at least annually and updated whenever procedures change.`
      },
      {
        title: "Using EAPs During an Emergency",
        content: `During an emergency, pull up the relevant EAP for a step-by-step guide.

1. Go to **Emergency Action Plans**
2. Find and click the relevant plan (e.g., "Drowning Response")
3. Use the step-by-step cards to guide your team's response
4. Follow up by logging an incident report after the event is resolved

**Pre-loaded EAPs in your system:**
- Drowning / Submersion Response
- Lightning / Severe Weather Evacuation
- Missing Child / Patron Response`
      },
      {
        title: "Reviewing & Updating EAPs",
        content: `EAPs should be reviewed regularly to ensure accuracy.

- Each EAP shows the **Last Reviewed** date and **Next Review Due** date
- Plans overdue for review are highlighted with a warning badge
- Click **Edit** to update steps, contacts, or procedures
- Increment the version number when making significant changes

Regulatory standards (OSHA, state health departments) typically require annual EAP reviews.`
      },
    ]
  },
  {
    section: "Reports & Analytics",
    color: "bg-violet-50 border-violet-200",
    badge: "bg-violet-100 text-violet-700",
    articles: [
      {
        title: "Available Reports",
        content: `LifeGuard Tracker provides a suite of built-in reports accessible via **Enterprise → Reports → Shift & Pay**:

      - **Shift & Pay** — Employee hours, estimated payroll, daily coverage, and employee pay summaries
      - **Clock Report** — Time clock entries, punctuality, and overtime trends
      - **Chemical Trends** — pH and chlorine readings over time with out-of-range alerts
      - **Location History** — Incident and checklist activity per location
      - **Export PDF** — Generate professional PDF documents with multiple report types for audits and inspections

      All reports can be filtered by date range and location.`
      },
      {
        title: "Exporting Compliance PDFs",
        content: `Professional PDF exports let you create formatted reports for health inspections, insurance audits, and regulatory submissions.

      1. Go to **Enterprise → Reports**
      2. Click the **Export PDF** tab
      3. Select your report type:
      - **Shift & Staffing** — Hours, payroll, and coverage analysis
      - **Compliance** — Incident logs, checklists, and certifications
      - **Certifications** — Staff certification status across all locations
      - **Incidents** — Detailed incident reports with follow-up status
      4. Set your date range and location
      5. Click **Generate PDF**
      6. Download automatically

      PDFs include your facility branding, date ranges, and all data formatted for regulatory bodies.`
      },
    ]
  },
  {
    section: "Multi-Location Dashboard",
    color: "bg-emerald-50 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    articles: [
      {
        title: "Overview: Multi-Location Dashboard",
        content: `The Multi-Location Dashboard is an Enterprise feature that provides a real-time rollup view across all your facilities.

Access it via **Enterprise → Multi-Location Dashboard**.

**What you can see:**
- Status card for each location (Safe / Warning / Critical)
- Total active staff across all locations today
- Open incidents across all locations
- Unresolved alerts
- Incident count chart by location
- Quick links to dive into any individual location

This is especially useful for regional managers overseeing multiple pools, beach zones, or recreation centers.`
      },
      {
        title: "Location Status Levels",
        content: `Each location is assigned a real-time status based on active alerts and open incidents:

- 🟢 **Safe** — No unresolved alerts or open incidents
- 🟡 **Warning** — One or more warning-level alerts or open incidents
- 🔴 **Critical** — One or more critical alerts or serious/critical open incidents

Click any location card to jump directly to that facility's data.`
      },
    ]
  },
  {
    section: "Time Off",
    color: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    articles: [
      {
        title: "Submitting a Time Off Request",
        content: `1. Go to **More → Time Off**
2. Click **New Request**
3. Select the employee, date range, and reason
4. Optionally mark as partial day or recurring
5. Submit — the request will appear as **Pending**

Admins and managers will see a notification in the Time Off section and can approve or deny.`
      },
      {
        title: "Approving or Denying Requests",
        content: `Pending requests appear at the top of the Time Off page.

- Click the **✓** (check) icon to approve
- Click the **✗** (X) icon to deny

Once approved, the time off will automatically appear on the **Calendar View** and the employee's availability will be blocked in the scheduling module.`
      },
    ]
  },
  {
    section: "Onboarding",
    color: "bg-purple-50 border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    articles: [
      {
        title: "Starting Onboarding for a New Hire",
        content: `1. Go to **Employees**
2. Find the employee and click the **⋮** menu
3. Select **Start Onboarding**
4. Choose which default tasks to include and add any custom tasks
5. Set a start date and target completion duration
6. Click **Start Onboarding**

The onboarding checklist will be created and visible in **Enterprise → Employee Hub → Onboarding**.`
      },
      {
        title: "Tracking Onboarding Progress",
        content: `From **Onboarding**, you can see all active, paused, and completed onboardings.

Click any onboarding card to open the checklist. Admins and managers can mark tasks as complete. The progress bar updates automatically.

If tasks have due dates, overdue tasks will be flagged in red.`
      },
    ]
  },
  {
    section: "Certifications",
    color: "bg-teal-50 border-teal-200",
    badge: "bg-teal-100 text-teal-700",
    articles: [
      {
        title: "Uploading Your Certification",
        content: `Employees can upload their own certifications directly in LifeGuard Tracker.

1. Go to **Enterprise → Operations → Certifications**
2. Click **Upload Certification**
3. Select the certification type (CPR, Lifeguard, First Aid, etc.) or enter a custom name
4. Enter the issuing organization, issue date, and expiry date
5. Upload the certificate file (PDF or image)
6. Click **Submit for Review**

Your certification will appear as **Pending Review** until a manager approves it.`
      },
      {
        title: "Expiry Notifications",
        content: `LifeGuard Tracker automatically sends email reminders for expiring certifications.

- **30-day warning**: Sent to the employee and all managers
- **7-day urgent warning**: Sent to the employee

The system runs this check daily and automatically marks certifications as **Expired** once their date passes.

You can view all expiring certs on the **Expiring** tab in the Certifications page.`
      },
    ]
  },
  {
    section: "Alerts & Notifications",
    color: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700",
    articles: [
      {
        title: "Running an Alert Scan",
        content: `LifeGuard Tracker can automatically detect issues across your facility.

1. Go to **Enterprise → Alerts**
2. Click **Run Scan**
3. The system checks for: understaffing, shift conflicts, certification expiries, out-of-range chemical readings, overdue asset maintenance, and more

Alert types:
- 🔴 **Critical** – Immediate action required (e.g., location uncovered, active incident)
- 🟡 **Warning** – Potential issue (e.g., cert expiring in 30 days)
- 🔵 **Info** – Informational notices`
      },
      {
        title: "AI Understaffing Predictor",
        content: `The AI Understaffing Predictor proactively scans your upcoming schedule and flags potential staffing gaps before they become a problem.

**Access it via:** Enterprise → Staffing Forecast

**How it works:**
1. Click **Run Prediction** on the Staffing Forecast page
2. The AI analyzes the next 14 days of scheduled shifts against your location minimums, approved time-off, and available certified staff
3. It identifies gaps and scores them as Critical, High, or Medium risk
4. Each gap shows the specific date, location, and recommended action

**What it checks:**
- Locations with fewer shifts than the required minimum guards
- Days where approved time-off leaves a location short-staffed
- Upcoming shifts assigned to employees with expiring certifications

Use the Staffing Forecast proactively every week to prevent uncovered shifts and compliance violations.`
      },
      {
        title: "Setting Up Automated Alerts",
        content: `Automated daily scans can be configured in **Enterprise → Settings**.

You can control:
- Which alert types to check
- Days ahead to check for cert expiries
- Whether to send email/SMS notifications for critical alerts
- Alert email recipients

Alerts are only visible to admin-level users.`
      },
    ]
  },
  {
    section: "Certification Compliance",
    color: "bg-teal-50 border-teal-200",
    badge: "bg-teal-100 text-teal-700",
    articles: [
      {
        title: "Certification Compliance Dashboard",
        content: `The Cert Compliance Dashboard aggregates certification status across all your locations and staff in one view.

**Access it via:** Enterprise → Compliance → Cert Compliance

**What you'll see:**
- Overall compliance score (% of staff with all valid certs)
- Per-location compliance breakdown with color-coded status
- Cert-type breakdown chart (CPR, Lifeguard, First Aid, etc.)
- Full searchable list of all certifications with expiry status

**Status colors:**
- 🟢 **Valid** — Certification is current
- 🟡 **Expiring Soon** — Expires within 30 days
- 🔴 **Expired** — Certification has lapsed

**Using the dashboard:**
- Filter by location, certification type, or status
- Search by employee name or cert name
- Use the per-location cards to quickly identify which facilities are below compliance thresholds
- Export the view to PDF for regulatory inspections`
      },
    ]
  },
  {
    section: "Payroll Integrations",
    color: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    articles: [
      {
        title: "Connecting a Payroll Provider",
        content: `LifeGuard Tracker integrates with leading payroll systems to automatically sync employee hours and payment data.

  **Supported Providers:**
  - Gusto (modern payroll for small business)
  - ADP (enterprise workforce management)
  - Paychex (payroll & HR solutions)
  - BambooHR (human resources software)
  - Rippling (all-in-one HR, IT, and Finance)
  - Workday (enterprise HCM & finance)

  **How to connect:**
  1. Go to **Enterprise → Payroll Integrations**
  2. Find your payroll provider card and click **Connect**
  3. Enter your API credentials (found in your provider's Developer or Settings section)
  4. Click **Connect** — credentials are encrypted and securely stored
  5. The integration will show **Connected** with a green indicator

  Once connected, your scheduled shifts and hours automatically sync to your payroll provider.`
      },
      {
        title: "Managing Payroll Integrations",
        content: `After connecting, you can manage your payroll integrations directly in the app.

  **Available actions:**
  - **Sync Now** — Immediately push updated hours and employee data to your payroll provider
  - **Auto-Sync** — Toggle automatic syncing (enabled by default)
  - **Disconnect** — Safely remove the connection without affecting your payroll provider

  **Last synced timestamp:**
  Each integration shows when data was last successfully synced. Check this before running payroll in your external system to ensure all hours are up-to-date.

  **Troubleshooting:**
  If an integration shows **Error**, check:
  - API credentials are correct and not expired
  - Your payroll provider account is still active
  - API permissions are still granted in your provider's settings`
      },
    ]
  },
  {
    section: "Support",
    color: "bg-slate-50 border-slate-200",
    badge: "bg-slate-100 text-slate-700",
    articles: [
      {
        title: "Getting Help & Support",
        content: `LifeGuard Tracker offers multiple ways to get help:

      **In-App Support:**
      - Click **Contact Support** in the help menu to send a message to our team
      - Browse **Documentation** (this page) for step-by-step guides and best practices

      **Email Support:**
      - Reach us at support@lifeguardtracker.app
      - Response time: within 1 business day (Standard)
      - Same-day response (Pro & Enterprise)

      **Priority Support (Enterprise):**
      - Dedicated account manager
      - Priority phone support during business hours
      - Custom onboarding, training, and implementation assistance
      - Proactive compliance audits and optimization recommendations`
      },
      {
        title: "Frequently Asked Questions",
        content: `**How do I reset an employee's password?**
The employee can use the "Forgot Password" link on the login page to reset their own password.

**Can employees access LifeGuard Tracker on mobile?**
Yes! LifeGuard Tracker is fully responsive. Native mobile views are available for Schedules, Employees, Time Off, Locations, and Certifications.

**What happens when a certification expires?**
The certification is automatically marked as Expired, and both the employee and managers receive email reminders 30 and 7 days before expiry.

**How do I export data for a health department inspection?**
Go to **Enterprise → Reports** and use the **Document Generator** to export compliance PDFs. Chemical logs, incident logs, and checklist submissions can all be exported.

**Can I attach photos to incident reports?**
Yes — the incident log form includes a photo upload button. Multiple photos can be attached per incident.

**What Emergency Action Plans come pre-loaded?**
Three real-world EAPs are pre-loaded: Drowning/Submersion Response, Lightning/Severe Weather Evacuation, and Missing Child/Patron Response. You can edit these or add your own.

**How are shift conflicts detected?**
The system automatically flags when an employee is scheduled for overlapping shifts or is scheduled during approved time off.

**What payroll systems does LifeGuard Tracker integrate with?**
LifeGuard Tracker integrates with Gusto, ADP, Paychex, BambooHR, Rippling, and Workday. Manage all connections from **Enterprise → Payroll Integrations** where you can securely store API credentials, monitor sync status, and trigger manual syncs.

**What is the Staffing Forecast / Understaffing Predictor?**
It's an AI-powered tool under Enterprise → Staffing Forecast that scans the next 14 days of your schedule and flags dates/locations where you may be understaffed before it becomes a problem.

**How does the Incident Follow-Up Workflow work?**
When an incident is logged, open it from Incident & Rescue Logs and click the Follow-Up tab. A 5-step checklist guides you through notifying management, collecting statements, filing reports, implementing corrective actions, and debriefing staff.

**Where can I see certification compliance across all my locations?**
Go to Enterprise → Compliance → Cert Compliance for an aggregated view of all staff certifications, compliance scores per location, and color-coded expiry status.`
      },
    ]
  },
];

export default function Docs() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const allArticles = docs.flatMap(s => s.articles.map(a => ({ ...a, section: s.section, badge: s.badge })));
  const filtered = search
    ? allArticles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()))
    : null;

  if (selected) {
    const section = docs.find(s => s.articles.some(a => a.title === selected.title));
    return (
      <div className="max-w-3xl mx-auto px-6 py-14 space-y-6">
        <button onClick={() => setSelected(null)} className="text-sm text-[#1a9c5b] hover:underline">← Back to Docs</button>
        <div className="flex items-center gap-3">
          <Badge className={section?.badge || "bg-gray-100 text-gray-700"}>{selected.section || section?.section}</Badge>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{selected.title}</h1>
        <div className="prose prose-gray max-w-none">
          {selected.content.split('\n').map((line, i) => {
            if (!line.trim()) return <br key={i} />;
            // Bold markdown
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
              <p key={i} className="text-gray-700 leading-relaxed">
                {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
              </p>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14 space-y-10">
      <div>
        <Link to={createPageUrl("Dashboard")} className="text-sm text-[#1a9c5b] hover:underline">← Back to Dashboard</Link>
        <h1 className="text-4xl font-bold text-gray-900 mt-4">Documentation</h1>
        <p className="text-gray-500 mt-2">Everything you need to know about using LifeGuard Tracker</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search docs..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered ? (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No results found.</p>
          ) : filtered.map((article, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(article)}>
              <CardContent className="pt-5 pb-5 flex items-center justify-between">
                <div>
                  <Badge className={`${article.badge} mb-1`}>{article.section}</Badge>
                  <p className="font-medium text-gray-900">{article.title}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {docs.map((section, i) => (
            <div key={i}>
              <div className={`flex items-center gap-2 mb-4`}>
                <h2 className="text-xl font-bold text-gray-900">{section.section}</h2>
                <Badge className={section.badge}>{section.articles.length} articles</Badge>
              </div>
              <div className={`border rounded-xl overflow-hidden ${section.color}`}>
                {section.articles.map((article, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/60 transition-colors border-b last:border-b-0 border-white/50"
                    onClick={() => setSelected({ ...article, section: section.section, badge: section.badge })}
                  >
                    <p className="font-medium text-gray-900">{article.title}</p>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}