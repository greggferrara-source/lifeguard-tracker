import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader, CheckCircle2, AlertTriangle, Award } from "lucide-react";
import CSVDropzone from "./CSVDropzone";

const HEADERS = ["employee_id", "employee_name", "certification_name", "issuing_body", "certification_number", "issue_date", "expiry_date", "status"];
const STATUS_OPTIONS = ["active", "expired", "pending", "revoked"];

const downloadTemplate = () => {
  const rows = [
    HEADERS.join(","),
    "emp_123,Jane Doe,Lifeguard Certification,Red Cross,RC-2024-001,2024-01-15,2026-01-15,active",
    "emp_456,John Smith,First Aid CPR,American Heart,AHA-2024-002,2024-03-01,2025-03-01,active"
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "certification_template.csv"; a.click();
  URL.revokeObjectURL(url);
};

function normalize(row) {
  const status = STATUS_OPTIONS.includes(row.status?.toLowerCase()) ? row.status.toLowerCase() : "active";
  return {
    employee_id: row.employee_id || row["Employee ID"] || "",
    employee_name: row.employee_name || row["Employee Name"] || "",
    certification_name: row.certification_name || row["Certification Name"] || row["name"] || "",
    issuing_body: row.issuing_body || row["Issuing Body"] || "",
    certification_number: row.certification_number || row["Cert Number"] || "",
    issue_date: row.issue_date || row["Issue Date"] || "",
    expiry_date: row.expiry_date || row["Expiry Date"] || "",
    status
  };
}

function validate(r) {
  const errors = [];
  if (!r.certification_name) errors.push("Missing certification name");
  if (!r.employee_name && !r.employee_id) errors.push("Missing employee");
  return errors;
}

export default function CertificationImporter() {
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleParsed = (data) => {
    if (!data) { setPreview(null); return; }
    setPreview(data.rows.map((row, i) => {
      const r = normalize(row);
      return { ...r, _errors: validate(r), _rowNum: i + 2 };
    }));
  };

  const validRows = preview?.filter(r => r._errors.length === 0) || [];

  const handleImport = async () => {
    setImporting(true);
    setImportResult(null);
    let success = 0;
    for (const row of validRows) {
      const { _errors, _rowNum, ...cert } = row;
      Object.keys(cert).forEach(k => { if (cert[k] === "") delete cert[k]; });
      await base44.entities.Certification.create(cert);
      success++;
    }
    setImportResult({ success });
    setImporting(false);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2"><Award className="w-4 h-4" />Import Certifications</CardTitle>
            <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="w-3.5 h-3.5 mr-1.5" />Template</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CSVDropzone onParsed={handleParsed} />
          {importResult && (
            <div className="rounded-lg p-3 bg-green-50 border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-sm text-green-800 font-medium">Imported {importResult.success} certifications successfully!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {preview && preview.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Preview — {preview.length} rows</CardTitle>
              <div className="flex gap-2">
                {preview.filter(r => r._errors.length > 0).length > 0 && <Badge variant="destructive" className="text-xs">{preview.filter(r => r._errors.length > 0).length} errors</Badge>}
                <Badge className="bg-green-100 text-green-800 text-xs">{validRows.length} ready</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="text-xs w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Row", "Employee", "Certification", "Issuing Body", "Cert #", "Expiry", "Status", "Valid"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.map((row, i) => (
                    <tr key={i} className={row._errors.length > 0 ? "bg-red-50" : "bg-white"}>
                      <td className="px-3 py-2 text-gray-400">{row._rowNum}</td>
                      <td className="px-3 py-2">{row.employee_name || row.employee_id}</td>
                      <td className="px-3 py-2 font-medium">{row.certification_name}</td>
                      <td className="px-3 py-2 text-gray-500">{row.issuing_body || "—"}</td>
                      <td className="px-3 py-2 text-gray-500">{row.certification_number || "—"}</td>
                      <td className="px-3 py-2">{row.expiry_date || "—"}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-xs">{row.status}</Badge></td>
                      <td className="px-3 py-2">
                        {row._errors.length > 0 ? <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{row._errors.join(", ")}</span> : <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {validRows.length > 0 && (
              <Button onClick={handleImport} disabled={importing} className="mt-4 bg-[#1a9c5b] hover:bg-[#158a4e] w-full">
                {importing ? <><Loader className="w-4 h-4 mr-2 animate-spin" />Importing...</> : <>Import {validRows.length} Certifications</>}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}