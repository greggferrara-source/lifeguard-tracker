import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MapPin,
  Clock,
  Menu,
  X,
  Shield,
  AlertTriangle,
  ArrowLeftRight,
  BarChart2,
  MessageSquare,
  Settings,
  HelpCircle,
  BookOpen,
  Mail,
  FileText,
  Play,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const primaryNavItems = [
  { name: "Schedule", icon: CalendarDays, page: "Schedule" },
  { name: "Employees", icon: Users, page: "Employees" },
  { name: "Locations", icon: MapPin, page: "Locations" },
];

const moreNavItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Onboarding", icon: Users, page: "EmployeeOnboarding" },
  { name: "Time Off", icon: Clock, page: "TimeOff" },
  { name: "My Availability", icon: Clock, page: "MyAvailability" },
  { name: "Shift Swaps", icon: ArrowLeftRight, page: "ShiftSwaps", badge: "swaps" },
  { name: "Alerts", icon: AlertTriangle, page: "Alerts", badge: "alerts" },
  { name: "Reports", icon: BarChart2, page: "Reports" },
  { name: "Notifications", icon: MessageSquare, page: "Notifications" },
  { name: "Settings", icon: Settings, page: "Settings" },
];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.list("-created_date", 100),
    refetchInterval: 60000,
  });
  const { data: swapRequests = [] } = useQuery({
    queryKey: ["shift-swaps"],
    queryFn: () => base44.entities.ShiftSwapRequest.list("-created_date", 100),
    refetchInterval: 60000,
  });
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;
  const pendingSwaps = swapRequests.filter(s => s.status === "pending_employee" || s.status === "pending_manager").length;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        :root {
          --accent: #1a9c5b;
          --accent-hover: #158a4e;
          --accent-light: #f0faf5;
        }
      `}</style>

      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-[#1a9c5b] flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">ShiftGuard</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {primaryNavItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#1a9c5b] bg-[#f0faf5]"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}

              {/* More Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900 gap-1 text-sm font-medium px-4 py-2.5">
                    <MoreVertical className="w-4 h-4" />
                    More
                    {(unresolvedAlerts > 0 || pendingSwaps > 0) && (
                      <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unresolvedAlerts + pendingSwaps > 9 ? "9+" : unresolvedAlerts + pendingSwaps}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {moreNavItems.map((item) => (
                    <DropdownMenuItem key={item.page} asChild>
                      <Link to={createPageUrl(item.page)} className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                        {item.badge === "alerts" && unresolvedAlerts > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-1.5">{unresolvedAlerts}</span>
                        )}
                        {item.badge === "swaps" && pendingSwaps > 0 && (
                          <span className="ml-auto bg-orange-500 text-white text-xs font-bold rounded-full px-1.5">{pendingSwaps}</span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-500">Help & Info</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <a href="https://docs.shiftguard.local" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Documentation</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="https://shiftguard.local/contact" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>Contact Support</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-700"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-2">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#1a9c5b] bg-[#f0faf5]"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                  {item.badge === "alerts" && unresolvedAlerts > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2">{unresolvedAlerts}</span>
                  )}
                  {item.badge === "swaps" && pendingSwaps > 0 && (
                    <span className="ml-auto bg-orange-500 text-white text-xs font-bold rounded-full px-2">{pendingSwaps}</span>
                  )}
                </Link>
              );
            })}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-4">Help & Info</DropdownMenuLabel>
              <a href="https://docs.shiftguard.local" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <BookOpen className="w-4 h-4" />
                Documentation
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <Play className="w-4 h-4" />
                Video Tutorials
              </a>
              <a href="https://shiftguard.local/contact" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4" />
                Contact Support
              </a>
              <a href="https://shiftguard.local/terms" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4" />
                Terms of Service
              </a>
              <a href="https://shiftguard.local/privacy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4" />
                Privacy Policy
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="bg-white">
        {children}
      </main>
    </div>
  );
}