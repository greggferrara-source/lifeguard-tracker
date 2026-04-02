import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clock, MapPin, AlertTriangle, CheckCircle, Wifi, WifiOff, FileText, Bell, LogIn, LogOut } from "lucide-react";
import { format } from "date-fns";

const OFFLINE_QUEUE_KEY = "guard_offline_queue";

function getQueue() {
  try { return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]"); } catch { return []; }
}
function saveQueue(q) { localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q)); }

export default function MobileGuardDashboard() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState(getQueue());
  const [clockedIn, setClockedIn] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [logText, setLogText] = useState("");
  const [logType, setLogType] = useState("incident");
  const [logSeverity, setLogSeverity] = useState("minor");
  const [tab, setTab] = useState("clock"); // clock | log | alerts
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list(), enabled: isOnline });
  const { data: alerts = [] } = useQuery({ queryKey: ["urgent-alerts-mobile"], queryFn: () => base44.entities.UrgentAlert.filter({ status: "active" }), refetchInterval: 30000, enabled: isOnline });
  const { data: myEntry } = useQuery({
    queryKey: ["my-clock-entry"],
    queryFn: async () => {
      const entries = await base44.entities.ClockEntry.filter({ status: "clocked_in" });
      return entries.find(e => e.employee_email === user?.email) || null;
    },
    enabled: isOnline && !!user,
  });

  useEffect(() => {
    if (myEntry) setClockedIn(myEntry);
  }, [myEntry]);

  useEffect(() => {
    const onOnline = () => { setIsOnline(true); syncQueue(); };
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  const addToQueue = (action) => {
    const newQ = [...queue, { ...action, queued_at: new Date().toISOString(), id: Date.now() }];
    setQueue(newQ);
    saveQueue(newQ);
  };

  const syncQueue = async () => {
    const q = getQueue();
    if (q.length === 0) return;
    setSyncing(true);
    const remaining = [];
    for (const item of q) {
      try {
        if (item.type === "clock_in") {
          await base44.entities.ClockEntry.create(item.data);
        } else if (item.type === "clock_out") {
          await base44.entities.ClockEntry.update(item.entry_id, item.data);
        } else if (item.type === "incident_log") {
          await base44.entities.IncidentLog.create(item.data);
        }
      } catch {
        remaining.push(item);
      }
    }
    setQueue(remaining);
    saveQueue(remaining);
    setSyncing(false);
    queryClient.invalidateQueries();
  };

  const getGPS = () => new Promise((res) => {
    if (!navigator.geolocation) return res({ lat: null, lng: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => res({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => res({ lat: null, lng: null }),
      { timeout: 5000 }
    );
  });

  const handleClockIn = async () => {
    if (!selectedLocation) return;
    const loc = locations.find(l => l.id === selectedLocation);
    const { lat, lng } = await getGPS();
    const data = {
      employee_id: user?.id || "offline",
      employee_name: user?.full_name || "Unknown",
      employee_email: user?.email,
      location_id: selectedLocation,
      location_name: loc?.name,
      clock_in: new Date().toISOString(),
      clock_in_latitude: lat,
      clock_in_longitude: lng,
      status: "clocked_in",
    };
    if (isOnline) {
      const entry = await base44.entities.ClockEntry.create(data);
      setClockedIn(entry);
      queryClient.invalidateQueries();
    } else {
      addToQueue({ type: "clock_in", data });
      setClockedIn({ ...data, id: "offline_" + Date.now() });
    }
  };

  const handleClockOut = async () => {
    if (!clockedIn) return;
    const { lat, lng } = await getGPS();
    const now = new Date().toISOString();
    const mins = Math.floor((Date.now() - new Date(clockedIn.clock_in).getTime()) / 60000);
    const data = { clock_out: now, clock_out_latitude: lat, clock_out_longitude: lng, status: "clocked_out", total_minutes: mins };
    if (isOnline && !clockedIn.id?.startsWith("offline_")) {
      await base44.entities.ClockEntry.update(clockedIn.id, data);
      queryClient.invalidateQueries();
    } else {
      addToQueue({ type: "clock_out", entry_id: clockedIn.id, data });
    }
    setClockedIn(null);
  };

  const handleSubmitLog = async () => {
    if (!logText.trim()) return;
    const data = {
      location_id: clockedIn?.location_id || selectedLocation,
      location_name: clockedIn?.location_name || "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      type: logType,
      severity: logSeverity,
      description: logText,
      reporting_staff_name: user?.full_name,
      reporting_staff_email: user?.email,
      status: "open",
    };
    if (isOnline) {
      await base44.entities.IncidentLog.create(data);
    } else {
      addToQueue({ type: "incident_log", data });
    }
    setLogText("");
    setLogType("incident");
    setLogSeverity("minor");
  };

  const minutesOnDuty = clockedIn ? Math.floor((Date.now() - new Date(clockedIn.clock_in).getTime()) / 60000) : 0;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a9c5b] text-white px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-base">Guard Dashboard</div>
            <div className="text-xs opacity-80">{user?.full_name || "Loading..."}</div>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <Badge className="bg-orange-500 text-white text-xs">{queue.length} queued</Badge>
            )}
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4 text-yellow-300" />}
          </div>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="mt-2 bg-yellow-500 text-yellow-900 text-xs rounded px-2 py-1 font-medium">
            ⚠️ Offline — actions will sync when you reconnect
          </div>
        )}

        {/* Sync button */}
        {isOnline && queue.length > 0 && (
          <button onClick={syncQueue} className="mt-2 w-full bg-white/20 hover:bg-white/30 rounded text-xs py-1 font-medium">
            {syncing ? "Syncing..." : `Sync ${queue.length} offline action(s)`}
          </button>
        )}
      </div>

      {/* Status Card */}
      <div className="p-4">
        <Card className={`border-2 ${clockedIn ? "border-green-400 bg-green-50" : "border-gray-200"}`}>
          <CardContent className="py-4">
            {clockedIn ? (
              <div className="text-center space-y-1">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                <div className="font-bold text-green-800">Clocked In</div>
                <div className="text-sm text-green-700">{clockedIn.location_name}</div>
                <div className="text-xs text-green-600">{Math.floor(minutesOnDuty / 60)}h {minutesOnDuty % 60}m on duty</div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-1" />
                <div className="text-sm">Not clocked in</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4">
        {[
          { id: "clock", label: "Clock In/Out", icon: Clock },
          { id: "log", label: "Log Incident", icon: FileText },
          { id: "alerts", label: "Alerts", icon: Bell },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-0.5 border-b-2 transition-colors ${tab === t.id ? "border-[#1a9c5b] text-[#1a9c5b]" : "border-transparent text-gray-500"}`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4">
        {tab === "clock" && (
          <>
            {!clockedIn && (
              <div className="space-y-3">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger><SelectValue placeholder="Select your location..." /></SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={handleClockIn} disabled={!selectedLocation} className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] h-14 text-base">
                  <LogIn className="w-5 h-5 mr-2" /> Clock In
                </Button>
              </div>
            )}
            {clockedIn && (
              <Button onClick={handleClockOut} variant="destructive" className="w-full h-14 text-base">
                <LogOut className="w-5 h-5 mr-2" /> Clock Out
              </Button>
            )}
            {queue.length > 0 && (
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="py-3">
                  <p className="text-xs font-semibold text-orange-700 mb-1">Offline Queue ({queue.length} items)</p>
                  {queue.map(item => (
                    <div key={item.id} className="text-xs text-orange-600">• {item.type.replace(/_/g, " ")} — {format(new Date(item.queued_at), "HH:mm")}</div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {tab === "log" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Log an incident or observation. Will sync when online.</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Type *</p>
                <select
                  value={logType}
                  onChange={e => setLogType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="rescue">🚨 Rescue</option>
                  <option value="injury">🩹 Injury</option>
                  <option value="incident">⚠️ Incident</option>
                  <option value="near_miss">⚡ Near Miss</option>
                  <option value="first_aid">➕ First Aid</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Severity *</p>
                <select
                  value={logSeverity}
                  onChange={e => setLogSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="serious">Serious</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            {(logType === "rescue" || logSeverity === "critical" || logSeverity === "serious") && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Critical/rescue — ensure emergency protocols are active.
              </div>
            )}
            <Textarea
              placeholder="Describe exactly what happened..."
              value={logText}
              onChange={e => setLogText(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <Button onClick={handleSubmitLog} disabled={!logText.trim()} className="w-full bg-orange-600 hover:bg-orange-700">
              <FileText className="w-4 h-4 mr-2" />
              {isOnline ? "Submit Log" : "Queue Log (Offline)"}
            </Button>
          </div>
        )}

        {tab === "alerts" && (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Bell className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">No active alerts</p>
              </div>
            ) : (
              alerts.map(alert => (
                <Card key={alert.id} className="border-red-300 bg-red-50">
                  <CardContent className="py-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-sm text-red-800">{alert.title}</div>
                        <div className="text-xs text-red-700 mt-0.5">{alert.message}</div>
                        <div className="text-xs text-red-500 mt-1">{alert.location_name}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}