import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, Download } from "lucide-react";

const TEMPLATE_CSV = `first_name,last_name,email,phone,role
John,Smith,john@example.com,555-0101,lifeguard
Sarah,Johnson,sarah@example.com,555-0102,head_lifeguard
Michael,Brown,michael@example.com,555-0103,supervisor`;

export default function RosterImport() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [step, setStep] = useState("upload"); // upload, preview, or done

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result;
        const lines = csv.split("\n").filter((line) => line.trim());
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const rows = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const obj = {};
          headers.forEach((h, i) => {
            obj[h] = values[i] || "";
          });
          return obj;
        });

        setFile(selectedFile);
        setPreview(rows);
        setStep("preview");
        setStatus(null);
      } catch (error) {
        setStatus({ type: "error", text: "Failed to parse CSV file" });
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      // Validate and clean data
      const validRows = preview.filter(
        (row) => row.first_name?.trim() && row.last_name?.trim() && row.email?.trim()
      );

      if (validRows.length === 0) {
        setStatus({ type: "error", text: "No valid employee records found" });
        setLoading(false);
        return;
      }

      const employees = validRows.map((row) => ({
        first_name: row.first_name.trim(),
        last_name: row.last_name.trim(),
        email: row.email.trim(),
        phone: row.phone?.trim() || "",
        role: (row.role?.trim().toLowerCase() || "lifeguard"),
        status: "active",
      }));

      // Bulk create employees
      await base44.entities.Employee.bulkCreate(employees);

      setStatus({
        type: "success",
        text: `Successfully imported ${employees.length} employee(s)`,
      });
      setStep("done");
      setFile(null);
      setPreview([]);
    } catch (error) {
      setStatus({ type: "error", text: error.message || "Import failed" });
    }
    setLoading(false);
  };

  const downloadTemplate = () => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(TEMPLATE_CSV)
    );
    element.setAttribute("download", "roster_template.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#1a9c5b]" />
          Import Roster
        </h3>
        <p className="text-gray-600 text-sm">
          Bulk import employees from a CSV file. Download the template to get started.
        </p>
      </div>

      {step === "upload" && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200">
            <label className="cursor-pointer block">
              <div className="flex flex-col items-center gap-3 py-8">
                <FileText className="w-8 h-8 text-gray-400" />
                <div className="text-center">
                  <p className="font-medium text-gray-900">Click to upload CSV file</p>
                  <p className="text-sm text-gray-500 mt-1">
                    or drag and drop (first_name, last_name, email, phone, role)
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="w-full border-[#1a9c5b] text-[#1a9c5b] hover:bg-[#f0faf5]"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV Template
          </Button>

          {status && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                status.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-green-50 text-green-800 border border-green-200"
              }`}
            >
              {status.type === "error" ? (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              )}
              {status.text}
            </div>
          )}
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <strong>Preview:</strong> {preview.length} employee(s) ready to import
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">First Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Last Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Phone</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Role</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-900">{row.first_name}</td>
                    <td className="px-3 py-2 text-gray-900">{row.last_name}</td>
                    <td className="px-3 py-2 text-gray-600 text-xs">{row.email}</td>
                    <td className="px-3 py-2 text-gray-600">{row.phone}</td>
                    <td className="px-3 py-2 text-gray-600 text-xs">{row.role || "lifeguard"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.length > 10 && (
            <p className="text-sm text-gray-500">+{preview.length - 10} more employees</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setStep("upload");
                setFile(null);
                setPreview([]);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={loading}
              className="flex-1 bg-[#1a9c5b] hover:bg-[#158a4e] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                "Confirm & Import"
              )}
            </Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-green-900">{status?.text}</h4>
              <p className="text-sm text-green-800 mt-1">
                Your employees have been added to the system. They will receive invitation emails shortly.
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setStep("upload");
              setStatus(null);
            }}
            className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] text-white"
          >
            Import More
          </Button>
        </div>
      )}
    </div>
  );
}