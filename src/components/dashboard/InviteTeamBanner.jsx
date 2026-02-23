import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { UserPlus, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function InviteTeamBanner({ employees }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState([]);

  // Only show when there are employees but none have emails (likely no logins yet)
  const employeesWithoutLogins = employees.filter(e => !e.email).length;
  if (employeesWithoutLogins === 0 && employees.length > 0) return null;
  if (employees.length === 0) return null;

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await base44.users.inviteUser(email.trim(), "user");
      setSent(s => [...s, email.trim()]);
      setEmail("");
      toast.success(`Invitation sent to ${email.trim()}`);
    } catch (err) {
      toast.error(err.message || "Failed to send invitation");
    }
    setLoading(false);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Invite your team</span> — give employees access to view their schedules and manage time-off.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 h-8" onClick={() => setOpen(o => !o)}>
            {open ? "Close" : "Invite"}
          </Button>
        </div>
      </div>

      {open && (
        <form onSubmit={handleInvite} className="mt-3 flex gap-2">
          <Input
            type="email"
            placeholder="employee@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="h-8 text-sm bg-white"
            disabled={loading}
          />
          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 h-8" disabled={loading || !email.trim()}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Send"}
          </Button>
        </form>
      )}

      {sent.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {sent.map(e => (
            <span key={e} className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> {e}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}