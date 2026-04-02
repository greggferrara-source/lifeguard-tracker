import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield, Plus, Upload, CheckCircle2, XCircle, Clock, AlertTriangle,
  FileText, Eye, Calendar, Building2, Loader2
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import TooltipHint from "@/components/onboarding/TooltipHint";

const CERT_STATUS = {
  pending_review: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-500" },
};

const COMMON_CERTS = ["Lifeguard Certification", "CPR/AED", "First Aid", "Water Safety Instructor", "Head Lifeguard", "Oxygen Administration", "Pool Operator", "Swim Instructor"];

function daysUntilExpiry(dateStr) {
  if (!dateStr) return null;
  return differenceInDays(parseISO(dateStr), new Date());
}

function ExpiryBadge({ dateStr }) {
  const days = daysUntilExpiry(dateStr);
  if (days === null) return null;
  if (days < 0) return <Badge className="text-[10px] rounded-full bg-gray-100 text-gray-500">Expired</Badge>;
  if (days <= 7) return <Badge className="text-[10px] rounded-full bg-red-100 text-red-700">Expires in {days}d</Badge>;
  if (days <= 30) return <Badge className="text-[10px] rounded-full bg-orange-100 text-orange-700">Expires in {days}d</Badge>;
  return <Badge className="text-[10px] rounded-full bg-green-100 text-green-700">Valid · {days}d left</Badge>;
}

export default function Certifications() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", issuing_organization: "", issue_date: "", expiry_date: "", certificate_url: "" });
  const [file, setFile] = useState(null);

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { data: certs = [] } = useQuery({ queryKey: ["certifications"], queryFn: () => base44.entities.Certification.list("-created_date", 500) });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.list() });

  const isManager = user?.role === "admin" || user?.role === "manager";
  const myEmployee = employees.find(e => e.email === user?.email);

  const createCert = useMutation({
    mutationFn: (data) => base44.entities.Certification.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["certifications"] }); setUploadDialogOpen(false); resetForm(); },
  });

  const updateCert = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Certification.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["certifications"] }); setReviewDialogOpen(false); setSelectedCert(null); setReviewNotes(""); },
  });

  const deleteCert = useMutation({
    mutationFn: (id) => base44.entities.Certification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["certifications"] }),
  });

  const resetForm = () => setForm({ name: "", issuing_organization: "", issue_date: "", expiry_date: "", certificate_url: "" });

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    setForm(prev => ({ ...prev, certificate_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = () => {
    if (!myEmployee) return;
    if (!form.name || !form.expiry_date) return;
    createCert.mutate({
      ...form,
      employee_id: myEmployee.id,
      employee_name: `${myEmployee.first_name} ${myEmployee.last_name}`,
      status: "pending_review",
    });
  };

  const handleReview = (approved) => {
    updateCert.mutate({
      id: selectedCert.id,
      data: { status: approved ? "approved" : "rejected", manager_notes: reviewNotes }
    });
  };

  const now = new Date().toISOString().split("T")[0];
  const expiringSoon = certs.filter(c => {
    const d = daysUntilExpiry(c.expiry_date);
    return d !== null && d <= 30 && d >= 0 && c.status === "approved";
  });

  const filterCerts = (list) => {
    if (tab === "pending") return list.filter(c => c.status === "pending_review");
    if (tab === "expiring") return expiringSoon;
    if (tab === "mine") return list.filter(c => c.employee_id === myEmployee?.id);
    return list;
  };

  const displayed = filterCerts(certs);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Certifications</h1>
          <p className="text-gray-400 mt-2 text-lg">Track and manage employee certifications</p>
        </div>
        {myEmployee && (
          <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2" onClick={() => setUploadDialogOpen(true)}>
            <Plus className="w-4 h-4" /> Upload Certification
          </Button>
        )}
      </div>

      {/* Onboarding hint */}
      <TooltipHint
        id="cert-expiry-info"
        message="🛡️ Expired certifications will automatically trigger alerts and block uncertified staff from being assigned shifts."
      />

      {/* Expiry Alerts */}
      {expiringSoon.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800">{expiringSoon.length} certification{expiringSoon.length > 1 ? "s" : ""} expiring within 30 days</p>
            <p className="text-xs text-orange-600 mt-0.5">{expiringSoon.map(c => `${c.employee_name} — ${c.name}`).join("; ")}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Certs", value: certs.length },
          { label: "Pending Review", value: certs.filter(c => c.status === "pending_review").length },
          { label: "Expiring Soon", value: expiringSoon.length },
          { label: "Approved", value: certs.filter(c => c.status === "approved").length },
        ].map((s, i) => (
          <div key={i} className="bg-gray-50 rounded-2xl p-5">
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-gray-100 rounded-full p-1">
          <TabsTrigger value="all" className="rounded-full text-sm">All</TabsTrigger>
          {myEmployee && <TabsTrigger value="mine" className="rounded-full text-sm">Mine</TabsTrigger>}
          {isManager && (
            <TabsTrigger value="pending" className="rounded-full text-sm">
              Pending {certs.filter(c => c.status === "pending_review").length > 0 && (
                <span className="ml-1 bg-yellow-500 text-white text-[10px] font-bold rounded-full px-1.5">{certs.filter(c => c.status === "pending_review").length}</span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="expiring" className="rounded-full text-sm">
            Expiring {expiringSoon.length > 0 && (
              <span className="ml-1 bg-orange-500 text-white text-[10px] font-bold rounded-full px-1.5">{expiringSoon.length}</span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <Shield className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 font-medium">No certifications found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(cert => {
            const cfg = CERT_STATUS[cert.status] || CERT_STATUS.pending_review;
            const days = daysUntilExpiry(cert.expiry_date);
            return (
              <Card key={cert.id} className="p-5 border border-gray-100 shadow-none rounded-2xl">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#f0faf5] flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-[#1a9c5b]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{cert.name}</p>
                        <Badge className={`text-[10px] rounded-full ${cfg.color}`}>{cfg.label}</Badge>
                        <ExpiryBadge dateStr={cert.expiry_date} />
                      </div>
                      <p className="text-sm text-gray-600">{cert.employee_name}</p>
                      <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-400">
                        {cert.issuing_organization && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{cert.issuing_organization}</span>}
                        {cert.expiry_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Expires {cert.expiry_date}</span>}
                      </div>
                      {cert.manager_notes && <p className="text-xs text-gray-400 mt-1 italic">"{cert.manager_notes}"</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {cert.certificate_url && (
                      <Button size="sm" variant="outline" className="rounded-full text-xs gap-1" onClick={() => window.open(cert.certificate_url, "_blank")}>
                        <Eye className="w-3 h-3" /> View
                      </Button>
                    )}
                    {isManager && cert.status === "pending_review" && (
                      <Button size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700 text-xs" onClick={() => { setSelectedCert(cert); setReviewDialogOpen(true); }}>
                        Review
                      </Button>
                    )}
                    {(cert.employee_id === myEmployee?.id || isManager) && cert.status !== "approved" && (
                      <Button size="sm" variant="ghost" className="rounded-full text-red-400 hover:text-red-600 text-xs" onClick={() => deleteCert.mutate(cert.id)}>
                        <XCircle className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Shield className="w-4 h-4" /> Upload Certification</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Certification Name *</Label>
              <Select value={form.name} onValueChange={v => setForm(p => ({ ...p, name: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select or type name…" /></SelectTrigger>
                <SelectContent>
                  {COMMON_CERTS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input className="mt-1" placeholder="Or type custom name…" value={COMMON_CERTS.includes(form.name) ? "" : form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Issuing Organization</Label>
              <Input className="mt-1" value={form.issuing_organization} onChange={e => setForm(p => ({ ...p, issuing_organization: e.target.value }))} placeholder="e.g. American Red Cross" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Issue Date</Label>
                <Input type="date" className="mt-1" value={form.issue_date} onChange={e => setForm(p => ({ ...p, issue_date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Expiry Date *</Label>
                <Input type="date" className="mt-1" value={form.expiry_date} onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Certificate File</Label>
              <div className="mt-1 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#1a9c5b] transition-colors relative">
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={handleFileChange} />
                {uploading ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
                  </div>
                ) : form.certificate_url ? (
                  <p className="text-sm text-[#1a9c5b] font-medium flex items-center justify-center gap-1"><FileText className="w-4 h-4" /> File uploaded</p>
                ) : (
                  <div>
                    <Upload className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                    <p className="text-sm text-gray-400">Click to upload PDF or image</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUploadDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button disabled={!form.name || !form.expiry_date || createCert.isPending} onClick={handleSubmit} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
              Submit for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manager Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Review Certification</DialogTitle></DialogHeader>
          {selectedCert && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-gray-50 rounded-xl space-y-1.5">
                <p className="font-semibold text-gray-900">{selectedCert.name}</p>
                <p className="text-sm text-gray-600">{selectedCert.employee_name}</p>
                {selectedCert.issuing_organization && <p className="text-xs text-gray-500">{selectedCert.issuing_organization}</p>}
                {selectedCert.expiry_date && <p className="text-xs text-gray-500">Expires: {selectedCert.expiry_date}</p>}
              </div>
              {selectedCert.certificate_url && (
                <Button variant="outline" className="w-full gap-2" onClick={() => window.open(selectedCert.certificate_url, "_blank")}>
                  <Eye className="w-4 h-4" /> View Certificate File
                </Button>
              )}
              <div>
                <Label className="text-xs">Notes (optional)</Label>
                <Textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} placeholder="Add notes for the employee…" rows={2} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleReview(false)}>
              <XCircle className="w-4 h-4 mr-1" /> Reject
            </Button>
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={() => handleReview(true)}>
              <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}