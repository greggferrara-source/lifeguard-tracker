import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Users, CalendarDays, AlertTriangle, Award, MapPin, Loader2 } from "lucide-react";

const CATEGORIES = [
  { key: "employees", label: "Employees", icon: Users, page: "Employees", color: "text-blue-600 bg-blue-50" },
  { key: "shifts", label: "Shifts", icon: CalendarDays, page: "Schedule", color: "text-green-600 bg-green-50" },
  { key: "incidents", label: "Incidents", icon: AlertTriangle, page: "IncidentLogs", color: "text-red-600 bg-red-50" },
  { key: "certifications", label: "Certifications", icon: Award, page: "Certifications", color: "text-purple-600 bg-purple-50" },
  { key: "locations", label: "Locations", icon: MapPin, page: "Locations", color: "text-amber-600 bg-amber-50" },
];

function searchInData(query, employees, shifts, incidents, certifications, locations) {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  const results = [];

  employees?.slice(0, 50).forEach(e => {
    const name = `${e.first_name || ""} ${e.last_name || ""}`.toLowerCase();
    const email = (e.email || "").toLowerCase();
    const role = (e.role || "").toLowerCase();
    if (name.includes(q) || email.includes(q) || role.includes(q)) {
      results.push({
        category: "employees",
        id: e.id,
        title: `${e.first_name} ${e.last_name}`,
        subtitle: `${e.role?.replace("_", " ")} · ${e.email || ""}`,
        page: "Employees",
        icon: Users,
        color: "text-blue-600 bg-blue-50",
      });
    }
  });

  shifts?.slice(0, 50).forEach(s => {
    const empName = (s.employee_name || "").toLowerCase();
    const locName = (s.location_name || "").toLowerCase();
    const date = (s.date || "").toLowerCase();
    if (empName.includes(q) || locName.includes(q) || date.includes(q)) {
      results.push({
        category: "shifts",
        id: s.id,
        title: `${s.employee_name || "Open Shift"} — ${s.date}`,
        subtitle: `${s.start_time}–${s.end_time} · ${s.location_name}`,
        page: "Schedule",
        icon: CalendarDays,
        color: "text-green-600 bg-green-50",
      });
    }
  });

  incidents?.slice(0, 50).forEach(inc => {
    const desc = (inc.description || "").toLowerCase();
    const type = (inc.type || "").toLowerCase();
    const loc = (inc.location_name || "").toLowerCase();
    if (desc.includes(q) || type.includes(q) || loc.includes(q)) {
      results.push({
        category: "incidents",
        id: inc.id,
        title: `${inc.type?.replace("_", " ")} — ${inc.location_name || ""}`,
        subtitle: `${inc.severity} · ${inc.date || ""}`,
        page: "IncidentLogs",
        icon: AlertTriangle,
        color: "text-red-600 bg-red-50",
      });
    }
  });

  certifications?.slice(0, 50).forEach(c => {
    const name = (c.name || c.certification_type || "").toLowerCase();
    const empName = (c.employee_name || "").toLowerCase();
    if (name.includes(q) || empName.includes(q)) {
      results.push({
        category: "certifications",
        id: c.id,
        title: `${c.name || c.certification_type} — ${c.employee_name || ""}`,
        subtitle: `Expires: ${c.expiry_date || "—"} · ${c.status || ""}`,
        page: "Certifications",
        icon: Award,
        color: "text-purple-600 bg-purple-50",
      });
    }
  });

  locations?.forEach(l => {
    const lname = (l.name || "").toLowerCase();
    const address = (l.address || "").toLowerCase();
    if (lname.includes(q) || address.includes(q)) {
      results.push({
        category: "locations",
        id: l.id,
        title: l.name,
        subtitle: `${l.type} · ${l.address || ""}`,
        page: "Locations",
        icon: MapPin,
        color: "text-amber-600 bg-amber-50",
      });
    }
  });

  return results.slice(0, 20);
}

export default function GlobalSearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.filter({ status: "active" }, "-created_date", 50), staleTime: 60000 });
  const { data: shifts = [] } = useQuery({ queryKey: ["shifts"], queryFn: () => base44.entities.Shift.list("-date", 50), staleTime: 60000 });
  const { data: incidents = [] } = useQuery({ queryKey: ["incident-logs"], queryFn: () => base44.entities.IncidentLog.list("-created_date", 50), staleTime: 60000 });
  const { data: certifications = [] } = useQuery({ queryKey: ["certifications"], queryFn: () => base44.entities.Certification.list("-created_date", 50), staleTime: 60000 });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list(), staleTime: 60000 });

  const rawResults = query.length >= 2
    ? searchInData(query, employees, shifts, incidents, certifications, locations)
    : [];

  const filtered = activeCategory === "all" ? rawResults : rawResults.filter(r => r.category === activeCategory);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = rawResults.filter(r => r.category === cat.key);
    if (items.length > 0) acc[cat.key] = items;
    return acc;
  }, {});

  // Keyboard shortcut: press / to open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (result) => {
    navigate(createPageUrl(result.page));
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search trigger button */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-[#1a9c5b]/40 transition-all text-sm text-gray-400 group"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden md:block">Search...</span>
        <kbd className="hidden md:block text-[10px] bg-white border border-gray-200 rounded px-1 py-0.5 text-gray-300 group-hover:border-[#1a9c5b]/30">
          /
        </kbd>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[480px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search employees, shifts, incidents..."
              className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="text-[10px] bg-gray-100 rounded px-1.5 py-0.5 text-gray-400">Esc</kbd>
          </div>

          {/* Category pills */}
          {rawResults.length > 0 && (
            <div className="flex gap-1.5 px-4 py-2 border-b border-gray-100 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${activeCategory === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                All ({rawResults.length})
              </button>
              {CATEGORIES.filter(c => grouped[c.key]).map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${activeCategory === cat.key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {cat.label} ({grouped[cat.key].length})
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {query.length < 2 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                Type at least 2 characters to search
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No results for "<span className="font-medium text-gray-600">{query}</span>"
              </div>
            ) : (
              <div className="py-1">
                {activeCategory === "all"
                  ? CATEGORIES.filter(c => grouped[c.key]).map(cat => (
                    <div key={cat.key}>
                      <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <cat.icon className="w-3 h-3" />
                        {cat.label}
                      </div>
                      {grouped[cat.key].map((r, i) => (
                        <ResultItem key={`${cat.key}-${i}`} result={r} onSelect={handleSelect} />
                      ))}
                    </div>
                  ))
                  : filtered.map((r, i) => (
                    <ResultItem key={i} result={r} onSelect={handleSelect} />
                  ))
                }
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultItem({ result, onSelect }) {
  const Icon = result.icon;
  return (
    <button
      onClick={() => onSelect(result)}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${result.color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
        <p className="text-xs text-gray-400 truncate">{result.subtitle}</p>
      </div>
      <span className="text-gray-300 text-xs flex-shrink-0">→</span>
    </button>
  );
}