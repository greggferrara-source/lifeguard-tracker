import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import MobileLayout from "@/components/MobileLayout";
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
  MoreVertical,
  Zap,
  CreditCard,
  Eye,
  FileText,
  LogOut } from
"lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import FeedbackWidget from "@/components/FeedbackWidget";

// Role hierarchy:
// enterprise_site_owner → full access + Enterprise menu
// site_owner            → full access + Enterprise menu
// admin                 → management tools + Enterprise menu (no billing/settings/setup/error logs)
// user                  → basic nav only (schedule, employees, locations, time off, messages)

const ENTERPRISE_MENU_ROLES = ["enterprise_site_owner", "site_owner", "admin"];
const OWNER_ONLY_ROLES = ["enterprise_site_owner", "site_owner"];
const PRO_AND_ABOVE_ROLES = ["enterprise_site_owner", "site_owner", "admin"];

// Shown to ALL roles in the top nav
const primaryNavItems = [
  { name: "Schedule", icon: CalendarDays, page: "Schedule" },
  { name: "Employees", icon: Users, page: "Employees" },
  { name: "Locations", icon: MapPin, page: "Locations" },
];

// Shown to ALL roles in the "More" dropdown
const moreNavItems = [
  { name: "Time Off", icon: Clock, page: "TimeOff" },
  { name: "Shift Swaps", icon: ArrowLeftRight, page: "ShiftSwaps", badge: "swaps" },
  { name: "Messages", icon: MessageSquare, page: "Messages" },
];

// Enterprise menu items — admin/site_owner/enterprise_site_owner only
// items with `ownerOnly: true` are hidden from plain admin
const enterpriseNavItems = [
  {
    name: "Compliance",
    icon: Shield,
    page: "ComplianceDashboard",
    submenu: [
      { name: "Compliance Dashboard", icon: Shield, page: "ComplianceDashboard" },
      { name: "Public Safety Dashboard", icon: Eye, page: "PublicSafetyDashboard" },
      { name: "Checklist Dashboard", icon: BarChart2, page: "ChecklistDashboard" },
      { name: "Incident Management", icon: AlertTriangle, page: "IncidentDashboard" },
      { name: "Incident & Rescue Logs", icon: AlertTriangle, page: "IncidentLogs" },
    ],
  },
  {
    name: "Operations",
    icon: BarChart2,
    page: "Assignments",
    submenu: [
      { name: "Assignments", icon: BarChart2, page: "Assignments" },
      { name: "Asset Tracking", icon: BarChart2, page: "Assets" },
      { name: "Patron Counts", icon: Users, page: "PatronCounts" },
      { name: "Certifications", icon: Shield, page: "Certifications", proOnly: true },
      { name: "Chemical Logs", icon: BarChart2, page: "ChemicalLogs", proOnly: true },
      { name: "Inspections", icon: BarChart2, page: "Inspections", proOnly: true },
      { name: "Maintenance Reports", icon: BarChart2, page: "MaintenanceReports", proOnly: true },
    ],
  },
  {
    name: "Communications",
    icon: MessageSquare,
    page: "Announcements",
    submenu: [
      { name: "Announcements", icon: AlertTriangle, page: "Announcements" },
      { name: "Messages", icon: MessageSquare, page: "Messages" },
      { name: "Channels", icon: Users, page: "Channels" },
    ],
  },
  {
    name: "Employee Hub",
    icon: Users,
    page: "EmployeeDashboard",
    submenu: [
      { name: "Directory", icon: Users, page: "EmployeeDirectory" },
      { name: "My Availability", icon: Clock, page: "MyAvailability" },
      { name: "Time Off", icon: Clock, page: "TimeOff" },
      { name: "Shift Swaps", icon: ArrowLeftRight, page: "ShiftSwaps", badge: "swaps" },
      { name: "Onboarding", icon: Users, page: "EmployeeOnboarding" },
    ],
  },
  { name: "Reports", icon: BarChart2, page: "Reports" },
  { name: "Operational Forms", icon: FileText, page: "OperationalForms" },
  { name: "Alerts", icon: AlertTriangle, page: "Alerts", badge: "alerts" },
  { name: "Payroll Integrations", icon: BarChart2, page: "PayrollIntegrations" },
  // Owner-only items (hidden from plain admin)
  { name: "Billing", icon: CreditCard, page: "Billing", ownerOnly: true },
  { name: "Settings", icon: Settings, page: "Settings", ownerOnly: true },
  { name: "Admin Setup", icon: LayoutDashboard, page: "AdminSetup", ownerOnly: true },
  { name: "Error Logs", icon: AlertTriangle, page: "ErrorLogs", ownerOnly: true },
];


export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Map regular pages to mobile pages
  const mobilePageMap = {
    "Schedule": "MobileSchedule",
    "Employees": "MobileEmployees",
    "TimeOff": "MobileTimeOff",
    "Billing": "MobileBilling",
    "Locations": "MobileLocations",
    "Certifications": "MobileCertifications"
  };

  // Redirect to mobile page if on mobile
  if (isMobile && mobilePageMap[currentPageName]) {
    return <MobileLayout currentPageName={currentPageName}>{children}</MobileLayout>;
  }

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.list("-created_date", 100),
    refetchInterval: 60000
  });
  const { data: swapRequests = [] } = useQuery({
    queryKey: ["shift-swaps"],
    queryFn: () => base44.entities.ShiftSwapRequest.list("-created_date", 100),
    refetchInterval: 60000
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => base44.entities.Notification.list("-created_date", 100),
    refetchInterval: 30000
  });
  
  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length;
  const pendingSwaps = swapRequests.filter((s) => s.status === "pending_employee" || s.status === "pending_manager").length;
  const unreadNotifications = notifications.filter((n) => n.user_email === user?.email && !n.read).length;

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
              <span className="font-bold text-xl text-gray-900">LifeGuard Tracker
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {primaryNavItems.map((item) => {const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ?
                      "text-[#1a9c5b] bg-[#f0faf5]" :
                      "text-gray-700 hover:text-gray-900"}`
                      }>

                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>);

                })}

              {/* More Menu (all users) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900 gap-1 text-sm font-medium px-4 py-2.5">
                    <MoreVertical className="w-4 h-4" />
                    More
                    {pendingSwaps > 0 &&
                      <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {pendingSwaps > 9 ? "9+" : pendingSwaps}
                      </span>
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 max-h-[80vh] overflow-y-auto">
                  {moreNavItems.map((item) => (
                    <DropdownMenuItem key={item.page} asChild>
                      <Link to={createPageUrl(item.page)} className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                        {item.badge === "swaps" && pendingSwaps > 0 &&
                          <span className="ml-auto bg-orange-500 text-white text-xs font-bold rounded-full px-1.5">{pendingSwaps}</span>
                        }
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-500">Help</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("Docs")} className="flex items-center gap-2"><BookOpen className="w-4 h-4" /><span>Documentation</span></Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("Contact")} className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>Contact Support</span></Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => base44.auth.logout(createPageUrl("Home"))} className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4" /><span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Enterprise Menu (admin / site_owner / enterprise_site_owner only) */}
              {ENTERPRISE_MENU_ROLES.includes(user?.role) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900 gap-1.5 text-sm font-medium px-4 py-2.5 border border-gray-200 rounded-lg">
                      <Zap className="w-4 h-4 text-[#1a9c5b]" />
                      Enterprise
                      {(unresolvedAlerts > 0) &&
                        <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {unresolvedAlerts > 9 ? "9+" : unresolvedAlerts}
                        </span>
                      }
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 max-h-[85vh] overflow-y-auto">
                    <DropdownMenuLabel className="text-xs font-bold text-[#1a9c5b] uppercase tracking-wide px-2 py-1.5">Enterprise Tools</DropdownMenuLabel>
                    {enterpriseNavItems.map((item) => {
                      // Owner-only items hidden from plain admin
                      if (item.ownerOnly && !OWNER_ONLY_ROLES.includes(user?.role)) return null;
                      if (item.submenu) {
                        return (
                          <div key={item.page}>
                            <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5 text-gray-600 font-semibold text-xs mt-1">
                              <item.icon className="w-3.5 h-3.5" />
                              <span>{item.name}</span>
                            </DropdownMenuLabel>
                            {item.submenu.map((subitem) => {
                              if (subitem.proOnly && !PRO_AND_ABOVE_ROLES.includes(user?.role)) return null;
                              return (
                                <DropdownMenuItem key={subitem.page} asChild>
                                  <Link to={createPageUrl(subitem.page)} className="flex items-center gap-2 ml-2">
                                    <subitem.icon className="w-4 h-4" />
                                    <span>{subitem.name}</span>
                                    {subitem.badge === "swaps" && pendingSwaps > 0 &&
                                      <span className="ml-auto bg-orange-500 text-white text-xs font-bold rounded-full px-1.5">{pendingSwaps}</span>
                                    }
                                  </Link>
                                </DropdownMenuItem>
                              );
                            })}
                            <DropdownMenuSeparator />
                          </div>
                        );
                      }
                      return (
                        <DropdownMenuItem key={item.page} asChild>
                          <Link to={createPageUrl(item.page)} className="flex items-center gap-2">
                            <item.icon className="w-4 h-4" />
                            <span>{item.name}</span>
                            {item.badge === "alerts" && unresolvedAlerts > 0 &&
                              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-1.5">{unresolvedAlerts}</span>
                            }
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-700"
              onClick={() => setMobileOpen(!mobileOpen)}>

              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-1">
            {/* Primary */}
            {primaryNavItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link key={item.page} to={createPageUrl(item.page)} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "text-[#1a9c5b] bg-[#f0faf5]" : "text-gray-700 hover:text-gray-900"}`}>
                  <item.icon className="w-4 h-4" />{item.name}
                </Link>
              );
            })}
            {/* Basic more */}
            {moreNavItems.map((item) => (
              <Link key={item.page} to={createPageUrl(item.page)} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <item.icon className="w-4 h-4" />{item.name}
                {item.badge === "swaps" && pendingSwaps > 0 && <span className="ml-auto bg-orange-500 text-white text-xs font-bold rounded-full px-2">{pendingSwaps}</span>}
              </Link>
            ))}

            {/* Enterprise section */}
            {ENTERPRISE_MENU_ROLES.includes(user?.role) && (
              <>
                <div className="border-t border-gray-200 pt-3 mt-2">
                  <p className="text-xs font-bold text-[#1a9c5b] uppercase tracking-wide px-4 mb-2">Enterprise</p>
                  {enterpriseNavItems.map((item) => {
                    if (item.ownerOnly && !OWNER_ONLY_ROLES.includes(user?.role)) return null;
                    if (item.submenu) {
                      return (
                        <div key={item.page}>
                          <div className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">
                            <item.icon className="w-3.5 h-3.5" />{item.name}
                          </div>
                          {item.submenu.map((subitem) => (
                            <Link key={subitem.page} to={createPageUrl(subitem.page)} onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 px-8 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                              <subitem.icon className="w-4 h-4" />{subitem.name}
                            </Link>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <Link key={item.page} to={createPageUrl(item.page)} onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                        <item.icon className="w-4 h-4" />{item.name}
                        {item.badge === "alerts" && unresolvedAlerts > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2">{unresolvedAlerts}</span>}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            <div className="border-t border-gray-200 pt-2 mt-2">
              <Link to={createPageUrl("Docs")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <BookOpen className="w-4 h-4" />Documentation
              </Link>
              <Link to={createPageUrl("Contact")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4" />Contact Support
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="bg-white">
        {children}
      </main>

      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>);

}