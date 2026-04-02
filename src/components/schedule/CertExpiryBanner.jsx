import React, { useMemo } from "react";
import { ShieldAlert, X } from "lucide-react";
import { useState } from "react";

export default function CertExpiryBanner({ certifications, employees, weekDates }) {
  const [dismissed, setDismissed] = useState(false);

  const expiring = useMemo(() => {
    const today = new Date();
    const in30 = new Date(today); in30.setDate(today.getDate() + 30);
    const todayStr = today.toISOString().split("T")[0];
    const in30Str = in30.toISOString().split("T")[0];

    const results = [];
    for (const cert of certifications) {
      if (!cert.expiry_date) continue;
      if (cert.expiry_date < todayStr) {
        // Expired
        const emp = employees.find(e => e.id === cert.employee_id);
        if (emp) results.push({ name: `${emp.first_name} ${emp.last_name}`, cert: cert.name, days: null, expired: true });
      } else if (cert.expiry_date <= in30Str) {
        const days = Math.ceil((new Date(cert.expiry_date) - today) / 86400000);
        const emp = employees.find(e => e.id === cert.employee_id);
        if (emp) results.push({ name: `${emp.first_name} ${emp.last_name}`, cert: cert.name, days, expired: false });
      }
    }
    // Deduplicate by employee+cert
    const seen = new Set();
    return results.filter(r => {
      const key = `${r.name}-${r.cert}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [certifications, employees]);

  if (dismissed || expiring.length === 0) return null;

  const hasExpired = expiring.some(e => e.expired);

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${hasExpired ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
      <ShieldAlert className={`w-4 h-4 mt-0.5 flex-shrink-0 ${hasExpired ? "text-red-500" : "text-amber-600"}`} />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${hasExpired ? "text-red-800" : "text-amber-800"}`}>
          {hasExpired ? "🚨 Expired certifications on active staff" : "⚠️ Certifications expiring within 30 days"}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
          {expiring.map((e, i) => (
            <span key={i} className={`text-xs ${e.expired ? "text-red-700 font-semibold" : "text-amber-700"}`}>
              {e.name} — {e.cert} {e.expired ? "(EXPIRED)" : `(${e.days}d left)`}
            </span>
          ))}
        </div>
      </div>
      <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}