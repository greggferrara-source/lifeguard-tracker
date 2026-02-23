import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader, CheckCircle2, AlertTriangle, Wrench } from "lucide-react";
import CSVDropzone from "./CSVDropzone";

const HEADERS = ["name", "asset_tag", "category", "serial_number", "location_name", "status", "condition", "manufacturer", "model", "purchase_date", "purchase_price", "warranty_expiry", "last_maintenance_date", "next_maintenance_due", "notes"];
const STATUS_OPTIONS = ["operational", "needs_maintenance", "out_of_service", "retired", "lost"];
const CATEGORY_OPTIONS = ["safety_equipment", "pool_equipment", "chemical_equipment", "technology", "vehicle", "furniture", "other"];
const CONDITION_OPTIONS = ["excellent", "good", "fair", "poor"];

const downloadTemplate = () => {
  const rows = [
    HEADERS.join(","),
    "AED Unit #1,AQ-001,safety_equipment,AED-2023-001,Main Pool,operational,good,Zoll,AED Plus,2023-06-01,1200,2026-06-01,2024-06-01,2025-06-01,Check battery monthly",
    "Rescue Tube Set A,AQ-002,safety_equipment,RT-2022-005,Beach Zone A,operational,good,Kiefer,,2022-03-15,85,,2024-03-15,2025-03-15,"
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "asset_template.csv"; a.click();
  URL.revokeObjectURL(url);
};

function normalize(row) {
  const status = STATUS_OPTIONS.includes(row.status?.toLowerCase()) ? row.status.toLowerCase() : "active";
  const asset_type = TYPE_OPTIONS.includes(row.asset_type?.toLowerCase()) ? row.asset_type.toLowerCase() : "equipment";
  return {
    name: row.name || row["Name"] || row["Asset Name"] || "",
    asset_type,
    serial_number: row.serial_number || row["Serial Number"] || "",
    location_id: row.location_id || row["Location ID"] || "",
    location_name: row.location_name || row["Location"] || "",
    status,
    purchase_date: row.purchase_date || row["Purchase Date"] || "",
    last_maintenance_date: row.last_maintenance_date || row["Last Maintenance"] || "",
    next_maintenance_date: row.next_maintenance_date || row["Next Maintenance"] || "",
    notes: row.notes || row["Notes"] || ""
  };
}

function validate(r) {
  const errors = [];
  if (!r.name) errors.push("Missing name");
  return errors;
}

export default function AssetImporter() {
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
      const { _errors, _rowNum, ...asset } = row;
      Object.keys(asset).forEach(k => { if (asset[k] === "") delete asset[k]; });
      await base44.entities.Asset.create(asset);
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
            <CardTitle className="text-base flex items-center gap-2"><Wrench className="w-4 h-4" />Import Assets & Equipment</CardTitle>
            <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="w-3.5 h-3.5 mr-1.5" />Template</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CSVDropzone onParsed={handleParsed} />
          {importResult && (
            <div className="rounded-lg p-3 bg-green-50 border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-sm text-green-800 font-medium">Imported {importResult.success} assets successfully!</span>
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
                    {["Row", "Name", "Type", "Serial #", "Location", "Status", "Next Maintenance", "Valid"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.map((row, i) => (
                    <tr key={i} className={row._errors.length > 0 ? "bg-red-50" : "bg-white"}>
                      <td className="px-3 py-2 text-gray-400">{row._rowNum}</td>
                      <td className="px-3 py-2 font-medium">{row.name}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-xs">{row.asset_type}</Badge></td>
                      <td className="px-3 py-2 text-gray-500">{row.serial_number || "—"}</td>
                      <td className="px-3 py-2">{row.location_name || row.location_id || "—"}</td>
                      <td className="px-3 py-2">{row.status}</td>
                      <td className="px-3 py-2">{row.next_maintenance_date || "—"}</td>
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
                {importing ? <><Loader className="w-4 h-4 mr-2 animate-spin" />Importing...</> : <>Import {validRows.length} Assets</>}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}