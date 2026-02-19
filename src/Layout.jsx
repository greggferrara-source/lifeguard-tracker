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
  ChevronRight,
  Shield,
  Bell,
  AlertTriangle,
  BarChart2,
  MessageSquare,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Schedule", icon: CalendarDays, page: "Schedule" },
  { name: "Employees", icon: Users, page: "Employees" },
  { name: "Locations", icon: MapPin, page: "Locations" },
  { name: "Time Off", icon: Clock, page: "TimeOff" },
  { name: "Alerts", icon: AlertTriangle, page: "Alerts", badge: "alerts" },
  { name: "Reports", icon: BarChart2, page: "Reports" },
  { name: "Notifications", icon: MessageSquare, page: "Notifications" },
  { name: "Settings", icon: Settings, page: "Settings" },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.list("-created_date", 100),
    refetchInterval: 60000,
  });
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;

  return (
    <div className="flex h-screen bg-[hsl(220,14%,96%)] overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${collapsed ? "lg:w-[72px]" : "lg:w-64"} w-64
          bg-[#0f172a] text-white
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-white/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
                <h1 className="font-bold text-base tracking-tight truncate">ShiftGuard</h1>
                <p className="text-[10px] text-cyan-400 font-medium tracking-widest uppercase">Scheduling</p>
              </motion.div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10 hidden lg:flex h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? "" : "rotate-180"}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10 lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-400 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-cyan-400" : ""}`} />
                {!collapsed && <span className="truncate flex-1">{item.name}</span>}
                {!collapsed && item.badge === "alerts" && unresolvedAlerts > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0 min-w-[18px] text-center">
                    {unresolvedAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        {!collapsed && (
          <div className="p-3 border-t border-white/10">
            <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-xl p-4 border border-cyan-500/20">
              <p className="text-xs font-semibold text-cyan-400 mb-1">ShiftGuard Pro</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">Advanced scheduling for aquatic teams</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{currentPageName}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}