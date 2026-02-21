import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock, PauseCircle, PlayCircle, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function MobileBilling() {
  const [pauseLoading, setPauseLoading] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [resumeDate, setResumeDate] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const { data: subscription = null, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["subscription", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.UserSubscription.filter({
        user_email: user.email
      });
      return subs.length > 0 ? subs[0] : null;
    },
    enabled: !!user?.email
  });

  const handlePause = async () => {
    setPauseLoading(true);
    try {
      await base44.functions.invoke("pauseSubscription", { action: "pause", resume_date: resumeDate || undefined });
      await queryClient.invalidateQueries({ queryKey: ["subscription"] });
      setShowPauseDialog(false);
      setResumeDate("");
      toast.success("Subscription paused successfully.");
    } catch (error) {
      toast.error("Failed to pause subscription.");
    } finally {
      setPauseLoading(false);
    }
  };

  const handleResume = async () => {
    setPauseLoading(true);
    try {
      await base44.functions.invoke("pauseSubscription", { action: "resume" });
      await queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Subscription resumed successfully.");
    } catch (error) {
      toast.error("Failed to resume subscription.");
    } finally {
      setPauseLoading(false);
    }
  };

  const statusConfig = {
    active: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", label: "Active" },
    trialing: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", label: "Trial" },
    past_due: { icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-50", label: "Past Due" },
    canceled: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", label: "Canceled" },
    paused: { icon: PauseCircle, color: "text-amber-600", bg: "bg-amber-50", label: "Paused" },
    trial_expired: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", label: "Trial Expired" },
  };

  const planDetails = {
    starter: { name: "Starter", price: 29, features: ["Up to 5 employees", "Basic scheduling", "Email support"] },
    pro: { name: "Pro", price: 99, features: ["Up to 50 employees", "Advanced scheduling", "Payroll integration"] },
    enterprise: { name: "Enterprise", price: 499, features: ["Unlimited employees", "Full access", "24/7 support"] },
  };

  const currentPlan = subscription ? planDetails[subscription.plan_name] : null;
  const status = subscription?.status || "inactive";
  const statusInfo = statusConfig[status];
  const Icon = statusInfo?.icon;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <Link to={createPageUrl("Dashboard")} className="text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-bold text-gray-900">Billing</h1>
          <p className="text-xs text-gray-500">Manage your subscription</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {subscriptionLoading ? (
          <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
        ) : subscription ? (
          <>
            {/* Status Card */}
            <div className={`rounded-2xl p-4 ${statusInfo?.bg || "bg-gray-50"}`}>
              <div className="flex items-start gap-3">
                {Icon && <Icon className={`w-6 h-6 ${statusInfo?.color}`} />}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{statusInfo?.label}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {status === "paused" ? "No charges while paused" : "Your subscription is active"}
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Info */}
            {currentPlan && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Current Plan</p>
                <p className="text-2xl font-bold text-gray-900">{currentPlan.name}</p>
                <p className="text-sm text-gray-500 mt-1">${currentPlan.price}/month</p>
                <ul className="mt-3 space-y-1.5">
                  {currentPlan.features.map((f, i) => (
                    <li key={i} className="text-xs text-gray-600">✓ {f}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Billing Period */}
            {subscription.current_period_start && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Billing Period</p>
                <p className="text-sm text-gray-900">{formatDate(subscription.current_period_start)} to {formatDate(subscription.current_period_end)}</p>
              </div>
            )}

            {/* Auto-resume Info */}
            {status === "paused" && subscription.pause_resumes_at && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-2">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">Auto-resumes {formatDate(subscription.pause_resumes_at)}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {status === "active" && (
                <Button
                  onClick={() => setShowPauseDialog(true)}
                  variant="outline"
                  className="w-full justify-center gap-2 border-amber-300 text-amber-600"
                >
                  <PauseCircle className="w-4 h-4" />
                  Pause for Offseason
                </Button>
              )}
              {status === "paused" && (
                <Button
                  onClick={handleResume}
                  disabled={pauseLoading}
                  className="w-full justify-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {pauseLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                  Resume Now
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 text-center">
            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="font-semibold text-yellow-900 mb-1">No Active Subscription</p>
            <p className="text-xs text-yellow-800 mb-4">Choose a plan to get started</p>
            <Link to={createPageUrl("Pricing")}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">View Plans</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Pause Dialog */}
      {showPauseDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">Pause Subscription</h3>
            <p className="text-sm text-gray-600">No charges while paused. Resume anytime when you're back in season.</p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Auto-resume date (optional)</label>
              <input
                type="date"
                value={resumeDate}
                onChange={(e) => setResumeDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowPauseDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePause}
                disabled={pauseLoading}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
              >
                {pauseLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pause"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}