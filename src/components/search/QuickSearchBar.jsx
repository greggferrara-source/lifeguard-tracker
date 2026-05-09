import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Search, Users, CalendarDays, AlertTriangle, Award, MapPin, X, Loader2 } from "lucide-react";
import { format } from "date-fns";

const CATEGORY_CONFIG = {
  employees: { label: "Employees", icon: Users, color: "text-blue-500", page: "Employees" },
  shifts: { label: "Shifts", icon: CalendarDays, color: "text-green-500", page: "Schedule" },
  incidents: { label: "Incidents", icon: AlertTriangle, color: "text-red-500", page: "IncidentLogs" },
  certifications: { label: "Certifications", icon: Award, color: "text-purple-500", page: "Certifications" },
  locations: { label: "Locations", icon: MapPin, color: "text-orange-500", page: "Locations" },
};

function safeFormat(dateStr) {
  if (!dateStr) return "";
  try { return format(new Date(dateStr), "MMM d, yyyy"); } catch { return dateStr; }
}

async function searchAll(q) {
  const lower = q.toLowerCase();
  const [employees, shifts, incidents, certifications, locations] = await Promise.all([
    base44.entities.Employee.list("-created_date", 50).catch(() => []),
    base44.entities.Shift.list("-date", 50).catch(() => []),
    base44.entities.IncidentLog.list("-created_date", 50).catch(() => []),
    base44.entities.Certification.list("-created_date", 50).catch(() => []),
    base44.entities.Location.list("-created_date", 50).catch(() => []),
  ]);

  return {
    employees: employees.filter(e =>
      `${e.first_name} ${e.last_name} ${e.email} ${e.role}`.toLowerCase().includes(lower)
    ).slice(0, 5).map(e => ({
      id: e.id, category: "employees",
      title: `${e.first_name} ${e.last_name}`,
      subtitle: `${e.role?.replace("_", " ")} • ${e.email || ""}`,
    })),
    shifts: shifts.filter(s =>
      `${s.employee_name} ${s.location_name} ${s.date} ${s.status}`.toLowerCase().includes(lower)
    ).slice(0, 5).map(s => ({
      id: s.id, category: "shifts",
      title: `${s.employee_name || "Open Shift"} — ${s.location_name}`,
      subtitle: `${safeFormat(s.date)} ${s.start_time}–${s.end_time} · ${s.status}`,
    })),
    incidents: incidents.filter(i =>
      `${i.description} ${i.type} ${i.location_name} ${i.reporting_staff_name}`.toLowerCase().includes(lower)
    ).slice(0, 5).map(i => ({
      id: i.id, category: "incidents",
      title: `${i.type?.replace("_", " ")} — ${i.severity}`,
      subtitle: `${i.location_name} · ${i.date || ""}`,
    })),
    certifications: certifications.filter(c =>
      `${c.employee_name} ${c.name} ${c.type}`.toLowerCase().includes(lower)
    ).slice(0, 5).map(c => ({
      id: c.id, category: "certifications",
      title: `${c.employee_name} — ${c.name || c.certification_type}`,
      subtitle: `Expires ${safeFormat(c.expiry_date)}`,
    })),
    locations: locations.filter(l =>
      `${l.name} ${l.address} ${l.type}`.toLowerCase().includes(lower)
    ).slice(0, 5).map(l => ({
      id: l.id, category: "locations",
      title: l.name,
      subtitle: `${l.type} · ${l.status}`,
    })),
  };
}

export default function QuickSearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [grouped, setGrouped] = useState({});
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // "/" shortcut to focus
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setGrouped({}); setOpen(val.length > 0); return; }
    setOpen(true);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchAll(val.trim());
      setGrouped(results);
      setLoading(false);
    }, 280);
  }, []);

  const handleSelect = (item) => {
    navigate(createPageUrl(CATEGORY_CONFIG[item.category].page));
    setQuery("");
    setOpen(false);
  };

  const totalResults = Object.values(grouped).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  const hasResults = totalResults > 0;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length > 0 && setOpen(true)}
          placeholder='Search… press "/"'
          className="w-48 lg:w-64 pl-8 pr-7 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a9c5b]/30 focus:border-[#1a9c5b] transition-all"
          aria-label="Global search"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setGrouped({}); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-1.5 right-0 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching…
            </div>
          ) : query.trim().length < 2 ? (
            <div className="px-4 py-3 text-xs text-gray-400">
              Type at least 2 characters to search. Press <kbd className="bg-gray-100 px-1 rounded text-gray-600 font-mono">/</kbd> to focus.
            </div>
          ) : !hasResults ? (
            <div className="px-4 py-6 text-center">
              <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No results for <strong>"{query}"</strong></p>
              <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto py-2">
              {Object.entries(grouped).map(([category, items]) => {
                if (!items || items.length === 0) return null;
                const cfg = CATEGORY_CONFIG[category];
                const Icon = cfg.icon;
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 px-4 py-1.5">
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{cfg.label}</span>
                    </div>
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-gray-100`}>
                          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
              <div className="border-t border-gray-100 mt-1 px-4 py-2">
                <button
                  onClick={() => { navigate(createPageUrl("GlobalSearch") + `?q=${encodeURIComponent(query)}`); setOpen(false); }}
                  className="text-xs text-[#1a9c5b] hover:underline font-medium"
                >
                  View all results for "{query}" →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}