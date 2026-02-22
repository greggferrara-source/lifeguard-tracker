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
  FileText,
  Play,
  MoreVertical,
  Zap,
  CreditCard,
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

const primaryNavItems = [
{ name: "Schedule", icon: CalendarDays, page: "Schedule" },
{ name: "Employees", icon: Users, page: "Employees" },
{ name: "Locations", icon: MapPin, page: "Locations" }];


const moreNavItems = [
{ name: "Communications", icon: MessageSquare, page: "Announcements", roles: ["admin", "site_owner", "manager"], submenu: [
  { name: "Announcements", icon: AlertTriangle, page: "Announcements" },
  { name: "Messages", icon: MessageSquare, page: "Messages" },
  { name: "Channels", icon: Users, page: "Channels" }]
},
{ name: "Employee Hub", icon: Users, page: "EmployeeDashboard", roles: ["employee", "manager", "admin", "site_owner"], submenu: [
  { name: "Directory", icon: Users, page: "EmployeeDirectory" },
  { name: "My Availability", icon: Clock, page: "MyAvailability" },
  { name: "Time Off", icon: Clock, page: "TimeOff" },
  { name: "Shift Swaps", icon: ArrowLeftRight, page: "ShiftSwaps", badge: "swaps" },
  { name: "Onboarding", icon: Users, page: "EmployeeOnboarding" }]
},
{ name: "Compliance", icon: Shield, page: "ComplianceDashboard", roles: ["admin", "site_owner", "manager"], submenu: [
  { name: "Compliance Dashboard", icon: Shield, page: "ComplianceDashboard" },
  { name: "Certifications", icon: Shield, page: "Certifications" },
  { name: "Chemical Logs", icon: BarChart2, page: "ChemicalLogs" },
  { name: "Inspections", icon: BarChart2, page: "Inspections" },
  { name: "Incident & Rescue Logs", icon: AlertTriangle, page: "IncidentLogs" },
  { name: "Maintenance Reports", icon: BarChart2, page: "MaintenanceReports" }]
},
{ name: "Operations", icon: BarChart2, page: "Assignments", roles: ["admin", "site_owner", "manager"], submenu: [
  { name: "Assignments", icon: BarChart2, page: "Assignments" },
  { name: "Asset Tracking", icon: BarChart2, page: "Assets" },
  { name: "Patron Counts", icon: Users, page: "PatronCounts" }]
},
{ name: "Payroll Integrations", icon: BarChart2, page: "PayrollIntegrations", roles: ["admin", "site_owner"] },
{ name: "Compliance", icon: Shield, page: "Compliance", roles: ["admin", "site_owner"] },
{ name: "Alerts", icon: AlertTriangle, page: "Alerts", badge: "alerts", roles: ["admin", "site_owner"] },
{ name: "Billing", icon: CreditCard, page: "Billing", roles: ["admin", "site_owner"] },
{ name: "Reports", icon: BarChart2, page: "Reports", roles: ["admin", "site_owner", "manager"] },
{ name: "Settings", icon: Settings, page: "Settings", roles: ["admin", "site_owner"] },
{ name: "Error Logs", icon: AlertTriangle, page: "ErrorLogs", roles: ["admin", "site_owner"] },
{ name: "Admin Setup", icon: LayoutDashboard, page: "AdminSetup", roles: ["admin", "site_owner"] }];


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

              {/* More Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900 gap-1 text-sm font-medium px-4 py-2.5">
                    <MoreVertical className="w-4 h-4" />
                    More
                    {(unresolvedAlerts > 0 || pendingSwaps > 0) &&
                    <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unresolvedAlerts + pendingSwaps > 9 ? "9+" : unresolvedAlerts + pendingSwaps}
                      </span>
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 max-h-[80vh] overflow-y-auto">
                  {moreNavItems.map((item) => {
                    if (item.roles && !item.roles.includes(user?.role)) return null;
                    
                    if (item.submenu) {
                      return (
                        <div key={item.page}>
                          <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5">
                            <item.icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </DropdownMenuLabel>
                          {item.submenu.map((subitem) =>
                            <DropdownMenuItem key={subitem.page} asChild>
                              <Link to={createPageUrl(subitem.page)} className="flex items-center gap-2 ml-2">
                                <subitem.icon className="w-4 h-4" />
                                <span>{subitem.name}</span>
                                {subitem.badge === "swaps" && pendingSwaps > 0 &&
                                  <span className="ml-auto bg-orange-500 text-white text-xs font-bold rounded-full px-1.5">{pendingSwaps}</span>
                                }
                              </Link>
                            </DropdownMenuItem>
                          )}
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
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-500">Help & Info</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("Docs")} className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Documentation</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("Tutorials")} className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span>Video Tutorials</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                   <Link to={createPageUrl("Contact")} className="flex items-center gap-2">
                     <Mail className="w-4 h-4" />
                     <span>Contact Support</span>
                   </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                   onClick={() => base44.auth.logout(createPageUrl("Home"))}
                   className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                  >
                   <LogOut className="w-4 h-4" />
                   <span>Log Out</span>
                  </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
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
        {mobileOpen &&
        <div className="lg:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-2">
            {[...primaryNavItems, ...moreNavItems].map((item) => {
            const isActive = currentPageName === item.page;
            if (item.roles && !item.roles.includes(user?.role)) return null;
            
            if (item.submenu) {
              return (
                <div key={item.page}>
                      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700`}>
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </div>
                  {item.submenu.map((subitem) =>
                    <Link
                      key={subitem.page}
                      to={createPageUrl(subitem.page)}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-8 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                      <subitem.icon className="w-4 h-4" />
                      {subitem.name}
                      {subitem.badge === "swaps" && pendingSwaps > 0 &&
                        <span className="ml-auto bg-orange-500 text-white text-xs font-bold rounded-full px-2">{pendingSwaps}</span>
                      }
                    </Link>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ?
                "text-[#1a9c5b] bg-[#f0faf5]" :
                "text-gray-700 hover:text-gray-900"}`
                }>
                <item.icon className="w-4 h-4" />
                {item.name}
                {item.badge === "alerts" && unresolvedAlerts > 0 &&
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2">{unresolvedAlerts}</span>
                }
              </Link>
            );
          })}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-4">Help & Info</DropdownMenuLabel>
              <Link to={createPageUrl("Docs")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <BookOpen className="w-4 h-4" />
                Documentation
              </Link>
              <Link to={createPageUrl("Tutorials")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <Play className="w-4 h-4" />
                Video Tutorials
              </Link>
              <Link to={createPageUrl("Contact")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4" />
                Contact Support
              </Link>
              <Link to={createPageUrl("Terms")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4" />
                Terms of Service
              </Link>
              <Link to={createPageUrl("Privacy")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4" />
                Privacy Policy
              </Link>
            </div>
          </div>
        }
      </header>

      {/* Page Content */}
      <main className="bg-white">
        {children}
      </main>

      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>);

}