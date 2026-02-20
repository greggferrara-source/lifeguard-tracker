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
        icon: null,
        content: `LifeGuard Tracker is an all-in-one workforce management platform built for aquatic facilities, pools, beaches, and waterparks.

**What you can do with LifeGuard Tracker:**
- Build and manage weekly schedules for your lifeguards and staff
- Track employee certifications and get expiry alerts
- Manage time-off requests with an approval workflow
- Run reports to understand coverage, hours, and costs
- Onboard new hires with structured checklists
- Send automated notifications for shift reminders and alerts

**Who uses LifeGuard Tracker:**
- **Admins** have full access to all features including payroll, reports, and settings
- **Managers** can create and manage schedules, approve time off, and handle onboarding
- **Employees** can view their schedule, submit time-off requests, and request shift swaps`
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
    icon: CalendarDays,
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
    section: "Time Off",
    color: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    icon: Clock,
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
      {
        title: "Calendar View",
        content: `The Calendar View shows all approved time off for the month at a glance.

1. Go to **Time Off**
2. Click **Calendar View**
3. Use the Previous/Next buttons to navigate months

Full-day absences appear in blue, partial days in yellow.`
      },
    ]
  },
  {
    section: "Onboarding",
    color: "bg-purple-50 border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    icon: CheckSquare,
    articles: [
      {
        title: "Starting Onboarding for a New Hire",
        content: `1. Go to **Employees**
2. Find the employee and click the **⋮** menu
3. Select **Start Onboarding**
4. Choose which default tasks to include and add any custom tasks
5. Set a start date and target completion duration
6. Click **Start Onboarding**

The onboarding checklist will be created and visible in **More → Onboarding**.`
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
    section: "Alerts & Notifications",
    color: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700",
    icon: AlertTriangle,
    articles: [
      {
        title: "Running an Alert Scan",
        content: `LifeGuard Tracker can automatically detect scheduling issues.

1. Go to **More → Alerts**
2. Click **Run Scan**
3. The system checks for: understaffing, shift conflicts, certification expiries

Alert types:
- 🔴 **Critical** – Immediate action required (e.g., location uncovered)
- 🟡 **Warning** – Potential issue (e.g., cert expiring soon)
- 🔵 **Info** – Informational notices`
      },
      {
        title: "Setting Up Automated Alerts",
        content: `Automated daily scans can be configured in **More → Settings**.

You can control:
- Which alert types to check
- The number of days ahead to check for cert expiries
- Whether to send email/SMS notifications for critical alerts

Alerts are only visible to Admin users.`
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

1. Go to **More → Certifications**
2. Click **Upload Certification**
3. Select the certification type (CPR, Lifeguard, First Aid, etc.) or enter a custom name
4. Enter the issuing organization, issue date, and expiry date
5. Upload the certificate file (PDF or image)
6. Click **Submit for Review**

Your certification will appear as **Pending Review** until a manager approves it.`
      },
      {
        title: "Manager: Reviewing Certifications",
        content: `Managers and admins can review and approve employee certifications.

1. Go to **More → Certifications**
2. Click the **Pending** tab to see all submissions awaiting review
3. Click **Review** on any certification
4. Optionally click **View Certificate File** to inspect the uploaded document
5. Add notes if needed, then click **Approve** or **Reject**

Employees will see their certification status updated immediately.`
      },
      {
        title: "Expiry Notifications",
        content: `LifeGuard Tracker automatically sends email reminders for expiring certifications.

- **30-day warning**: Sent to the employee and all managers
- **7-day urgent warning**: Sent to the employee

You can also see all expiring certs at a glance on the **Expiring** tab in the Certifications page.

The system runs this check daily at 8am and automatically marks certifications as **Expired** once their date passes.`
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
- Go to **More → Contact Support** to send a message to our team
- Browse **More → Documentation** (this page) for step-by-step guides
- Watch **More → Video Tutorials** for visual walkthroughs

**Email Support:**
- Reach us at support@shiftguard.app
- Response time: within 1 business day

**Priority Support (Enterprise):**
- Dedicated account manager
- Phone support during business hours
- Custom onboarding assistance`
      },
      {
        title: "Frequently Asked Questions",
        content: `**How do I reset an employee's password?**
LifeGuard Tracker uses your organization's login system. Contact your IT admin or the employee can use the "Forgot Password" link on the login page.

**Can employees access LifeGuard Tracker on mobile?**
Yes! LifeGuard Tracker is fully responsive and works on any smartphone or tablet browser.

**What happens when a certification expires?**
The certification is automatically marked as Expired, the employee loses their "certified" status for scheduling purposes, and both the employee and managers receive email reminders before it expires.

**How do I export schedule data?**
Go to **Reports** and use the **Document Generator** to export shift reports as PDF.

**Can I set up recurring shifts?**
Yes — when creating a shift on the Schedule page, you can set it as recurring (daily, weekly, etc.) with an end date.

**How are shift conflicts detected?**
The system automatically flags when an employee is scheduled for overlapping shifts, or is scheduled during approved time off.`
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