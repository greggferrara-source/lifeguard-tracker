import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import CSVDropzone from "@/components/import/CSVDropzone";

const HEADERS = ["vendor_name","bill_number","description","category","amount","issue_date","due_date","status","notes"];

function normalize(row) {
  return {
    vendor_name: row.vendor_name || row["Vendor"] || row["vendor"] || "",
    bill_number: row.bill_number || row["Bill #"] || "",
    description: row.description || row["Description"] || "",
    category: row.category || row["Category"] || "",
    amount: row.amount ? parseFloat(row.amount) : 0,
    issue_date: row.issue_date || row["Issue Date"] || "",
    due_date: row.due_date || row["Due Date"] || "",
    status: ["draft","pending","approved","paid","overdue","cancelled"].includes(row.status?.toLowerCase()) ? row.status.toLowerCase() : "pending",
    notes: row.notes || row["Notes"] || ""
  };
}

function validate(row) {
  const errors = [];
  if (!row.vendor_name) errors.push("Missing vendor name");
  if (!row.amount || isNaN(row.amount) || row.amount <= 0) errors.push("Invalid amount");
  if (!row.due_date) errors.push("Missing due date");
  return errors;
}

export default function BillImporter({ onComplete }) {
  const qc = useQueryClient();
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const downloadTemplate = () => {
    const rows = [
      HEADERS.join(","),
      "Acme Supplies,INV-001,Pool chemicals,Maintenance,250.00,2026-02-01,2026-02-28,pending,",
      "City Water Dept,UTIL-234,Monthly water bill,Utilities,180.00,2026-02-01,2026-02-15,pending,"
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "bills_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleParsed = (rows) => {
    const normalized = rows.map(normalize);
    const validated = normalized.map(row => ({ ...row, errors: validate(row) }));
    setPreview(validated);
    setImportResult(null);
  };

  const handleImport = async () => {
    const valid = preview.filter(r => r.errors.length === 0);
    if (!valid.length) { toast.error("No valid rows to import."); return; }
    setImporting(true);
    const success = [];
    for (const row of valid) {
      const { errors, ...data } = row;
      await base44.entities.Bill.create(data);
      success.push(data);
    }
    qc.invalidateQueries({ queryKey: ["bills"] });
    setImportResult({ success: success.length, failed: preview.length - success.length });
    setImporting(false);
    setPreview(null);
    toast.success(`Imported ${success.length} bill(s).`);
    if (onComplete) onComplete();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Upload a CSV file to import multiple bills at once.</p>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="w-4 h-4 mr-1" /> Download Template
        </Button>
      </div>

      {!preview && !importResult && <CSVDropzone onParsed={handleParsed} />}

      {importResult && (
        <div className="flex flex-col items-center gap-2 py-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
          <p className="font-semibold">{importResult.success} bill(s) imported successfully</p>
          {importResult.failed > 0 && <p className="text-sm text-red-600">{importResult.failed} rows skipped due to errors</p>}
          <Button onClick={() => setImportResult(null)} variant="outline">Import More</Button>
        </div>
      )}

      {preview && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{preview.length} rows — {preview.filter(r => r.errors.length === 0).length} valid</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreview(null)}>Cancel</Button>
              <Button size="sm" onClick={handleImport} disabled={importing} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
                {importing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Import {preview.filter(r => r.errors.length === 0).length} Bills
              </Button>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {["Row","Vendor","Amount","Due Date","Category","Status","Valid"].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.map((row, i) => (
                  <tr key={i} className={row.errors.length > 0 ? "bg-red-50" : ""}>
                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{row.vendor_name}</td>
                    <td className="px-3 py-2">${row.amount}</td>
                    <td className="px-3 py-2">{row.due_date}</td>
                    <td className="px-3 py-2">{row.category || "—"}</td>
                    <td className="px-3 py-2">{row.status}</td>
                    <td className="px-3 py-2">
                      {row.errors.length === 0
                        ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                        : <span title={row.errors.join(", ")}><XCircle className="w-4 h-4 text-red-500" /></span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}