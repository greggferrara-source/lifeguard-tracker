import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader, CheckCircle2, AlertTriangle, CalendarDays } from "lucide-react";
import CSVDropzone from "./CSVDropzone";

const HEADERS = ["date", "start_time", "end_time", "employee_id", "employee_name", "location_id", "location_name", "status", "notes"];
const STATUS_OPTIONS = ["scheduled", "open", "completed", "cancelled"];

const downloadTemplate = () => {
  const rows = [
    HEADERS.join(","),
    "2026-03-01,08:00,16:00,emp_123,Jane Doe,loc_1,Main Pool,scheduled,",
    "2026-03-01,12:00,20:00,emp_456,John Smith,loc_2,Beach Zone A,scheduled,"
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "shift_template.csv"; a.click();
  URL.revokeObjectURL(url);
};

function normalize(row) {
  const status = STATUS_OPTIONS.includes(row.status?.toLowerCase()) ? row.status.toLowerCase() : "scheduled";
  return {
    date: row.date || row["Date"] || "",
    start_time: row.start_time || row["Start Time"] || "",
    end_time: row.end_time || row["End Time"] || "",
    employee_id: row.employee_id || row["Employee ID"] || "",
    employee_name: row.employee_name || row["Employee Name"] || "",
    location_id: row.location_id || row["Location ID"] || "",
    location_name: row.location_name || row["Location"] || "",
    status,
    notes: row.notes || row["Notes"] || ""
  };
}

function validate(r) {
  const errors = [];
  if (!r.date) errors.push("Missing date");
  if (!r.start_time) errors.push("Missing start time");
  if (!r.end_time) errors.push("Missing end time");
  if (!r.location_id && !r.location_name) errors.push("Missing location");
  return errors;
}

export default function ShiftImporter() {
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
      const { _errors, _rowNum, ...shift } = row;
      Object.keys(shift).forEach(k => { if (shift[k] === "") delete shift[k]; });
      await base44.entities.Shift.create(shift);
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
            <CardTitle className="text-base flex items-center gap-2"><CalendarDays className="w-4 h-4" />Import Shifts / Schedule</CardTitle>
            <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="w-3.5 h-3.5 mr-1.5" />Template</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CSVDropzone onParsed={handleParsed} />
          {importResult && (
            <div className="rounded-lg p-3 bg-green-50 border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-sm text-green-800 font-medium">Imported {importResult.success} shifts successfully!</span>
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
                    {["Row", "Date", "Start", "End", "Employee", "Location", "Status", "Valid"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.map((row, i) => (
                    <tr key={i} className={row._errors.length > 0 ? "bg-red-50" : "bg-white"}>
                      <td className="px-3 py-2 text-gray-400">{row._rowNum}</td>
                      <td className="px-3 py-2 font-medium">{row.date}</td>
                      <td className="px-3 py-2">{row.start_time}</td>
                      <td className="px-3 py-2">{row.end_time}</td>
                      <td className="px-3 py-2">{row.employee_name || row.employee_id || <span className="text-gray-400">Unassigned</span>}</td>
                      <td className="px-3 py-2">{row.location_name || row.location_id || "—"}</td>
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
                {importing ? <><Loader className="w-4 h-4 mr-2 animate-spin" />Importing...</> : <>Import {validRows.length} Shifts</>}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}