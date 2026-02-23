import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar, MessageSquare, Bell, Settings, ChevronRight, CheckCircle2, AlertTriangle, Users } from "lucide-react";

export default function MobileStaffApp() {
  const [tab, setTab] = useState("dashboard");
  const [clockedIn, setClockedIn] = useState(false);
  const qc = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const { data: todayShifts = [] } = useQuery({
    queryKey: ["today-shifts", user?.id],
    queryFn: () => user?.id ? base44.entities.Shift.filter({
      employee_id: user.id,
      shift_date: new Date().toISOString().split('T')[0]
    }) : [],
    enabled: !!user?.id
  });

  const { data: allShifts = [] } = useQuery({
    queryKey: ["upcoming-shifts", user?.id],
    queryFn: () => user?.id ? base44.entities.Shift.filter({
      employee_id: user.id
    }, '-date', 30) : [],
    enabled: !!user?.id
  });

  const { data: unreadMessages = [] } = useQuery({
    queryKey: ["unread-messages", user?.email],
    queryFn: () => user?.email ? base44.entities.TeamMessage.filter({
      recipient_email: user.email,
      read: false
    }) : [],
    enabled: !!user?.email
  });

  const clockInMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.ClockEntry.create({
        employee_id: user?.id,
        employee_name: user?.full_name,
        clock_in: new Date().toISOString(),
        status: 'clocked_in',
        location_id: todayShifts[0]?.location_id,
        location_name: todayShifts[0]?.location_name
      });
    },
    onSuccess: () => {
      setClockedIn(true);
      qc.invalidateQueries({ queryKey: ["today-shifts"] });
    }
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      // Find active clock entry
      const activeClock = await base44.entities.ClockEntry.filter({
        employee_id: user?.id,
        status: 'clocked_in'
      }, '', 1);
      
      if (activeClock.length === 0) throw new Error('No active clock-in found');
      
      const clockIn = new Date(activeClock[0].clock_in);
      const now = new Date();
      const minutes = Math.round((now - clockIn) / 60000);
      
      return base44.entities.ClockEntry.update(activeClock[0].id, {
        clock_out: now.toISOString(),
        status: 'clocked_out',
        total_minutes: minutes
      });
    },
    onSuccess: () => {
      setClockedIn(false);
      qc.invalidateQueries({ queryKey: ["today-shifts"] });
    }
  });

  return (
    <div className="min-h-screen bg-white md:bg-gray-50" style={{ maxWidth: '500px', margin: '0 auto' }}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-20 bg-[#1a9c5b] text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-90">Welcome back</p>
            <h1 className="text-lg font-bold">{user?.full_name || "Staff"}</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-4 border-b border-gray-200 bg-white sticky top-16 z-10">
        {[
          { id: "dashboard", label: "Home", icon: Clock },
          { id: "schedule", label: "Schedule", icon: Calendar },
          { id: "chat", label: "Chat", icon: MessageSquare, badge: unreadMessages.length },
          { id: "alerts", label: "Alerts", icon: Bell }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1 relative ${
                tab === t.id
                  ? "border-[#1a9c5b] text-[#1a9c5b]"
                  : "border-transparent text-gray-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {t.badge > 0 && (
                <span className="absolute top-1 right-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-24">
        {/* Dashboard */}
        {tab === "dashboard" && (
          <div className="space-y-4">
            {/* Clock In/Out */}
            <Card className="border-2 border-[#1a9c5b]">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    clockedIn ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Clock className={`w-12 h-12 ${clockedIn ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {clockedIn ? 'You are clocked in' : 'You are clocked out'}
                  </p>
                  <Button
                    onClick={() => clockedIn ? clockOutMutation.mutate() : clockInMutation.mutate()}
                    disabled={clockInMutation.isPending || clockOutMutation.isPending}
                    className={`w-full h-12 font-bold text-lg ${
                      clockedIn
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-[#1a9c5b] hover:bg-[#158a4e]'
                    }`}
                  >
                    {clockedIn ? 'Clock Out' : 'Clock In'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Shift */}
            {todayShifts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Today's Shift</CardTitle>
                </CardHeader>
                <CardContent>
                  {todayShifts.map(shift => (
                    <div key={shift.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-[#1a9c5b]" />
                        <span className="font-medium">{shift.shift_start} - {shift.shift_end}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-[#1a9c5b]" />
                        <span>{shift.location_name}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 w-full justify-center text-xs">
                        {shift.status || 'Scheduled'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {todayShifts.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500 text-sm">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No shift scheduled for today</p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="border-2">
                <MessageSquare className="w-4 h-4 mr-2" />
                Request Swap
              </Button>
              <Button variant="outline" className="border-2">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Call In Sick
              </Button>
            </div>
          </div>
        )}

        {/* Schedule */}
        {tab === "schedule" && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-900">Your Schedule</h2>
            {allShifts.length > 0 ? (
              allShifts.map(shift => (
                <Card key={shift.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">{shift.location_name}</p>
                        <p className="text-xs text-gray-500">{new Date(shift.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-700">{shift.shift_start} - {shift.shift_end}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500 text-sm">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming shifts</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Chat */}
        {tab === "chat" && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-900">Team Chat</h2>
            <Button className="w-full bg-[#1a9c5b] hover:bg-[#158a4e]">
              <MessageSquare className="w-4 h-4 mr-2" />
              Open Chat
            </Button>
            <Card>
              <CardContent className="pt-4 text-center text-gray-500 text-sm">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Team chat coming soon</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerts */}
        {tab === "alerts" && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-900">Alerts & Notifications</h2>
            <Card>
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Certification Expiring Soon</p>
                    <p className="text-gray-600 text-xs mt-0.5">Your CPR expires in 7 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Schedule Updated</p>
                    <p className="text-gray-600 text-xs mt-0.5">Your shift for Friday is confirmed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="flex justify-around">
          {[
            { id: "dashboard", label: "Home", icon: Clock },
            { id: "schedule", label: "Schedule", icon: Calendar },
            { id: "chat", label: "Chat", icon: MessageSquare },
            { id: "alerts", label: "Alerts", icon: Bell }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center gap-1 py-3 px-4 text-xs font-medium flex-1 transition-colors ${
                  tab === t.id
                    ? "text-[#1a9c5b]"
                    : "text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}