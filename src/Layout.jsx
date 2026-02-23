import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import MobileLayout from "@/components/MobileLayout";
import {
    LayoutDashboard, CalendarDays, Calendar, Users, MapPin, Clock, Menu, X, Shield,
    AlertTriangle, ArrowLeftRight, BarChart2, MessageSquare, Settings,
    BookOpen, Mail, Zap, CreditCard, Eye, FileText, LogOut, Globe,
    ChevronDown, ChevronRight, Bell, Wrench, Droplets, ClipboardList, TrendingDown, TrendingUp, Award, Lightbulb, Search, Grid3x3 as LayoutIcon, Upload,
  } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import FeedbackWidget from "@/components/FeedbackWidget";

const ROOT_EMAIL = "greggferrara@gmail.com";
const ENTERPRISE_ROLES = ["enterprise_site_owner", "enterprise_admin"];
const PRO_AND_ABOVE_ROLES = ["enterprise_site_owner", "enterprise_admin", "site_owner", "admin"];
const OWNER_ONLY_ROLES = ["enterprise_site_owner", "site_owner"];
const ELEVATED_ROLES = PRO_AND_ABOVE_ROLES;

// Desktop mega-dropdown groups for the Enterprise menu
const enterpriseGroups = [
  {
    label: "Compliance",
    icon: Shield,
    items: [
      { name: "Compliance Dashboard", icon: Shield, page: "ComplianceDashboard" },
      { name: "Assessment Manager", icon: Shield, page: "ComplianceAssessmentManager" },
      { name: "Checklist Dashboard", icon: ClipboardList, page: "ChecklistDashboard" },
      { name: "Incident Management", icon: AlertTriangle, page: "IncidentDashboard" },
      { name: "Incident & Rescue Logs", icon: AlertTriangle, page: "IncidentLogs" },
      { name: "Staffing Forecast", icon: TrendingDown, page: "StaffingForecast" },
      { name: "Cert Compliance", icon: Award, page: "CertComplianceDashboard" },
      { name: "Public Safety Dashboard", icon: Eye, page: "PublicSafetyDashboard", enterpriseOnly: true },
    ],
  },
  {
    label: "Scheduling",
    icon: CalendarDays,
    items: [
      { name: "Workforce Scheduler", icon: CalendarDays, page: "WorkforceScheduler", enterpriseOnly: true },
      { name: "Auto Shift Planner", icon: Zap, page: "AutoShiftPlanner", enterpriseOnly: true },
      { name: "Assignments", icon: BarChart2, page: "Assignments" },
      { name: "Resource Booking", icon: Calendar, page: "ResourceBooking" },
      { name: "Patron Counts", icon: Users, page: "PatronCounts" },
    ],
  },
  {
    label: "Facilities & Assets",
    icon: Wrench,
    items: [
      { name: "Asset Management", icon: Wrench, page: "AssetManagement" },
      { name: "Chemical Logs", icon: Droplets, page: "ChemicalLogs" },
      { name: "Pool Test Reporting", icon: Droplets, page: "PoolTestReporting" },
      { name: "Inspections", icon: BarChart2, page: "Inspections" },
      { name: "Maintenance Reports", icon: BarChart2, page: "MaintenanceReports" },
      { name: "Emergency Action Plans", icon: Shield, page: "EmergencyActionPlans" },
    ],
  },
  {
    label: "Staff Development",
    icon: Award,
    items: [
      { name: "Employee Profiles", icon: Users, page: "EmployeeProfile" },
      { name: "Employee Onboarding", icon: Users, page: "OnboardingManagement" },
      { name: "Performance Reviews", icon: Award, page: "PerformanceReviewManager", enterpriseOnly: true },
      { name: "Staff Training", icon: BookOpen, page: "TrainingDashboard" },
      { name: "Location Tracking", icon: MapPin, page: "EmployeeLocationTracking" },
    ],
  },
  {
    label: "People",
    icon: Users,
    items: [
      { name: "Employee Management", icon: Award, page: "EmployeeManagement" },
      { name: "Certifications", icon: Shield, page: "Certifications" },
      { name: "Directory", icon: Users, page: "EmployeeDirectory" },
      { name: "My Availability", icon: Clock, page: "MyAvailability" },
      { name: "Onboarding", icon: LayoutDashboard, page: "OnboardingDashboard" },
    ],
  },
  {
    label: "Comms & Forms",
    icon: MessageSquare,
    items: [
      { name: "Announcements", icon: Bell, page: "Announcements" },
      { name: "Channels", icon: MessageSquare, page: "Channels" },
      { name: "Operational Forms", icon: FileText, page: "OperationalForms" },
    ],
  },
  {
    label: "Reports & Admin",
    icon: BarChart2,
    items: [
      { name: "Reports", icon: BarChart2, page: "Reports" },
      { name: "Advanced Reporting", icon: BarChart2, page: "AdvancedReporting" },
      { name: "Safety Metrics Dashboard", icon: BarChart2, page: "SafetyDashboard" },
      { name: "Incident Trends", icon: TrendingDown, page: "IncidentTrendReport" },
      { name: "Staffing Forecast", icon: Zap, page: "StaffingForecastDashboard" },
      { name: "Weather Alerts", icon: AlertTriangle, page: "WeatherAlertsMonitor" },
      { name: "Alerts", icon: AlertTriangle, page: "Alerts", badge: "alerts" },
      { name: "AI Compliance Advisor", icon: Lightbulb, page: "ComplianceAIAdvisor" },
      { name: "Document Management", icon: FileText, page: "DocumentManagement" },
      { name: "Workflow Automation", icon: Zap, page: "WorkflowAutomation" },
      { name: "Global Search", icon: Search, page: "GlobalSearch" },
      { name: "My Dashboard", icon: LayoutIcon, page: "CustomDashboard" },
      { name: "Multi-Location Dashboard", icon: Globe, page: "MultiLocationDashboard", enterpriseOnly: true },
      { name: "Public Status Widget", icon: Eye, page: "PublicStatusWidget", ownerOnly: true },
      { name: "Payroll Integrations", icon: BarChart2, page: "PayrollIntegrations", enterpriseOnly: true },
      { name: "External Integrations", icon: Zap, page: "Integrations" },
      { name: "Compliance Workflows", icon: Shield, page: "ComplianceWorkflowManager" },
      { name: "Documentation", icon: BookOpen, page: "Documentation" },
      { name: "Billing", icon: CreditCard, page: "Billing", ownerOnly: true, rootOnly: true },
      { name: "Settings", icon: Settings, page: "Settings", ownerOnly: true },
      { name: "Admin Setup", icon: LayoutDashboard, page: "AdminSetup", ownerOnly: true },
      { name: "Data Import", icon: Upload, page: "DataImport", ownerOnly: true, rootOnly: true },
      { name: "Error Logs", icon: AlertTriangle, page: "ErrorLogs", ownerOnly: true, rootOnly: true },
    ],
  },
  {
    label: "Analytics & Team",
    icon: Users,
    items: [
      { name: "Predictive Analytics", icon: TrendingUp, page: "PredictiveAnalytics" },
      { name: "Staff Mobile App", icon: Users, page: "MobileStaffApp" },
      { name: "Team Chat", icon: MessageSquare, page: "TeamChat" },
      { name: "Employee Performance", icon: Award, page: "EmployeePerformanceDashboard" },
      { name: "Patron Management", icon: Users, page: "PatronManagement" },
      { name: "Staff Recognition", icon: Award, page: "StaffRecognition" },
      { name: "AI Guard Insights", icon: Lightbulb, page: "GuardAIInsights" },
      { name: "Emergency Dispatch", icon: AlertTriangle, page: "EmergencyCall" },
    ],
  },
];

// Mobile collapsible section component
function MobileSection({ label, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
      >
        <span className="flex items-center gap-2"><Icon className="w-4 h-4" />{label}</span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && <div className="ml-4 border-l border-gray-100 pl-2 mb-1">{children}</div>}
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mobilePageMap = {
    "Schedule": "MobileSchedule", "Employees": "MobileEmployees",
    "TimeOff": "MobileTimeOff", "Billing": "MobileBilling",
    "Locations": "MobileLocations", "Certifications": "MobileCertifications",
    "MobileGuardDashboard": "MobileGuardDashboard",
  };

  if (isMobile && mobilePageMap[currentPageName]) {
    return <MobileLayout currentPageName={currentPageName}>{children}</MobileLayout>;
  }

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: () => base44.entities.Alert.list("-created_date", 100), refetchInterval: 60000 });
  const { data: swapRequests = [] } = useQuery({ queryKey: ["shift-swaps"], queryFn: () => base44.entities.ShiftSwapRequest.list("-created_date", 100), refetchInterval: 60000 });

  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length;
  const pendingSwaps = swapRequests.filter((s) => s.status === "pending_employee" || s.status === "pending_manager").length;

  if (currentPageName === "Home") return <>{children}</>;

  const isElevated = ELEVATED_ROLES.includes(user?.role);
  const isEnterprise = ENTERPRISE_ROLES.includes(user?.role);
  const isOwner = OWNER_ONLY_ROLES.includes(user?.role);
  const isRoot = user?.email === ROOT_EMAIL;

  const close = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to={createPageUrl("Home")} className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#1a9c5b] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-gray-900 hidden sm:block">LifeGuard Tracker</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {[
              { name: "Schedule", icon: CalendarDays, page: "Schedule" },
              { name: "Employees", icon: Users, page: "Employees" },
              { name: "Locations", icon: MapPin, page: "Locations" },
            ].map((item) => (
              <Link key={item.page} to={createPageUrl(item.page)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentPageName === item.page ? "text-[#1a9c5b] bg-[#f0faf5]" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                <item.icon className="w-4 h-4" />{item.name}
              </Link>
            ))}

            {/* Team dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <Clock className="w-4 h-4" />Team
                  <ChevronDown className="w-3 h-3 opacity-60" />
                  {(pendingSwaps > 0 || unresolvedAlerts > 0) && <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{(pendingSwaps + unresolvedAlerts) > 9 ? "9+" : (pendingSwaps + unresolvedAlerts)}</span>}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem asChild><Link to={createPageUrl("TimeOff")} className="flex items-center gap-2"><Clock className="w-4 h-4" />Time Off</Link></DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("ShiftSwaps")} className="flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4" />Shift Swaps
                    {pendingSwaps > 0 && <span className="ml-auto bg-orange-500 text-white text-xs font-bold rounded-full px-1.5">{pendingSwaps}</span>}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild><Link to={createPageUrl("Messages")} className="flex items-center gap-2"><MessageSquare className="w-4 h-4" />Messages</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to={createPageUrl("UrgentAlerts")} className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Urgent Alerts</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to={createPageUrl("ShiftPreferencesManager")} className="flex items-center gap-2"><Users className="w-4 h-4" />Shift Preferences</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to={createPageUrl("MobileGuardDashboard")} className="flex items-center gap-2"><Shield className="w-4 h-4" />Guard Mobile View</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enterprise mega-menu */}
            {isElevated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 transition-colors">
                    <Zap className="w-4 h-4 text-[#1a9c5b]" />
                    {isEnterprise ? "Enterprise" : "Pro"}
                    <ChevronDown className="w-3 h-3 opacity-60" />
                    {unresolvedAlerts > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{unresolvedAlerts > 9 ? "9+" : unresolvedAlerts}</span>}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[680px] p-3">
                  <div className="grid grid-cols-3 gap-1">
                    {enterpriseGroups.map((group) => {
                      const visible = group.items.filter(i => {
                        if (i.rootOnly && !isRoot) return false;
                        if (i.ownerOnly && !isOwner) return false;
                        if (i.enterpriseOnly && !isEnterprise) return false;
                        return true;
                      });
                      if (visible.length === 0) return null;
                      return (
                        <div key={group.label} className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center gap-1.5 px-1 py-1 mb-1">
                            <group.icon className="w-3.5 h-3.5 text-[#1a9c5b]" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{group.label}</span>
                          </div>
                          {visible.map((item) => (
                            <DropdownMenuItem key={item.page} asChild>
                              <Link to={createPageUrl(item.page)} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-white">
                                <item.icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="truncate">{item.name}</span>
                                {item.badge === "alerts" && unresolvedAlerts > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-1.5">{unresolvedAlerts}</span>}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <DropdownMenuItem onClick={() => base44.auth.logout(createPageUrl("Home"))} className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer rounded-md px-2 py-1.5">
                      <LogOut className="w-3.5 h-3.5" />Log Out
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden lg:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-[#1a9c5b]/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#1a9c5b]">{user?.full_name?.[0] || "?"}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user?.full_name && <DropdownMenuLabel className="font-normal"><div className="font-semibold text-gray-900 text-sm">{user.full_name}</div><div className="text-xs text-gray-400">{user.email}</div></DropdownMenuLabel>}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to={createPageUrl("NotificationPreferences")} className="flex items-center gap-2"><Bell className="w-4 h-4" />Notification Preferences</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to={createPageUrl("Documentation")} className="flex items-center gap-2"><BookOpen className="w-4 h-4" />Documentation</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to={createPageUrl("Contact")} className="flex items-center gap-2"><Mail className="w-4 h-4" />Contact Support</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => base44.auth.logout(createPageUrl("Home"))} className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4" />Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-gray-700" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav — collapsible sections */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white overflow-y-auto max-h-[80vh]">
            <div className="px-3 py-3 space-y-0.5">

              {/* Core */}
              {[
                { name: "Schedule", icon: CalendarDays, page: "Schedule" },
                { name: "Employees", icon: Users, page: "Employees" },
                { name: "Locations", icon: MapPin, page: "Locations" },
              ].map((item) => (
                <Link key={item.page} to={createPageUrl(item.page)} onClick={close}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${currentPageName === item.page ? "text-[#1a9c5b] bg-[#f0faf5]" : "text-gray-700 hover:bg-gray-50"}`}>
                  <item.icon className="w-4 h-4" />{item.name}
                </Link>
              ))}

              {/* Team section */}
              <MobileSection label="Team" icon={Clock}>
                <Link to={createPageUrl("TimeOff")} onClick={close} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"><Clock className="w-4 h-4" />Time Off</Link>
                <Link to={createPageUrl("ShiftSwaps")} onClick={close} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                  <ArrowLeftRight className="w-4 h-4" />Shift Swaps
                  {pendingSwaps > 0 && <span className="ml-auto bg-orange-500 text-white text-xs font-bold rounded-full px-1.5">{pendingSwaps}</span>}
                </Link>
                <Link to={createPageUrl("Messages")} onClick={close} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"><MessageSquare className="w-4 h-4" />Messages</Link>
                <Link to={createPageUrl("UrgentAlerts")} onClick={close} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"><AlertTriangle className="w-4 h-4" />Urgent Alerts</Link>
              </MobileSection>

              {/* Enterprise collapsible groups */}
              {isElevated && (
                <>
                  <div className="pt-2 pb-1 px-4">
                    <span className="text-xs font-bold text-[#1a9c5b] uppercase tracking-wide">{isEnterprise ? "Enterprise" : "Pro"} Tools</span>
                  </div>
                  {enterpriseGroups.map((group) => {
                    const visible = group.items.filter(i => {
                      if (i.rootOnly && !isRoot) return false;
                      if (i.ownerOnly && !isOwner) return false;
                      if (i.enterpriseOnly && !isEnterprise) return false;
                      return true;
                    });
                    if (visible.length === 0) return null;
                    return (
                      <MobileSection key={group.label} label={group.label} icon={group.icon}>
                        {visible.map((item) => (
                          <Link key={item.page} to={createPageUrl(item.page)} onClick={close}
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                            <item.icon className="w-4 h-4" />{item.name}
                            {item.badge === "alerts" && unresolvedAlerts > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-1.5">{unresolvedAlerts}</span>}
                          </Link>
                        ))}
                      </MobileSection>
                    );
                  })}
                </>
              )}

              {/* Help & account */}
              <div className="border-t border-gray-100 pt-2 mt-1 space-y-0.5">
                <Link to={createPageUrl("NotificationPreferences")} onClick={close} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"><Bell className="w-4 h-4" />Notification Preferences</Link>
                <Link to={createPageUrl("Documentation")} onClick={close} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"><BookOpen className="w-4 h-4" />Documentation</Link>
                <Link to={createPageUrl("Contact")} onClick={close} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"><Mail className="w-4 h-4" />Contact Support</Link>
                <button onClick={() => base44.auth.logout(createPageUrl("Home"))} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4" />Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="bg-white">{children}</main>

      <FeedbackWidget />
    </div>
  );
}