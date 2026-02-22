import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { Clock, Calendar, MapPin, AlertCircle, ArrowRight } from "lucide-react";
import MobileClockInOut from "@/components/MobileClockInOut";

export default function MobileGuardDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (e) {
        console.error("Auth error:", e);
      }
    };
    init();
  }, []);

  const { data: todayShifts = [] } = useQuery({
    queryKey: ["today-shifts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const today = format(new Date(), "yyyy-MM-dd");
      return await base44.entities.Shift.filter({
        employee_id: user.id,
        date: today
      });
    },
    enabled: !!user?.id
  });

  const { data: upcomingShifts = [] } = useQuery({
    queryKey: ["upcoming-shifts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const today = format(new Date(), "yyyy-MM-dd");
      const next7Days = format(addDays(new Date(), 7), "yyyy-MM-dd");
      return await base44.entities.Shift.filter({
        employee_id: user.id
      }).then(shifts => 
        shifts.filter(s => s.date > today && s.date <= next7Days)
      );
    },
    enabled: !!user?.id
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["urgent-alerts"],
    queryFn: () => base44.entities.UrgentAlert.list("-created_date", 10)
  });

  const activeAlerts = alerts.filter(a => a.status === "active");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">Hi, {user?.full_name?.split(" ")[0]}</h1>
        <p className="text-sm text-gray-600">{format(new Date(), "EEEE, MMMM d")}</p>
      </div>

      <div className="p-4 space-y-6 pb-20">
        {/* Urgent Alerts */}
        {activeAlerts.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-900">Active Alerts</h3>
            </div>
            {activeAlerts.slice(0, 2).map(alert => (
              <div key={alert.id} className="bg-white rounded-lg p-3 border border-red-100">
                <p className="font-semibold text-sm text-gray-900">{alert.title}</p>
                <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Clock In/Out */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3">Clock In/Out</h2>
          <MobileClockInOut />
        </div>

        {/* Today's Shift */}
        {todayShifts.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Today's Shift</h2>
            {todayShifts.map(shift => (
              <div key={shift.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#1a9c5b] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {shift.start_time} - {shift.end_time}
                    </p>
                    <p className="text-xs text-gray-600">
                      {Math.ceil((parseInt(shift.end_time) - parseInt(shift.start_time)) / 100)} hour shift
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">{shift.location_name}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-600">No shifts scheduled today</p>
          </div>
        )}

        {/* Upcoming Shifts */}
        {upcomingShifts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Next 7 Days</h2>
            <div className="space-y-3">
              {upcomingShifts.slice(0, 5).map(shift => (
                <div key={shift.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {format(new Date(shift.date), "MMM d")}
                      </p>
                      <p className="text-xs text-gray-600">{shift.start_time} - {shift.end_time}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}