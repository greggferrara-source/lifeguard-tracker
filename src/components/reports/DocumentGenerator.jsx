import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2, CheckCircle2, FileText, Shield, Award, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const REPORT_TYPES = [
  { value: "shifts", label: "Shift & Staffing Report", icon: FileText, description: "Hours, schedules, and payroll summary", fn: "generateShiftReport" },
  { value: "compliance", label: "Compliance Report", icon: Shield, description: "Checklists, inspections, and incidents", fn: "generateShiftReport" },
  { value: "certifications", label: "Certification Report", icon: Award, description: "Staff certification status and expiries", fn: "generateShiftReport" },
  { value: "incidents", label: "Incident Log Report", icon: AlertTriangle, description: "All incidents and follow-up status", fn: "generateShiftReport" },
];

export default function DocumentGenerator({ locations }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [reportType, setReportType] = useState("shifts");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedReport = REPORT_TYPES.find(r => r.value === reportType) || REPORT_TYPES[0];

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const response = await base44.functions.invoke("generateShiftReport", {
        start_date: startDate,
        end_date: endDate,
        location_id: selectedLocation === "all" ? null : selectedLocation,
        report_type: reportType,
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}-report-${startDate}-to-${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Failed to generate report: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border border-gray-100 shadow-none rounded-2xl bg-gradient-to-br from-green-50/60 to-transparent">
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Export PDF Report</h3>
          <p className="text-sm text-gray-500 mt-1">Generate formatted compliance-ready PDF exports.</p>
        </div>

        {/* Report type selector */}
        <div>
          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Report Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {REPORT_TYPES.map((rt) => {
              const Icon = rt.icon;
              const active = reportType === rt.value;
              return (
                <button
                  key={rt.value}
                  onClick={() => setReportType(rt.value)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    active ? "border-[#1a9c5b] bg-[#f0faf5]" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${active ? "text-[#1a9c5b]" : "text-gray-400"}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold leading-tight ${active ? "text-[#1a9c5b]" : "text-gray-700"}`}>{rt.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{rt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-gray-200 text-sm" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">End Date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-gray-200 text-sm" />
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">Location</Label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="border-gray-200 text-sm">
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || !startDate || !endDate}
          className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Generating PDF...</>
          ) : success ? (
            <><CheckCircle2 className="w-4 h-4" />Downloaded!</>
          ) : (
            <><Download className="w-4 h-4" />Export {selectedReport.label}</>
          )}
        </Button>
      </div>
    </Card>
  );
}