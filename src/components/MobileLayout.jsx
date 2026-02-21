import React, { useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Users,
  Clock,
  Menu,
  X,
  Home,
  ChevronLeft,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mobileNavItems = [
  { name: "Schedule", icon: CalendarDays, page: "Schedule" },
  { name: "Employees", icon: Users, page: "Employees" },
  { name: "Time Off", icon: Clock, page: "TimeOff" },
  { name: "Dashboard", icon: Home, page: "Dashboard" },
];

const rootPages = ["Schedule", "Employees", "TimeOff", "Dashboard"];

export default function MobileLayout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const isRootPage = rootPages.includes(currentPageName);

  // Pull-to-refresh
  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(async (e) => {
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (scrollTop === 0 && deltaY > 60 && !refreshing) {
      setRefreshing(true);
      await new Promise((r) => setTimeout(r, 800));
      window.location.reload();
    }
  }, [refreshing]);

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      style={{ overscrollBehavior: "none" }}
    >
      {/* Mobile Header — safe area top */}
      <header
        className="bg-white border-b border-gray-200 sticky top-0 z-40"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left: back button on sub-pages, logo on root pages */}
          {isRootPage ? (
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2 select-none">
              <div className="w-8 h-8 rounded-lg bg-[#1a9c5b] flex-shrink-0 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm text-gray-900">LifeGuard Tracker</span>
            </Link>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-[#1a9c5b] font-semibold text-sm select-none"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 select-none"
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors select-none ${
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

      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {refreshing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 40, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center bg-[#f0faf5] text-[#1a9c5b] text-xs font-medium overflow-hidden"
          >
            Refreshing…
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content with slide transition */}
      <main
        ref={scrollRef}
        className="flex-1 bg-white overflow-auto"
        style={{ overscrollBehavior: "none" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageName}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav — safe area bottom */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
          paddingTop: "8px",
        }}
      >
        {mobileNavItems.map((item) => {
          const isActive = currentPageName === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-medium transition-colors select-none ${
                isActive ? "text-[#1a9c5b]" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer for bottom nav */}
      <div style={{ height: "calc(64px + env(safe-area-inset-bottom, 0px))" }} />
    </div>
  );
}