import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { X, Zap } from "lucide-react";

// Shows how many days remain in the 14-day trial based on user created_date
export default function TrialBanner({ user, subscription }) {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem("trial_banner_dismissed") === "true";
  });

  if (dismissed) return null;
  if (!user) return null;

  // Root account always has full access — never show trial banner
  if (user.email === "greggferrara@gmail.com") return null;

  // If they have an active paid subscription, don't show
  if (subscription?.status === "active" && subscription?.plan_name) return null;

  const createdDate = user.created_date ? new Date(user.created_date) : null;
  if (!createdDate) return null;

  const daysSinceSignup = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const trialDaysTotal = 14;
  const daysLeft = Math.max(0, trialDaysTotal - daysSinceSignup);

  if (daysLeft <= 0) {
    // Trial expired
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium text-red-700">
            Your free trial has ended. Upgrade to keep access to all features.
          </p>
        </div>
        <Link
          to={createPageUrl("Pricing")}
          className="flex-shrink-0 text-xs font-bold bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
        >
          Upgrade Now
        </Link>
      </div>
    );
  }

  const urgency = daysLeft <= 3 ? "red" : daysLeft <= 7 ? "amber" : "green";
  const colors = {
    green: { bg: "bg-[#f0faf5]", border: "border-[#1a9c5b]/20", text: "text-[#1a9c5b]", btn: "bg-[#1a9c5b] hover:bg-[#158a4e]", icon: "text-[#1a9c5b]" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", btn: "bg-amber-500 hover:bg-amber-600", icon: "text-amber-500" },
    red:   { bg: "bg-red-50",   border: "border-red-200",   text: "text-red-700",   btn: "bg-red-500 hover:bg-red-600",   icon: "text-red-500" },
  }[urgency];

  const handleDismiss = () => {
    localStorage.setItem("trial_banner_dismissed", "true");
    setDismissed(true);
  };

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl px-4 py-3 flex items-center justify-between gap-4`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Zap className={`w-4 h-4 ${colors.icon} flex-shrink-0`} />
        <p className={`text-sm font-medium ${colors.text}`}>
          <span className="font-bold">{daysLeft} day{daysLeft !== 1 ? "s" : ""}</span> left in your free trial.
          {daysLeft <= 7 ? " Upgrade now to avoid losing access." : " Enjoying LifeGuard Tracker?"}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          to={createPageUrl("Pricing")}
          className={`text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-colors ${colors.btn}`}
        >
          Upgrade
        </Link>
        {daysLeft > 7 && (
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 p-0.5">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}