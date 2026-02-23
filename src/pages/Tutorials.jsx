import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Search, BookOpen, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

const tutorials = [
  {
    category: "Getting Started",
    badge: "bg-green-100 text-green-700",
    videos: [
      {
        title: "LifeGuard Tracker Overview & Setup",
        description: "A complete walkthrough — from creating your first location and employee to publishing your first schedule and enabling automations.",
        duration: "8 min",
        thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Setting Up Locations & Geofences",
        description: "Create pool zones, beach areas, and other locations — including GPS coordinates and geofence radius for clock-in verification.",
        duration: "4 min",
        thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Adding & Managing Employees",
        description: "How to add employees, assign roles, upload certifications, set emergency contacts, and configure availability.",
        duration: "5 min",
        thumbnail: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Inviting Your Team & Setting Roles",
        description: "How to send email invites, assign roles (lifeguard, supervisor, manager), and control access levels.",
        duration: "3 min",
        thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ]
  },
  {
    category: "Scheduling",
    badge: "bg-blue-100 text-blue-700",
    videos: [
      {
        title: "Building Your First Weekly Schedule",
        description: "Step-by-step guide to creating shifts, assigning employees, using color-coded blocks, and handling coverage conflicts.",
        duration: "7 min",
        thumbnail: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Using the AI Scheduling Assistant",
        description: "Let the AI suggest optimal shift assignments based on team availability, certifications, and preferences — then publish in one click.",
        duration: "5 min",
        thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Shift Templates & Recurring Shifts",
        description: "Save reusable shift configurations as templates and set up recurring weekly patterns to save hours of scheduling work.",
        duration: "4 min",
        thumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Workforce Scheduler (Enterprise)",
        description: "Manage shifts across all locations simultaneously with the drag-and-drop multi-location workforce scheduler.",
        duration: "6 min",
        thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ]
  },
  {
    category: "Time Off & Shift Swaps",
    badge: "bg-amber-100 text-amber-700",
    videos: [
      {
        title: "Managing Time Off Requests",
        description: "Submit, review, approve, and deny time off requests — plus the calendar and team availability views.",
        duration: "4 min",
        thumbnail: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Shift Swap Workflow",
        description: "How employees request swaps, how other employees respond, and how managers approve or deny swaps.",
        duration: "3 min",
        thumbnail: "https://images.unsplash.com/photo-1471967183320-ee018f6e114a?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Employee Shift Preferences",
        description: "Set preferred days, locations, max consecutive shifts, and blackout dates so the AI planner respects employee preferences.",
        duration: "3 min",
        thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ]
  },
  {
    category: "Compliance & Safety",
    badge: "bg-red-100 text-red-700",
    videos: [
      {
        title: "Logging Incidents & Rescues",
        description: "How to log any incident type — from minor first-aid to full rescues — including photos, digital signatures, and follow-up workflow.",
        duration: "5 min",
        thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Pool Water Chemistry Testing",
        description: "Log chlorine, pH, alkalinity, temperature, and other parameters — with automatic MAHC compliance checking and out-of-range alerts.",
        duration: "4 min",
        thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Certification Tracking & Alerts",
        description: "How to track lifeguard certifications, set up automated expiry alerts, and view team-wide cert compliance.",
        duration: "4 min",
        thumbnail: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Running Compliance Assessments",
        description: "Complete digital self-assessments, convert findings into gap tasks, and track improvements over time.",
        duration: "6 min",
        thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ]
  },
  {
    category: "GPS & Location",
    badge: "bg-teal-100 text-teal-700",
    videos: [
      {
        title: "Real-Time Guard Location Tracking",
        description: "Enable GPS tracking for guards, view the live map, and use the coverage heatmap to spot patrol gaps instantly.",
        duration: "5 min",
        thumbnail: "https://images.unsplash.com/photo-1508921340878-ba53e1f016ec?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "GPS Clock-In & Geofence Verification",
        description: "Set up geofenced clock-in so guards must be physically at their assigned location to clock in successfully.",
        duration: "3 min",
        thumbnail: "https://images.unsplash.com/photo-1527004013197-933b977e5b4e?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ]
  },
  {
    category: "Reports & Analytics",
    badge: "bg-indigo-100 text-indigo-700",
    videos: [
      {
        title: "Safety Metrics Dashboard",
        description: "Use the safety dashboard to view incident trends, patron counts, severity breakdowns, and EMS activity over any date range.",
        duration: "4 min",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Running Reports & Exporting Data",
        description: "Generate weekly summaries, staff performance reports, pool test reports, and asset performance — export to PDF or CSV.",
        duration: "5 min",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Staffing Forecast & AI Predictions",
        description: "How the 7-day staffing forecast works, how to interpret risk levels, and how to act on understaffing predictions.",
        duration: "4 min",
        thumbnail: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ]
  },
  {
    category: "Onboarding & Training",
    badge: "bg-purple-100 text-purple-700",
    videos: [
      {
        title: "Running the Employee Onboarding Workflow",
        description: "Start onboarding for a new hire, view auto-generated role-based tasks, and track progress through to completion.",
        duration: "5 min",
        thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Training Modules & Completion Tracking",
        description: "Assign training modules to employees, track completions, and review staff training history.",
        duration: "4 min",
        thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Performance Reviews (Enterprise)",
        description: "Create AI-assisted performance reviews: skill ratings, AI-generated summaries, and linking reviews to employee profiles.",
        duration: "5 min",
        thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ]
  },
  {
    category: "Automations & AI",
    badge: "bg-yellow-100 text-yellow-700",
    videos: [
      {
        title: "Setting Up Scheduled Automations",
        description: "Configure the key scheduled functions (cert expiry alerts, weather monitoring, staffing forecast, badge awards) in Admin Setup.",
        duration: "5 min",
        thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Workflow Automation Engine",
        description: "Build multi-step automated workflows triggered by document uploads, certification expiries, or incidents.",
        duration: "6 min",
        thumbnail: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ]
  },
];

export default function Tutorials() {
  const [search, setSearch] = useState("");

  const allVideos = tutorials.flatMap(s => s.videos.map(v => ({ ...v, category: s.category, badge: s.badge })));
  const displaySections = search
    ? [{ category: "Search Results", badge: "bg-gray-100 text-gray-700", videos: allVideos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()) || v.description.toLowerCase().includes(search.toLowerCase())) }]
    : tutorials;

  const totalVideos = allVideos.length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-14 space-y-10">
      <div>
        <Link to={createPageUrl("Dashboard")} className="text-sm text-[#1a9c5b] hover:underline">← Back to Dashboard</Link>
        <h1 className="text-4xl font-bold text-gray-900 mt-4">Video Tutorials</h1>
        <p className="text-gray-500 mt-2">{totalVideos} videos to help you get the most out of LifeGuard Tracker</p>
      </div>

      <div className="flex gap-3">
        <Link to={createPageUrl("Docs")} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#1a9c5b] hover:bg-[#f0faf5] transition-colors">
          <BookOpen className="w-4 h-4 text-[#1a9c5b]" /> Full Documentation
        </Link>
        <Link to={createPageUrl("Contact")} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#1a9c5b] hover:bg-[#f0faf5] transition-colors">
          Contact Support <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search tutorials..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-10">
        {displaySections.map((section, i) => (
          section.videos.length > 0 && (
            <div key={i}>
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-xl font-bold text-gray-900">{section.category}</h2>
                <Badge className={section.badge}>{section.videos.length} video{section.videos.length !== 1 ? "s" : ""}</Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {section.videos.map((video, j) => (
                  <a key={j} href={video.url} target="_blank" rel="noopener noreferrer" className="block group">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-40 object-cover group-hover:brightness-90 transition-all"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-[#1a9c5b] transition-colors">
                            <Play className="w-5 h-5 text-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {video.duration}
                        </div>
                        {search && video.category && (
                          <div className="absolute top-2 left-2">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${video.badge}`}>{video.category}</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-4">
                        <p className="font-semibold text-gray-900 group-hover:text-[#1a9c5b] transition-colors">{video.title}</p>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{video.description}</p>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}