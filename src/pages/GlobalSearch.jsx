import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users, CalendarDays, AlertTriangle, Award, MapPin, Loader2, X } from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = [
  { key: "employees", label: "Employees", icon: Users, color: "text-blue-500 bg-blue-50", page: "Employees" },
  { key: "shifts", label: "Shifts", icon: CalendarDays, color: "text-green-500 bg-green-50", page: "Schedule" },
  { key: "incidents", label: "Incidents", icon: AlertTriangle, color: "text-red-500 bg-red-50", page: "IncidentLogs" },
  { key: "certifications", label: "Certifications", icon: Award, color: "text-purple-500 bg-purple-50", page: "Certifications" },
  { key: "locations", label: "Locations", icon: MapPin, color: "text-orange-500 bg-orange-50", page: "Locations" },
];

function safeFormat(d) {
  if (!d) return "";
  try { return format(new Date(d), "MMM d, yyyy"); } catch { return String(d); }
}

async function doSearch(q) {
  const lower = q.toLowerCase();
  const [employees, shifts, incidents, certs, locations] = await Promise.all([
    base44.entities.Employee.list("-created_date", 50).catch(() => []),
    base44.entities.Shift.list("-date", 50).catch(() => []),
    base44.entities.IncidentLog.list("-created_date", 50).catch(() => []),
    base44.entities.Certification.list("-created_date", 50).catch(() => []),
    base44.entities.Location.list("-created_date", 50).catch(() => []),
  ]);
  return {
    employees: employees.filter(e => `${e.first_name} ${e.last_name} ${e.email} ${e.role}`.toLowerCase().includes(lower))
      .map(e => ({ id: e.id, title: `${e.first_name} ${e.last_name}`, sub: `${e.role?.replace("_"," ")} · ${e.email||""}`, category: "employees" })),
    shifts: shifts.filter(s => `${s.employee_name} ${s.location_name} ${s.date} ${s.status}`.toLowerCase().includes(lower))
      .map(s => ({ id: s.id, title: `${s.employee_name||"Open Shift"} — ${s.location_name}`, sub: `${safeFormat(s.date)} ${s.start_time}–${s.end_time} · ${s.status}`, category: "shifts" })),
    incidents: incidents.filter(i => `${i.description} ${i.type} ${i.location_name}`.toLowerCase().includes(lower))
      .map(i => ({ id: i.id, title: `${i.type?.replace("_"," ")} — ${i.severity}`, sub: `${i.location_name} · ${i.date||""}`, category: "incidents" })),
    certifications: certs.filter(c => `${c.employee_name} ${c.name} ${c.certification_type}`.toLowerCase().includes(lower))
      .map(c => ({ id: c.id, title: `${c.employee_name} — ${c.name||c.certification_type}`, sub: `Expires ${safeFormat(c.expiry_date)}`, category: "certifications" })),
    locations: locations.filter(l => `${l.name} ${l.address} ${l.type}`.toLowerCase().includes(lower))
      .map(l => ({ id: l.id, title: l.name, sub: `${l.type} · ${l.status}`, category: "locations" })),
  };
}

export default function GlobalSearch() {
  const loc = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const initial = new URLSearchParams(loc.search).get("q") || "";
  const [query, setQuery] = useState(initial);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  // Focus on mount, "/" shortcut
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const runSearch = useCallback(async (q) => {
    if (q.trim().length < 2) { setGrouped({}); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    const results = await doSearch(q.trim());
    setGrouped(results);
    setLoading(false);
  }, []);

  // Run on mount if initial query exists
  useEffect(() => { if (initial) runSearch(initial); }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), 300);
  };

  const totalCount = Object.values(grouped).reduce((s, a) => s + (a?.length || 0), 0);

  const visibleCategories = CATEGORIES.filter(c => (grouped[c.key]?.length || 0) > 0);
  const displayResults = activeCategory === "all"
    ? CATEGORIES.flatMap(c => (grouped[c.key] || []).map(r => ({ ...r, categoryMeta: c })))
    : (grouped[activeCategory] || []).map(r => ({ ...r, categoryMeta: CATEGORIES.find(c => c.key === activeCategory) }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-7 h-7 text-[#1a9c5b]" />
            Global Search
          </h1>
          <p className="text-gray-500 text-sm mt-1">Search across Employees, Shifts, Incidents, Certifications, and Locations. Press <kbd className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">/</kbd> to focus.</p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search anything..."
            className="w-full pl-12 pr-10 py-3.5 text-base bg-white border border-gray-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-[#1a9c5b]/30 focus:border-[#1a9c5b]"
            aria-label="Global search"
          />
          {query && (
            <button onClick={() => { setQuery(""); setGrouped({}); setSearched(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category filter tabs */}
        {searched && !loading && totalCount > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeCategory === "all" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              All ({totalCount})
            </button>
            {visibleCategories.map(c => (
              <button
                key={c.key}
                onClick={() => setActiveCategory(c.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeCategory === c.key ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <c.icon className="w-3 h-3" />
                {c.label} ({grouped[c.key]?.length || 0})
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center py-16 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a9c5b] mx-auto" />
            <p className="text-gray-500">Searching…</p>
          </div>
        ) : searched && totalCount === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No results for "<strong>{query}</strong>"</p>
            <p className="text-gray-400 text-sm mt-2">Try different keywords or check your spelling.</p>
          </div>
        ) : searched && displayResults.length > 0 ? (
          <div className="space-y-2">
            {(() => {
              let lastCat = null;
              return displayResults.map((item, idx) => {
                const Icon = item.categoryMeta.icon;
                const showHeader = activeCategory === "all" && item.category !== lastCat;
                lastCat = item.category;
                return (
                  <React.Fragment key={`${item.id}-${idx}`}>
                    {showHeader && (
                      <div className="flex items-center gap-2 pt-3 pb-1">
                        <Icon className={`w-4 h-4 ${item.categoryMeta.color.split(" ")[0]}`} />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{item.categoryMeta.label}</span>
                      </div>
                    )}
                    <button
                      onClick={() => navigate(createPageUrl(item.categoryMeta.page))}
                      className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#1a9c5b] hover:shadow-sm transition-all text-left"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.categoryMeta.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{item.sub}</p>
                      </div>
                      <span className="text-gray-300 flex-shrink-0">→</span>
                    </button>
                  </React.Fragment>
                );
              });
            })()}
          </div>
        ) : !searched ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Start typing to search</p>
            <p className="text-gray-400 text-sm mt-2">Searches Employees, Shifts, Incidents, Certifications & Locations</p>
            <div className="flex justify-center gap-4 mt-6">
              {CATEGORIES.map(c => (
                <div key={c.key} className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.color}`}>
                    <c.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-gray-400">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}