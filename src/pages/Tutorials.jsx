import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const tutorials = [
  {
    category: "Getting Started",
    badge: "bg-green-100 text-green-700",
    videos: [
      {
        title: "ShiftGuard Overview & Setup",
        description: "A complete walkthrough of ShiftGuard — from adding your first employee to publishing your first schedule.",
        duration: "8 min",
        thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Setting Up Locations",
        description: "Learn how to create and configure pool zones, beach areas, and other locations for scheduling.",
        duration: "3 min",
        thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Adding & Managing Employees",
        description: "How to add employees, set roles, upload certifications, and configure availability.",
        duration: "5 min",
        thumbnail: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=600&q=80",
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
        description: "A step-by-step guide to creating shifts, assigning employees, and handling conflicts.",
        duration: "7 min",
        thumbnail: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Using the AI Scheduling Assistant",
        description: "Let the AI suggest optimal shift assignments based on your team's availability and certifications.",
        duration: "4 min",
        thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Shift Templates & Recurring Shifts",
        description: "Save time with reusable shift templates and set up recurring weekly patterns.",
        duration: "5 min",
        thumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ]
  },
  {
    category: "Time Off & Availability",
    badge: "bg-amber-100 text-amber-700",
    videos: [
      {
        title: "Managing Time Off Requests",
        description: "How to submit, review, approve, and deny time off requests — plus the calendar view.",
        duration: "4 min",
        thumbnail: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Employee Availability Settings",
        description: "Set preferred days, hours, and block out unavailable periods for each employee.",
        duration: "3 min",
        thumbnail: "https://images.unsplash.com/photo-1471967183320-ee018f6e114a?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ]
  },
  {
    category: "Alerts & Reports",
    badge: "bg-red-100 text-red-700",
    videos: [
      {
        title: "Understanding & Resolving Alerts",
        description: "How alerts work, what each type means, and how to resolve understaffing and conflicts.",
        duration: "5 min",
        thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Running Reports & Exporting Data",
        description: "Generate weekly reports, view hours summaries, and export data to PDF or CSV.",
        duration: "4 min",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ]
  },
  {
    category: "Onboarding",
    badge: "bg-purple-100 text-purple-700",
    videos: [
      {
        title: "Running the Onboarding Workflow",
        description: "Start onboarding for a new hire, assign checklist tasks, and track progress to completion.",
        duration: "5 min",
        thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
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
        <p className="text-gray-500 mt-2">{totalVideos} videos to help you get the most out of ShiftGuard</p>
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