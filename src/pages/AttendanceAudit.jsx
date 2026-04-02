import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Clock, AlertTriangle, CheckCircle2, XCircle, Search, Filter,
  MapPin, RefreshCw, ChevronDown, ChevronUp, StickyNote, Eye,
} from "lucide-react";
import { format, parseISO, differenceInMinutes, startOfWeek, endOfWeek, subWeeks } from "date-fns";

const FLAG_CONFIG = {
  none: { label: "On Time", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  late: { label: "Late", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  early_out: { label: "Early Out", color: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock },
  no_show: { label: "No Show", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  location_mismatch: { label: "Wrong Location", color: "bg-purple-100 text-purple-700 border-purple-200", icon: MapPin },
  overtime: { label: "Overtime", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
};

function computeDiscrepancy(entry) {
  if (!entry.shift_start || !entry.shift_date) return { flag: "none", minutes: 0 };
  const scheduled = new Date(`${entry.shift_date}T${entry.shift_start}`);
  const clockIn = parseISO(entry.clock_in);
  const lateMinutes = differenceInMinutes(clockIn, scheduled);

  if (lateMinutes > 10) return { flag: "late", minutes: lateMinutes };

  if (entry.shift_end && entry.clock_out) {
    const scheduledEnd = new Date(`${entry.shift_date}T${entry.shift_end}`);
    const clockOut = parseISO(entry.clock_out);
    const earlyMinutes = differenceInMinutes(scheduledEnd, clockOut);
    if (earlyMinutes > 10) return { flag: "early_out", minutes: earlyMinutes };
  }

  if (entry.clock_in_verified === false && entry.clock_in_distance_meters > 200) {
    return { flag: "location_mismatch", minutes: 0 };
  }

  return { flag: "none", minutes: 0 };
}

function StatCard({ icon: Icon, label, value, color = "text-gray-900", bg = "bg-white" }) {
  return (
    <Card className={`${bg} border border-gray-100`}>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AuditRow({ entry, shifts, onReview }) {
  const [expanded, setExpanded] = useState(false);
  const [noteText, setNoteText] = useState(entry.manager_notes || "");
  const queryClient = useQueryClient();

  const matchedShift = shifts.find(s => s.id === entry.shift_id);
  const { flag, minutes } = entry.discrepancy_flag !== "none"
    ? { flag: entry.discrepancy_flag, minutes: entry.discrepancy_minutes || 0 }
    : computeDiscrepancy(entry);

  const flagCfg = FLAG_CONFIG[flag] || FLAG_CONFIG.none;
  const FlagIcon = flagCfg.icon;

  const saveNote = useMutation({
    mutationFn: () => base44.entities.ClockEntry.update(entry.id, {
      manager_reviewed: true,
      manager_notes: noteText,
      discrepancy_flag: flag,
      discrepancy_minutes: minutes,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clock-entries-audit"] });
      setExpanded(false);
    },
  });

  const durationMins = entry.clock_out
    ? differenceInMinutes(parseISO(entry.clock_out), parseISO(entry.clock_in))
    : null;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${entry.manager_reviewed ? "border-gray-100" : flag !== "none" ? "border-amber-200 bg-amber-50/30" : "border-gray-100"}`}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/80 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Name + date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900">{entry.employee_name}</span>
            <span className="text-xs text-gray-400">{entry.shift_date || format(parseISO(entry.clock_in), "yyyy-MM-dd")}</span>
            {entry.manager_reviewed && (
              <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-[10px] px-1.5 gap-0.5">
                <Eye className="w-2.5 h-2.5" /> Reviewed
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-500">{entry.location_name}</span>
            {entry.shift_start && (
              <span className="text-xs text-gray-400">
                Scheduled: {entry.shift_start}–{entry.shift_end || "?"}
              </span>
            )}
          </div>
        </div>

        {/* Clock times */}
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium text-gray-800">
            {format(parseISO(entry.clock_in), "HH:mm")}
            {entry.clock_out && ` → ${format(parseISO(entry.clock_out), "HH:mm")}`}
          </div>
          {durationMins !== null && (
            <div className="text-xs text-gray-400">
              {Math.floor(durationMins / 60)}h {durationMins % 60}m worked
            </div>
          )}
        </div>

        {/* Flag badge */}
        <Badge className={`${flagCfg.color} border text-xs gap-1 flex-shrink-0`}>
          <FlagIcon className="w-3 h-3" />
          {flagCfg.label}
          {minutes > 0 && ` (${minutes}m)`}
        </Badge>

        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-gray-400 font-medium mb-0.5">Clock In</p>
              <p className="font-semibold text-gray-800">{format(parseISO(entry.clock_in), "HH:mm:ss")}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium mb-0.5">Clock Out</p>
              <p className="font-semibold text-gray-800">{entry.clock_out ? format(parseISO(entry.clock_out), "HH:mm:ss") : "—"}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium mb-0.5">Geofence In</p>
              <p className={`font-semibold ${entry.clock_in_verified ? "text-green-600" : "text-red-500"}`}>
                {entry.clock_in_verified ? "✓ Verified" : entry.clock_in_latitude ? `✗ ${Math.round(entry.clock_in_distance_meters || 0)}m away` : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 font-medium mb-0.5">Total Worked</p>
              <p className="font-semibold text-gray-800">
                {durationMins !== null ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m` : "—"}
              </p>
            </div>
          </div>

          {entry.notes && (
            <div className="text-xs bg-gray-50 rounded-lg px-3 py-2">
              <span className="font-medium text-gray-600">Employee note: </span>
              <span className="text-gray-700">{entry.notes}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
              <StickyNote className="w-3.5 h-3.5" /> Manager Notes
            </p>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
              rows={2}
              placeholder="Add notes or explanation for this entry..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
            />
          </div>

          <Button
            size="sm"
            className="bg-[#1a9c5b] hover:bg-[#158a4e] text-xs gap-1.5"
            onClick={() => saveNote.mutate()}
            disabled={saveNote.isPending}
          >
            {saveNote.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
            Mark as Reviewed
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AttendanceAudit() {
  const [dateRange, setDateRange] = useState("this_week");
  const [filterFlag, setFilterFlag] = useState("all");
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });
  const { data: shifts = [] } = useQuery({ queryKey: ["shifts-audit"], queryFn: () => base44.entities.Shift.list("-date", 500) });

  const dateRangeFilter = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case "today": {
        const d = format(now, "yyyy-MM-dd");
        return { start: d, end: d };
      }
      case "this_week": {
        const s = startOfWeek(now, { weekStartsOn: 0 });
        const e = endOfWeek(now, { weekStartsOn: 0 });
        return { start: format(s, "yyyy-MM-dd"), end: format(e, "yyyy-MM-dd") };
      }
      case "last_week": {
        const s = startOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
        const e = endOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
        return { start: format(s, "yyyy-MM-dd"), end: format(e, "yyyy-MM-dd") };
      }
      default:
        return { start: format(subWeeks(now, 4), "yyyy-MM-dd"), end: format(now, "yyyy-MM-dd") };
    }
  }, [dateRange]);

  const { data: rawEntries = [], isLoading, refetch } = useQuery({
    queryKey: ["clock-entries-audit", dateRangeFilter],
    queryFn: () => base44.entities.ClockEntry.list("-clock_in", 500),
  });

  // Filter entries by date range
  const entries = useMemo(() => {
    return rawEntries.filter(e => {
      const d = e.shift_date || (e.clock_in ? format(parseISO(e.clock_in), "yyyy-MM-dd") : "");
      return d >= dateRangeFilter.start && d <= dateRangeFilter.end;
    });
  }, [rawEntries, dateRangeFilter]);

  // Detect no-shows: scheduled shifts with no clock entry
  const noShows = useMemo(() => {
    const entryShiftIds = new Set(entries.map(e => e.shift_id).filter(Boolean));
    return shifts.filter(s => {
      if (s.status === "cancelled" || s.status === "open") return false;
      if (!s.date || s.date < dateRangeFilter.start || s.date > dateRangeFilter.end) return false;
      if (!s.employee_id) return false;
      return !entryShiftIds.has(s.id);
    });
  }, [shifts, entries, dateRangeFilter]);

  const filtered = useMemo(() => {
    let list = [...entries];
    if (filterLocation !== "all") list = list.filter(e => e.location_id === filterLocation);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.employee_name?.toLowerCase().includes(q) || e.employee_email?.toLowerCase().includes(q));
    }
    if (filterFlag === "flagged") {
      list = list.filter(e => {
        const computed = computeDiscrepancy(e);
        return (e.discrepancy_flag !== "none" && e.discrepancy_flag) || computed.flag !== "none";
      });
    } else if (filterFlag === "unreviewed") {
      list = list.filter(e => !e.manager_reviewed);
    } else if (filterFlag !== "all") {
      list = list.filter(e => {
        const computed = computeDiscrepancy(e);
        return (e.discrepancy_flag || computed.flag) === filterFlag;
      });
    }
    return list;
  }, [entries, filterLocation, search, filterFlag]);

  // Stats
  const flaggedCount = useMemo(() => entries.filter(e => {
    const f = e.discrepancy_flag || computeDiscrepancy(e).flag;
    return f !== "none";
  }).length, [entries]);
  const unreviewedCount = useMemo(() => entries.filter(e => !e.manager_reviewed).length, [entries]);
  const lateCount = useMemo(() => entries.filter(e => {
    const f = e.discrepancy_flag || computeDiscrepancy(e).flag;
    return f === "late";
  }).length, [entries]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Audit</h1>
          <p className="text-sm text-gray-500 mt-0.5">Compare actual clock-in/out times against scheduled shifts</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 shrink-0">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Clock} label="Total Entries" value={entries.length} />
        <StatCard icon={AlertTriangle} label="Flagged Issues" value={flaggedCount} color="text-amber-600" />
        <StatCard icon={XCircle} label="No-Shows" value={noShows.length} color="text-red-600" />
        <StatCard icon={Eye} label="Awaiting Review" value={unreviewedCount} color="text-blue-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 w-48 text-sm"
          />
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="last_week">Last Week</SelectItem>
            <SelectItem value="all">All Recent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterFlag} onValueChange={setFilterFlag}>
          <SelectTrigger className="h-9 w-40 text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="flagged">Flagged Only</SelectItem>
            <SelectItem value="unreviewed">Unreviewed</SelectItem>
            <SelectItem value="none">On Time</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="early_out">Early Out</SelectItem>
            <SelectItem value="location_mismatch">Location Mismatch</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterLocation} onValueChange={setFilterLocation}>
          <SelectTrigger className="h-9 w-44 text-sm">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map(l => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* No-Shows Section */}
      {noShows.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-bold text-red-700 flex items-center gap-2">
              <XCircle className="w-4 h-4" /> No-Shows ({noShows.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-2">
            {noShows.slice(0, 10).map(shift => (
              <div key={shift.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-red-100">
                <div>
                  <span className="font-semibold text-sm text-gray-800">{shift.employee_name}</span>
                  <span className="text-xs text-gray-400 ml-2">{shift.date} · {shift.start_time}–{shift.end_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{shift.location_name}</span>
                  <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">No Show</Badge>
                </div>
              </div>
            ))}
            {noShows.length > 10 && (
              <p className="text-xs text-red-600 text-center">+{noShows.length - 10} more no-shows</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Entries List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">
            Clock Entries <span className="text-gray-400 font-normal">({filtered.length})</span>
          </p>
          {filterFlag !== "all" && (
            <button onClick={() => setFilterFlag("all")} className="text-xs text-green-600 hover:underline">Clear filter</button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium">No clock entries found</p>
            <p className="text-sm mt-1">Try adjusting your filters or date range</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(entry => (
              <AuditRow key={entry.id} entry={entry} shifts={shifts} onReview={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}