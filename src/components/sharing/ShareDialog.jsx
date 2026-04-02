import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Link2, Mail, Copy, Check, X, Shield, Eye, Pencil, Trash2,
  Users, Clock, ToggleLeft, ToggleRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

function generateToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function ShareDialog({ open, onOpenChange, recordType, recordId, recordLabel }) {
  const [user, setUser] = useState(null);
  const [existingLinks, setExistingLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  // New link form
  const [accessLevel, setAccessLevel] = useState("read_only");
  const [expiryDays, setExpiryDays] = useState("never");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteEmails, setInviteEmails] = useState([]);

  useEffect(() => {
    if (!open) return;
    base44.auth.me().then(setUser).catch(() => {});
    loadLinks();
  }, [open, recordId]);

  const loadLinks = async () => {
    setLoading(true);
    const all = await base44.entities.SharedLink.list("-created_date", 50);
    setExistingLinks(all.filter(l => l.record_id === recordId && l.record_type === recordType));
    setLoading(false);
  };

  const addInviteEmail = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes("@") || inviteEmails.includes(email)) return;
    setInviteEmails(prev => [...prev, email]);
    setInviteEmail("");
  };

  const handleCreateLink = async () => {
    if (!user) return;
    setCreating(true);
    const token = generateToken();
    const expiresAt = expiryDays !== "never"
      ? new Date(Date.now() + parseInt(expiryDays) * 86400000).toISOString()
      : null;

    const link = await base44.entities.SharedLink.create({
      token,
      record_type: recordType,
      record_id: recordId,
      record_label: recordLabel,
      access_level: accessLevel,
      shared_by_email: user.email,
      shared_by_name: user.full_name || user.email,
      invited_emails: inviteEmails,
      link_active: true,
      ...(expiresAt ? { expires_at: expiresAt } : {}),
      view_count: 0,
    });

    // Send email invitations
    if (inviteEmails.length > 0) {
      setSendingEmail(true);
      const shareUrl = `${window.location.origin}/SharedView?token=${token}`;
      for (const email of inviteEmails) {
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: `${user.full_name || user.email} shared "${recordLabel}" with you`,
          body: `
<p>Hi,</p>
<p><strong>${user.full_name || user.email}</strong> has shared a <strong>${recordType}</strong> record with you on LifeGuard Tracker.</p>
<p><strong>Record:</strong> ${recordLabel}<br/>
<strong>Access:</strong> ${accessLevel === "read_only" ? "Read-Only" : "Can Edit"}${expiresAt ? `<br/><strong>Expires:</strong> ${format(new Date(expiresAt), "MMM d, yyyy")}` : ""}</p>
<p><a href="${shareUrl}" style="background:#1a9c5b;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">View Shared Record</a></p>
<p style="color:#999;font-size:12px;">If you did not expect this, you can ignore this email.</p>
          `.trim(),
        }).catch(() => {});
      }
      setSendingEmail(false);
    }

    setInviteEmails([]);
    setInviteEmail("");
    await loadLinks();
    setCreating(false);
  };

  const toggleLink = async (link) => {
    await base44.entities.SharedLink.update(link.id, { link_active: !link.link_active });
    await loadLinks();
  };

  const deleteLink = async (link) => {
    await base44.entities.SharedLink.delete(link.id);
    await loadLinks();
  };

  const copyLink = (token) => {
    const url = `${window.location.origin}/SharedView?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const isExpired = (link) => link.expires_at && new Date(link.expires_at) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#1a9c5b]" />
            Share "{recordLabel}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Create new share */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Create Share Link</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Access Level</Label>
                <Select value={accessLevel} onValueChange={setAccessLevel}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read_only">
                      <span className="flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> Read Only</span>
                    </SelectItem>
                    <SelectItem value="edit">
                      <span className="flex items-center gap-2"><Pencil className="w-3.5 h-3.5" /> Can Edit</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Expires</Label>
                <Select value={expiryDays} onValueChange={setExpiryDays}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="1">24 hours</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email invites */}
            <div>
              <Label className="text-xs">Invite by Email (optional)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addInviteEmail()}
                  className="flex-1 text-sm"
                />
                <Button size="sm" variant="outline" onClick={addInviteEmail} type="button">
                  <Mail className="w-3.5 h-3.5" />
                </Button>
              </div>
              {inviteEmails.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {inviteEmails.map(email => (
                    <span key={email} className="flex items-center gap-1 bg-[#1a9c5b]/10 text-[#1a9c5b] text-xs px-2 py-1 rounded-full font-medium">
                      {email}
                      <button onClick={() => setInviteEmails(prev => prev.filter(e => e !== email))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleCreateLink}
              disabled={creating || sendingEmail || !user}
              className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] gap-2"
            >
              <Link2 className="w-4 h-4" />
              {creating || sendingEmail ? "Creating…" : inviteEmails.length > 0 ? `Create Link & Send ${inviteEmails.length} Invite${inviteEmails.length > 1 ? "s" : ""}` : "Create Share Link"}
            </Button>
          </div>

          {/* Existing links */}
          {!loading && existingLinks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Active Links</p>
              {existingLinks.map(link => (
                <div key={link.id} className={`border rounded-xl p-3 space-y-2 ${!link.link_active || isExpired(link) ? "bg-slate-50 opacity-60" : "bg-white"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={`text-xs gap-1 ${link.access_level === "edit" ? "border-orange-300 text-orange-700" : "border-blue-300 text-blue-700"}`}>
                        {link.access_level === "edit" ? <Pencil className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {link.access_level === "edit" ? "Can Edit" : "Read Only"}
                      </Badge>
                      {isExpired(link) && <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Expired</Badge>}
                      {!link.link_active && !isExpired(link) && <Badge className="bg-slate-100 text-slate-600 text-xs">Disabled</Badge>}
                      {link.invited_emails?.length > 0 && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />{link.invited_emails.length} invited
                        </span>
                      )}
                      {link.expires_at && !isExpired(link) && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />Expires {format(new Date(link.expires_at), "MMM d")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => copyLink(link.token)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                        title="Copy link"
                      >
                        {copiedToken === link.token ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => toggleLink(link)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                        title={link.link_active ? "Disable link" : "Enable link"}
                      >
                        {link.link_active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteLink(link)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <code className="text-xs text-slate-500 flex-1 truncate">
                      {window.location.origin}/SharedView?token={link.token}
                    </code>
                  </div>
                  <p className="text-xs text-slate-400">
                    {link.view_count || 0} view{link.view_count !== 1 ? "s" : ""} · Created by {link.shared_by_name || link.shared_by_email}
                  </p>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="text-center py-4 text-sm text-slate-400">Loading existing links…</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}