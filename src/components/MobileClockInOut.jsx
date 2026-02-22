import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function MobileClockInOut() {
  const [clockEntries, setClockEntries] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [clockedIn, setClockedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);

        // Get today's shifts for this employee
        const today = format(new Date(), "yyyy-MM-dd");
        const shifts = await base44.entities.Shift.filter({
          employee_id: u.id,
          date: today
        });
        if (shifts.length > 0) {
          setCurrentShift(shifts[0]);
        }

        // Get clock entries for today
        const entries = await base44.entities.ClockEntry.filter({
          employee_id: u.id,
          date: today
        });
        setClockEntries(entries);
        setClockedIn(entries.length % 2 === 1); // Odd number = clocked in
      } catch (e) {
        console.error("Error loading clock data:", e);
      }
    };
    init();
  }, []);

  const handleClockInOut = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const now = format(new Date(), "HH:mm:ss");

      await base44.entities.ClockEntry.create({
        employee_id: user.id,
        employee_name: user.full_name,
        employee_email: user.email,
        date: today,
        time: now,
        type: clockedIn ? "out" : "in",
        location_id: currentShift?.location_id || "",
        location_name: currentShift?.location_name || ""
      });

      // Refresh
      const entries = await base44.entities.ClockEntry.filter({
        employee_id: user.id,
        date: today
      });
      setClockEntries(entries);
      setClockedIn(entries.length % 2 === 1);
    } catch (error) {
      console.error("Clock error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      {/* Current Status */}
      <div className={`rounded-xl p-6 text-center ${clockedIn ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
        <div className="flex justify-center mb-3">
          {clockedIn ? (
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          ) : (
            <Clock className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <p className={`text-sm font-semibold ${clockedIn ? 'text-green-700' : 'text-gray-600'}`}>
          {clockedIn ? 'Clocked In' : 'Clocked Out'}
        </p>
        {currentShift && (
          <p className="text-xs text-gray-500 mt-2">
            {currentShift.location_name} • {currentShift.start_time} - {currentShift.end_time}
          </p>
        )}
      </div>

      {/* Clock Button */}
      <Button
        onClick={handleClockInOut}
        disabled={loading}
        className={`w-full h-14 text-lg font-bold rounded-xl ${
          clockedIn
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-[#1a9c5b] hover:bg-[#158a4e] text-white'
        }`}
      >
        {loading ? 'Processing...' : clockedIn ? 'Clock Out' : 'Clock In'}
      </Button>

      {/* Today's Entries */}
      {clockEntries.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="font-semibold text-sm text-gray-900 mb-3">Today's Log</h4>
          <div className="space-y-2">
            {clockEntries.map((entry, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {entry.type === 'in' ? 'Clock In' : 'Clock Out'}
                </span>
                <span className="font-mono text-gray-900">{entry.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}