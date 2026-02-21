import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, AlertCircle, Clock, CreditCard, Download, ArrowRight, PauseCircle, PlayCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Billing() {
  const [pauseLoading, setPauseLoading] = useState(false);
  const [resumeDate, setResumeDate] = useState("");
  const [showPauseDialog, setShowPauseDialog] = useState(false);
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
      toast.success("Subscription paused successfully. No charges while paused.");
    } catch (error) {
      toast.error("Failed to pause subscription. Please try again.");
      console.error("Pause error:", error);
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
      toast.error("Failed to resume subscription. Please try again.");
      console.error("Resume error:", error);
    } finally {
      setPauseLoading(false);
    }
  };

  const statusConfig = {
    active: {
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      label: "Active",
      description: "Your subscription is active"
    },
    trialing: {
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      label: "Trial Period",
      description: "Your trial is currently active"
    },
    past_due: {
      icon: AlertCircle,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      label: "Past Due",
      description: "Payment is overdue. Please update your billing"
    },
    canceled: {
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      label: "Canceled",
      description: "Your subscription has been canceled"
    },
    paused: {
      icon: PauseCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      label: "Paused",
      description: "Your subscription is paused — no charges until you resume"
    },
    trial_expired: {
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      label: "Trial Expired",
      description: "Your trial period has ended"
    }
  };

  const planDetails = {
    starter: {
      name: "Starter",
      price: 29,
      billing: "month",
      features: [
        "Up to 5 employees",
        "Basic scheduling",
        "Email support",
        "Mobile app access"
      ]
    },
    pro: {
      name: "Pro",
      price: 99,
      billing: "month",
      features: [
        "Up to 50 employees",
        "Advanced scheduling",
        "Priority email support",
        "Mobile app access",
        "Payroll integration"
      ]
    },
    enterprise: {
      name: "Enterprise",
      price: 499,
      billing: "month",
      features: [
        "Unlimited employees",
        "Full platform access",
        "24/7 phone support",
        "Dedicated account manager",
        "Custom integrations"
      ]
    }
  };

  const currentPlan = subscription ? planDetails[subscription.plan_name] : null;
  const status = subscription?.status || "inactive";
  const statusInfo = statusConfig[status] || statusConfig.inactive;
  const Icon = statusInfo.icon;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link to={createPageUrl("Dashboard")} className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-2">Manage your plan and billing information</p>
        </div>

        {/* Current Subscription Status */}
        {subscriptionLoading ? (
          <div className="animate-pulse h-32 bg-gray-200 rounded-lg" />
        ) : subscription ? (
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">Current Subscription</CardTitle>
                  <CardDescription>Your current plan and billing status</CardDescription>
                </div>
                <div className={`p-3 rounded-lg ${statusInfo.bg}`}>
                  <Icon className={`w-6 h-6 ${statusInfo.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Info */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Plan</p>
                  <p className="text-2xl font-bold text-gray-900">{currentPlan?.name || "No Plan"}</p>
                  {currentPlan && (
                    <p className="text-lg text-gray-600 mt-2">
                      ${currentPlan.price}
                      <span className="text-sm text-gray-500">/{currentPlan.billing}</span>
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === "active" ? "bg-green-600" :
                      status === "trialing" ? "bg-blue-600" :
                      "bg-red-600"
                    }`} />
                    <p className="text-lg font-semibold text-gray-900">{statusInfo.label}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{statusInfo.description}</p>
                </div>

                {/* Billing Period */}
                {subscription.current_period_start && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Current Billing Period</p>
                    <p className="text-gray-900">
                      {formatDate(subscription.current_period_start)} to {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                )}

                {/* Trial End */}
                {subscription.trial_end && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Trial Ends</p>
                    <p className="text-gray-900">{formatDate(subscription.trial_end)}</p>
                  </div>
                )}
              </div>

              {/* Plan Features */}
              {currentPlan && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Included Features</p>
                  <ul className="space-y-2">
                    {currentPlan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pause resumes info */}
              {status === "paused" && subscription.pause_resumes_at && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  Auto-resumes on {formatDate(subscription.pause_resumes_at)}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Update Payment Method
                </Button>
                {status === "active" && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-amber-600 hover:bg-amber-50 border-amber-300"
                    onClick={() => setShowPauseDialog(true)}
                  >
                    <PauseCircle className="w-4 h-4" />
                    Pause for Offseason
                  </Button>
                )}
                {status === "paused" && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-green-700 hover:bg-green-50 border-green-300"
                    onClick={handleResume}
                    disabled={pauseLoading}
                  >
                    {pauseLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                    Resume Subscription
                  </Button>
                )}
                {(status === "active" || status === "paused") && (
                  <Button variant="outline" className="text-red-600 hover:bg-red-50">
                    Cancel Subscription
                  </Button>
                )}
              </div>

              {/* Pause Dialog */}
              {showPauseDialog && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Pause Subscription</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Your subscription will be paused immediately. No charges will occur while paused.
                      When you resume, billing will be <strong>prorated</strong> — you'll only pay for the days you use.
                    </p>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Auto-resume date (optional)
                    </label>
                    <input
                      type="date"
                      value={resumeDate}
                      onChange={(e) => setResumeDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30"
                    />
                    <p className="text-xs text-gray-500 mb-5">
                      Leave blank to resume manually from this page whenever you're ready for next season.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setShowPauseDialog(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePause}
                        disabled={pauseLoading}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        {pauseLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Pause"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-900">No Active Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-800 mb-4">You don't have an active subscription yet. Choose a plan to get started.</p>
              <Link to={createPageUrl("Pricing")}>
                <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                  View Plans <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>Your invoices and payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Invoice #1001</p>
                    <p className="text-sm text-gray-600">February 20, 2026</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Download</Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Invoice #1000</p>
                    <p className="text-sm text-gray-600">January 20, 2026</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Download</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">Have questions about your billing or need to make changes to your subscription?</p>
            <Link to={createPageUrl("Contact")}>
              <Button variant="outline" className="text-blue-600 hover:bg-blue-100">
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}