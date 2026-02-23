import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader, CheckCircle2, AlertTriangle, Users } from "lucide-react";
import CSVDropzone from "./CSVDropzone";

const EMPLOYEE_TEMPLATE_HEADERS = [
  "first_name", "last_name", "email", "phone", "role", "status", "hourly_rate", "max_hours_per_week", "notes"
];

const ROLE_OPTIONS = ["lifeguard", "head_lifeguard", "supervisor", "manager"];
const STATUS_OPTIONS = ["active", "inactive", "on_leave"];

const downloadTemplate = () => {
  const rows = [
    EMPLOYEE_TEMPLATE_HEADERS.join(","),
    "Jane,Doe,jane@example.com,555-1234,lifeguard,active,18.50,40,",
    "John,Smith,john@example.com,555-5678,head_lifeguard,active,22.00,40,"
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "employee_template.csv"; a.click();
  URL.revokeObjectURL(url);
};

function normalizeEmployee(row) {
  const role = ROLE_OPTIONS.includes(row.role?.toLowerCase()) ? row.role.toLowerCase() : "lifeguard";
  const status = STATUS_OPTIONS.includes(row.status?.toLowerCase()) ? row.status.toLowerCase() : "active";
  return {
    first_name: row.first_name || row["First Name"] || row["firstName"] || "",
    last_name: row.last_name || row["Last Name"] || row["lastName"] || "",
    email: row.email || row["Email"] || "",
    phone: row.phone || row["Phone"] || "",
    role,
    status,
    hourly_rate: parseFloat(row.hourly_rate || row["Hourly Rate"] || 0) || undefined,
    max_hours_per_week: parseFloat(row.max_hours_per_week || row["Max Hours"] || 40) || 40,
    notes: row.notes || row["Notes"] || ""
  };
}

function validateEmployee(emp, idx) {
  const errors = [];
  if (!emp.first_name) errors.push("Missing first name");
  if (!emp.last_name) errors.push("Missing last name");
  return errors;
}

export default function EmployeeImporter() {
  const [parsed, setParsed] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleParsed = (data) => {
    if (!data) { setParsed(null); setPreview(null); return; }
    const rows = data.rows.map((row, i) => {
      const emp = normalizeEmployee(row);
      const errors = validateEmployee(emp, i);
      return { ...emp, _errors: errors, _rowNum: i + 2 };
    });
    setParsed(data);
    setPreview(rows);
  };

  const validRows = preview?.filter(r => r._errors.length === 0) || [];
  const invalidRows = preview?.filter(r => r._errors.length > 0) || [];

  const handleImport = async () => {
    if (!validRows.length) return;
    setImporting(true);
    setImportResult(null);
    let success = 0, failed = 0;
    for (const row of validRows) {
      const { _errors, _rowNum, ...emp } = row;
      // Remove empty optional fields
      Object.keys(emp).forEach(k => { if (emp[k] === "" || emp[k] === undefined) delete emp[k]; });
      await base44.entities.Employee.create(emp);
      success++;
    }
    setImportResult({ success, failed });
    setImporting(false);
    setPreview(null);
    setParsed(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" />Import Employees</CardTitle>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="w-3.5 h-3.5 mr-1.5" />Download Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CSVDropzone onParsed={handleParsed} />

          {importResult && (
            <div className="rounded-lg p-3 bg-green-50 border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-sm text-green-800 font-medium">
                Imported {importResult.success} employees successfully!
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {preview && preview.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Preview — {preview.length} rows detected
              </CardTitle>
              <div className="flex gap-2">
                {invalidRows.length > 0 && (
                  <Badge variant="destructive" className="text-xs">{invalidRows.length} errors</Badge>
                )}
                <Badge className="bg-green-100 text-green-800 text-xs">{validRows.length} ready</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="text-xs w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Row</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">First Name</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Last Name</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Email</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Role</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Status</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Hourly Rate</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.map((row, i) => (
                    <tr key={i} className={row._errors.length > 0 ? "bg-red-50" : "bg-white"}>
                      <td className="px-3 py-2 text-gray-400">{row._rowNum}</td>
                      <td className="px-3 py-2">{row.first_name}</td>
                      <td className="px-3 py-2">{row.last_name}</td>
                      <td className="px-3 py-2 text-gray-500">{row.email}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="text-xs">{row.role}</Badge>
                      </td>
                      <td className="px-3 py-2">{row.status}</td>
                      <td className="px-3 py-2">{row.hourly_rate ? `$${row.hourly_rate}` : "—"}</td>
                      <td className="px-3 py-2">
                        {row._errors.length > 0 ? (
                          <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{row._errors.join(", ")}</span>
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {validRows.length > 0 && (
              <Button
                onClick={handleImport}
                disabled={importing}
                className="mt-4 bg-[#1a9c5b] hover:bg-[#158a4e] w-full"
              >
                {importing ? (
                  <><Loader className="w-4 h-4 mr-2 animate-spin" />Importing...</>
                ) : (
                  <>Import {validRows.length} Employees</>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}