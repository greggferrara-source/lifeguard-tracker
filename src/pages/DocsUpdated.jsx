import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";

const sections = [
  {
    title: "Comprehensive Onboarding System",
    content: "Automate employee onboarding with customizable task flows. Start onboarding for new hires, assign profile completion, role setup, training modules, and equipment access. Track progress with visual indicators. Access via Admin → Onboarding Dashboard. Create custom checklist and report templates to match facility workflows."
  },
  {
    title: "Shift Preferences Engine",
    content: "Employees can set preferred days, times, locations, max consecutive shifts, and blackout dates. Access via Team dropdown → Shift Preferences. Improves scheduling satisfaction and efficiency."
  },
  {
    title: "Incident Trend Reports",
    content: "Visual analytics showing incident types, severity breakdown, and hourly hotspots. Access via Reports & Admin → Incident Trends. Helps prevent incidents at peak times."
  },
  {
    title: "Weather Alert System",
    content: "Real-time monitoring for lightning, extreme heat, cold, and high wind. Uses Open-Meteo API (free). Recommends pool closure or operations reduction. Configure checkWeatherAlerts to run every 30 min."
  },
  {
    title: "Staffing Forecast Dashboard",
    content: "7-day predictions of staffing needs vs. scheduled staff. Identifies high/medium risk days. Run generateStaffingForecast daily at 6 AM. Access via Reports & Admin → Staffing Forecast."
  },
  {
    title: "Employee Performance Dashboard",
    content: "Tracks ratings, attendance, hours, incidents, response times, certifications. Sortable by rating/hours/attendance. Access via Analytics & Team → Employee Performance. Run updateEmployeePerformance daily."
  },
  {
    title: "Employee Badges & Gamification",
    content: "Auto-awards badges for achievements: Perfect Attendance, Incident Responder, Safety Hero, 500 Hour Commitment, Rapid Responder, Mentor, Lifesaver, etc. Motivates staff and recognizes excellence."
  },
  {
    title: "Patron Profile Management",
    content: "Track guest swimming ability, age group, medical conditions, emergency contacts, incident history, visit frequency, and auto-calculated risk levels. Access via Analytics & Team → Patron Management."
  },
  {
    title: "New Entities",
    content: "ShiftPreference, IncidentTrend, WeatherAlert, StaffingForecast, EmployeePerformance, EmployeeBadge, PatronProfile. All integrated with existing Employee, Location, Shift, and IncidentLog entities."
  }
];

export default function DocsUpdated() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold">LifeGuard Tracker - Feature Updates</h1>
      <p className="text-lg text-gray-600">Complete feature suite v2.0 deployed with 10 new capabilities</p>

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
          <CardTitle>Quick Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Scheduled Automations:</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• checkWeatherAlerts - Every 30 minutes</li>
            <li>• generateStaffingForecast - Daily 6 AM</li>
            <li>• updateEmployeePerformance - Daily 7 AM</li>
            <li>• awardBadges - Daily 8 AM</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-300">
        <CardHeader>
          <CardTitle>Access New Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Team Menu:</strong> Shift Preferences</p>
          <p><strong>Reports & Admin:</strong> Incident Trends, Staffing Forecast, Weather Alerts</p>
          <p><strong>Analytics & Team (NEW):</strong> Employee Performance, Patron Management</p>
        </CardContent>
      </Card>
    </div>
  );
}