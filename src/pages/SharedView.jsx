import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Eye, Pencil, AlertTriangle, Clock, Lock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// Renders a generic key-value view of any record object
function RecordViewer({ data, label }) {
  const skip = ["id", "created_by"];
  const entries = Object.entries(data).filter(([k]) => !skip.includes(k));

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => {
        if (value === null || value === undefined || value === "") return null;
        const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        let display = value;
        if (typeof value === "boolean") display = value ? "Yes" : "No";
        else if (Array.isArray(value)) display = value.length === 0 ? "—" : value.map(v => typeof v === "object" ? JSON.stringify(v) : v).join(", ");
        else if (typeof value === "object") display = JSON.stringify(value, null, 2);
        else display = String(value);

        return (
          <div key={key} className="grid grid-cols-[180px_1fr] gap-3 py-2 border-b border-slate-100 last:border-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide pt-0.5">{label}</span>
            <span className="text-sm text-slate-800 break-words whitespace-pre-wrap">{display}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SharedView() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [shareLink, setShareLink] = useState(null);
  const [record, setRecord] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | valid | invalid | expired | disabled
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    loadSharedData();
  }, [token]);

  const loadSharedData = async () => {
    base44.auth.me().then(setUser).catch(() => {});

    const all = await base44.entities.SharedLink.list("-created_date", 200);
    const link = all.find(l => l.token === token);

    if (!link) { setStatus("invalid"); return; }
    if (!link.link_active) { setStatus("disabled"); return; }
    if (link.expires_at && new Date(link.expires_at) < new Date()) { setStatus("expired"); return; }

    setShareLink(link);

    // Load the actual record
    const entityName = link.record_type;
    const allRecords = await base44.entities[entityName]?.list("-created_date", 500).catch(() => null);
    if (!allRecords) { setStatus("invalid"); return; }

    const rec = allRecords.find(r => r.id === link.record_id);
    if (!rec) { setStatus("invalid"); return; }

    setRecord(rec);

    // Increment view count
    base44.entities.SharedLink.update(link.id, {
      view_count: (link.view_count || 0) + 1,
      last_viewed_at: new Date().toISOString(),
    }).catch(() => {});

    setStatus("valid");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1a9c5b] rounded-full animate-spin" />
      </div>
    );
  }

  if (status !== "valid") {
    const messages = {
      invalid: { icon: AlertTriangle, title: "Link Not Found", body: "This share link is invalid or the record no longer exists.", color: "text-red-500" },
      expired: { icon: Clock, title: "Link Expired", body: "This share link has expired. Please ask the owner to create a new one.", color: "text-orange-500" },
      disabled: { icon: Lock, title: "Link Disabled", body: "This share link has been disabled by its owner.", color: "text-slate-500" },
    };
    const msg = messages[status] || messages.invalid;
    const StatusIcon = msg.icon;
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-sm w-full text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
            <StatusIcon className={`w-6 h-6 ${msg.color}`} />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">{msg.title}</h2>
          <p className="text-sm text-slate-500">{msg.body}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/"} className="gap-2">
            <ExternalLink className="w-3.5 h-3.5" /> Go to App
          </Button>
        </div>
      </div>
    );
  }

  const isEdit = shareLink.access_level === "edit";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1a9c5b] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-800 hidden sm:block">LifeGuard Tracker</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs gap-1 ${isEdit ? "border-orange-300 text-orange-700" : "border-blue-300 text-blue-700"}`}>
              {isEdit ? <Pencil className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {isEdit ? "Can Edit" : "Read Only"}
            </Badge>
            {shareLink.expires_at && (
              <span className="text-xs text-slate-400 flex items-center gap-1 hidden sm:flex">
                <Clock className="w-3 h-3" />
                Expires {format(new Date(shareLink.expires_at), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Meta */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">{shareLink.record_type}</p>
              <h1 className="text-xl font-bold text-slate-900">{shareLink.record_label}</h1>
              <p className="text-sm text-slate-500 mt-1">
                Shared by <span className="font-medium text-slate-700">{shareLink.shared_by_name || shareLink.shared_by_email}</span>
                {" "}· {shareLink.view_count || 0} view{shareLink.view_count !== 1 ? "s" : ""}
              </p>
            </div>
            {!isEdit && (
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1.5 rounded-lg">
                <Eye className="w-3.5 h-3.5" /> View Only
              </div>
            )}
            {isEdit && (
              <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1.5 rounded-lg">
                <Pencil className="w-3.5 h-3.5" /> Editing Enabled
              </div>
            )}
          </div>
        </div>

        {/* Record data */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Record Details</h2>
          <RecordViewer data={record} label={shareLink.record_label} />
        </div>

        {isEdit && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700 flex items-start gap-2">
            <Pencil className="w-4 h-4 mt-0.5 shrink-0" />
            <span>You have edit access to this record. To make changes, please log into the app directly and navigate to this record.</span>
          </div>
        )}

        <p className="text-center text-xs text-slate-400">
          Shared via <a href="/" className="text-[#1a9c5b] hover:underline font-medium">LifeGuard Tracker</a>
        </p>
      </div>
    </div>
  );
}