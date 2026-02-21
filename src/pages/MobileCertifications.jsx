import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Upload, Calendar, Eye, ArrowLeft, Loader2 } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const COMMON_CERTS = ["Lifeguard Certification", "CPR/AED", "First Aid", "Water Safety Instructor", "Head Lifeguard"];

function daysUntilExpiry(dateStr) {
  if (!dateStr) return null;
  return differenceInDays(parseISO(dateStr), new Date());
}

export default function MobileCertifications() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", issuing_organization: "", issue_date: "", expiry_date: "" });

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { data: certs = [] } = useQuery({ queryKey: ["certifications"], queryFn: () => base44.entities.Certification.list("-created_date", 500) });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.list() });

  const myEmployee = employees.find(e => e.email === user?.email);

  const createCert = useMutation({
    mutationFn: (data) => base44.entities.Certification.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      setDialogOpen(false);
      setForm({ name: "", issuing_organization: "", issue_date: "", expiry_date: "" });
      toast.success("Certification uploaded.");
    },
    onError: () => toast.error("Failed to upload certification."),
  });

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setForm(prev => ({ ...prev, certificate_url: file_url }));
      toast.success("File uploaded.");
    } catch (error) {
      toast.error("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.name || !form.expiry_date) {
      toast.error("Name and expiry date are required.");
      return;
    }
    if (!myEmployee) {
      toast.error("Could not find your employee record.");
      return;
    }
    createCert.mutate({
      ...form,
      employee_id: myEmployee.id,
      employee_name: `${myEmployee.first_name} ${myEmployee.last_name}`,
      status: "pending_review",
    });
  };

  const myCerts = certs.filter(c => c.employee_id === myEmployee?.id);
  const expiringSoon = myCerts.filter(c => {
    const d = daysUntilExpiry(c.expiry_date);
    return d !== null && d <= 30 && d >= 0 && c.status === "approved";
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("Dashboard")} className="text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-gray-900">Certifications</h1>
            <p className="text-xs text-gray-500">{myCerts.length} total</p>
          </div>
        </div>
        {myEmployee && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#1a9c5b] hover:bg-[#158a4e] h-9 w-9 p-0 rounded-full"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Expiry Warning */}
        {expiringSoon.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex gap-2">
            <Calendar className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-900 text-sm">{expiringSoon.length} expiring soon</p>
              <p className="text-xs text-orange-700 mt-0.5">{expiringSoon.map(c => c.name).join(", ")}</p>
            </div>
          </div>
        )}

        {/* Certs List */}
        {myCerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="w-8 h-8 text-gray-300 mb-2" />
            <p className="font-semibold text-gray-400 text-sm">No certifications</p>
            <p className="text-xs text-gray-300 mt-1">Upload your first one</p>
          </div>
        ) : (
          myCerts.map((cert) => {
            const days = daysUntilExpiry(cert.expiry_date);
            const statusColor = cert.status === "approved" ? "text-green-600" : cert.status === "pending_review" ? "text-yellow-600" : "text-red-600";
            return (
              <div key={cert.id} className="bg-white rounded-2xl p-4 border border-gray-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{cert.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{cert.status}</p>
                    {cert.issuing_organization && (
                      <p className="text-xs text-gray-600 mt-1">{cert.issuing_organization}</p>
                    )}
                    {cert.expiry_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        Expires {cert.expiry_date}
                        {days !== null && (
                          <span className={days < 0 ? "text-red-600 ml-1" : days <= 7 ? "text-red-600 ml-1" : "text-green-600 ml-1"}>
                            {days < 0 ? "• Expired" : days <= 7 ? `• ${days}d left` : `• ${days}d left`}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  {cert.certificate_url && (
                    <button
                      onClick={() => window.open(cert.certificate_url, "_blank")}
                      className="p-2 rounded-lg hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">Upload Certification</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Name *</label>
                <select
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30 mb-2"
                >
                  <option value="">Select certification</option>
                  {COMMON_CERTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Or type custom name"
                  value={COMMON_CERTS.includes(form.name) ? "" : form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Issuing Organization</label>
                <input
                  type="text"
                  value={form.issuing_organization}
                  onChange={(e) => setForm({ ...form, issuing_organization: e.target.value })}
                  placeholder="e.g., American Red Cross"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={form.issue_date}
                    onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">Certificate File</label>
                <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#1a9c5b] transition-colors block">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
                    </div>
                  ) : form.certificate_url ? (
                    <p className="text-sm text-[#1a9c5b] font-medium">✓ File uploaded</p>
                  ) : (
                    <div>
                      <Upload className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                      <p className="text-sm text-gray-400">Click to upload</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createCert.isPending || !form.name || !form.expiry_date}
                className="flex-1 bg-[#1a9c5b] hover:bg-[#158a4e]"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}