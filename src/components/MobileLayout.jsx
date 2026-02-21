import React, { useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Users, Clock, Menu, X, Home, ChevronLeft, Shield } from "lucide-react";

const mobileNavItems = [
  { name: "Schedule", icon: CalendarDays, page: "Schedule" },
  { name: "Team",     icon: Users,       page: "Employees" },
  { name: "Time Off", icon: Clock,       page: "TimeOff" },
  { name: "Home",     icon: Home,        page: "Dashboard" },
];

const rootPages = ["Schedule", "Employees", "TimeOff", "Dashboard"];

function haptic() { if (navigator.vibrate) navigator.vibrate(8); }

export default function MobileLayout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const isRootPage = rootPages.includes(currentPageName);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(async (e) => {
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (scrollTop === 0 && deltaY > 70 && !refreshing) {
      haptic();
      setRefreshing(true);
      await new Promise((r) => setTimeout(r, 900));
      window.location.reload();
    }
  }, [refreshing]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col select-none" style={{ overscrollBehavior: "none" }}>

      {/* Header */}
      <header
        className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="px-4 h-14 flex items-center justify-between">
          {isRootPage ? (
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1a9c5b] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm text-gray-900">LifeGuard</span>
            </Link>
          ) : (
            <button
              onClick={() => { haptic(); navigate(-1); }}
              className="flex items-center gap-1 text-[#1a9c5b] font-semibold text-sm -ml-1 active:opacity-70 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}

          <button
            onClick={() => { haptic(); setMobileOpen(!mobileOpen); }}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 active:bg-gray-100 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Slide-down menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-100"
            >
              <div className="px-3 py-2 space-y-1 pb-3">
                {mobileNavItems.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => { haptic(); setMobileOpen(false); }}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? "text-[#1a9c5b] bg-[#f0faf5]" : "text-gray-700 active:bg-gray-50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Pull-to-refresh */}
      <AnimatePresence>
        {refreshing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 36, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center bg-[#f0faf5] text-[#1a9c5b] text-xs font-semibold overflow-hidden"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-[#1a9c5b] border-t-transparent rounded-full mr-2" />
            Refreshing…
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-auto"
        style={{ overscrollBehavior: "none" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageName}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Tab Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        <div className="flex">
          {mobileNavItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={haptic}
                className="flex-1 flex flex-col items-center gap-0.5 pt-2.5 pb-2 active:opacity-70 transition-opacity"
              >
                <div className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-colors ${isActive ? "bg-[#f0faf5]" : ""}`}>
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-[#1a9c5b]" : "text-gray-400"}`} />
                  {isActive && <motion.div layoutId="tabIndicator" className="absolute inset-0 rounded-xl bg-[#f0faf5] -z-10" />}
                </div>
                <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-[#1a9c5b]" : "text-gray-400"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom nav spacer */}
      <div style={{ height: "calc(60px + env(safe-area-inset-bottom, 0px))" }} />
    </div>
  );
}