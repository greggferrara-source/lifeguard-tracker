import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Trash2, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

export default function DataDeletion() {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await base44.functions.invoke("requestDataDeletion", {
        reason: reason || undefined,
      });
      setSubmitted(true);
      setReason("");
      setShowConfirm(false);
    } catch (error) {
      alert("Error: " + (error.message || "Failed to submit deletion request"));
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex gap-4">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-green-900">Request Submitted</h4>
            <p className="text-sm text-green-800 mt-1">
              We have received your data deletion request. Our team will process it within 30 days and send you a confirmation email.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-600" />
          Request Data Deletion
        </h3>
        <p className="text-gray-600 text-sm">
          Request to permanently delete your account and all associated data. This action cannot be undone.
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-900">
          <strong>Important:</strong> Data deletion is permanent. Once deleted, all your facility information, schedules, employee records, and settings cannot be recovered.
        </div>
      </div>

      {!showConfirm ? (
        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => setShowConfirm(true)}>
          <Trash2 className="w-4 h-4 mr-2" />
          Request Deletion
        </Button>
      ) : (
        <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for deletion (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Help us improve by sharing your feedback..."
              className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Confirm Deletion"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}