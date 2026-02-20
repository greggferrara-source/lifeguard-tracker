import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  CalendarDays,
  Users,
  Clock,
  Menu,
  X,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mobileNavItems = [
  { name: "Schedule", icon: CalendarDays, page: "Schedule" },
  { name: "Employees", icon: Users, page: "Employees" },
  { name: "Time Off", icon: Clock, page: "TimeOff" },
  { name: "Dashboard", icon: Home, page: "Dashboard" },
];

export default function MobileLayout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1a9c5b] flex items-center justify-center">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
            <span className="font-bold text-sm text-gray-900">LifeGuard Tracker</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-gray-200 px-4 py-2 space-y-1">
            {mobileNavItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#1a9c5b] bg-[#f0faf5]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1 bg-white overflow-auto">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 flex justify-around">
        {mobileNavItems.map((item) => {
          const isActive = currentPageName === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-[#1a9c5b]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-20" />
    </div>
  );
}