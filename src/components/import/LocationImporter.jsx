import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader, CheckCircle2, AlertTriangle, MapPin } from "lucide-react";
import CSVDropzone from "./CSVDropzone";

const LOCATION_TEMPLATE_HEADERS = [
  "name", "type", "address", "status", "min_guards_required", "notes"
];

const TYPE_OPTIONS = ["pool", "beach", "waterpark", "lake", "other"];
const STATUS_OPTIONS = ["active", "inactive", "seasonal"];

const downloadTemplate = () => {
  const rows = [
    LOCATION_TEMPLATE_HEADERS.join(","),
    "Main Pool,pool,123 Aquatic Dr,active,2,Indoor olympic pool",
    "Beach Zone A,beach,456 Shore Blvd,active,3,North beach section"
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "location_template.csv"; a.click();
  URL.revokeObjectURL(url);
};

function normalizeLocation(row) {
  const type = TYPE_OPTIONS.includes(row.type?.toLowerCase()) ? row.type.toLowerCase() : "pool";
  const status = STATUS_OPTIONS.includes(row.status?.toLowerCase()) ? row.status.toLowerCase() : "active";
  return {
    name: row.name || row["Name"] || row["Location Name"] || "",
    type,
    address: row.address || row["Address"] || "",
    status,
    min_guards_required: parseInt(row.min_guards_required || row["Min Guards"] || 1) || 1,
    notes: row.notes || row["Notes"] || ""
  };
}

function validateLocation(loc) {
  const errors = [];
  if (!loc.name) errors.push("Missing name");
  return errors;
}

export default function LocationImporter() {
  const [parsed, setParsed] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleParsed = (data) => {
    if (!data) { setParsed(null); setPreview(null); return; }
    const rows = data.rows.map((row, i) => {
      const loc = normalizeLocation(row);
      const errors = validateLocation(loc);
      return { ...loc, _errors: errors, _rowNum: i + 2 };
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
    let success = 0;
    for (const row of validRows) {
      const { _errors, _rowNum, ...loc } = row;
      Object.keys(loc).forEach(k => { if (loc[k] === "" || loc[k] === undefined) delete loc[k]; });
      await base44.entities.Location.create(loc);
      success++;
    }
    setImportResult({ success });
    setImporting(false);
    setPreview(null);
    setParsed(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4" />Import Locations / Facilities</CardTitle>
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
                Imported {importResult.success} locations successfully!
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {preview && preview.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Preview — {preview.length} rows detected</CardTitle>
              <div className="flex gap-2">
                {invalidRows.length > 0 && <Badge variant="destructive" className="text-xs">{invalidRows.length} errors</Badge>}
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
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Name</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Type</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Address</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Status</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Min Guards</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Valid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.map((row, i) => (
                    <tr key={i} className={row._errors.length > 0 ? "bg-red-50" : "bg-white"}>
                      <td className="px-3 py-2 text-gray-400">{row._rowNum}</td>
                      <td className="px-3 py-2 font-medium">{row.name}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="text-xs">{row.type}</Badge>
                      </td>
                      <td className="px-3 py-2 text-gray-500">{row.address || "—"}</td>
                      <td className="px-3 py-2">{row.status}</td>
                      <td className="px-3 py-2">{row.min_guards_required}</td>
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
                  <>Import {validRows.length} Locations</>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}