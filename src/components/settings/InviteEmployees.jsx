import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { Users, Plus, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function InviteEmployees() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: "error", text: "Email is required" });
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke("inviteEmployee", {
        employee_email: email,
        employee_name: name || undefined,
      });

      setMessage({ type: "success", text: `Invitation sent to ${email}` });
      setEmail("");
      setName("");
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to send invitation" });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#1a9c5b]" />
          Invite Team Members
        </h3>
        <p className="text-gray-600 text-sm">
          Send invitations to your employees to join your facility's workspace.
        </p>
      </div>

      <form onSubmit={handleInvite} className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="employee@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name (optional)
          </label>
          <Input
            type="text"
            placeholder="Employee name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] text-white flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Invitation
            </>
          )}
        </Button>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>How it works:</strong> Employees will receive an email invitation and can sign up directly. They'll be added to your facility's workspace and can access the scheduling, time-off, and other features.
        </p>
      </div>
    </div>
  );
}