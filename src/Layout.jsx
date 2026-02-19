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
  Bell,
  AlertTriangle,
  BarChart2,
  MessageSquare,
  Settings,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Schedule", icon: CalendarDays, page: "Schedule" },
  { name: "Employees", icon: Users, page: "Employees" },
  { name: "Locations", icon: MapPin, page: "Locations" },
  { name: "Time Off", icon: Clock, page: "TimeOff" },
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
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top Nav */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1a9c5b] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">ShiftGuard</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-[#1a9c5b] text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                    {item.badge === "alerts" && unresolvedAlerts > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unresolvedAlerts > 9 ? "9+" : unresolvedAlerts}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#1a9c5b] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                  {item.badge === "alerts" && unresolvedAlerts > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5">{unresolvedAlerts}</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Page Content */}
      <main>
        {children}
      </main>
    </div>
  );
}