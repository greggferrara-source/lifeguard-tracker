import React, { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CSVDropzone({ onParsed }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return { headers: [], rows: [] };
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1).map(line => {
      // Handle quoted commas
      const cols = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') { inQuotes = !inQuotes; continue; }
        if (line[i] === "," && !inQuotes) { cols.push(current.trim()); current = ""; continue; }
        current += line[i];
      }
      cols.push(current.trim());
      const obj = {};
      headers.forEach((h, i) => { obj[h] = cols[i] || ""; });
      return obj;
    }).filter(r => Object.values(r).some(v => v));
    return { headers, rows };
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) { setError("Please upload a .csv file"); return; }
    setError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result);
      onParsed(parsed);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const clear = () => { setFileName(null); setError(null); onParsed(null); };

  return (
    <div>
      {!fileName ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${dragging ? "border-[#1a9c5b] bg-green-50" : "border-gray-200 hover:border-[#1a9c5b] bg-white hover:bg-green-50/30"}`}
        >
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700">Drop your CSV here or <span className="text-[#1a9c5b] underline">browse</span></p>
          <p className="text-xs text-gray-400 mt-1">.csv files only</p>
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <FileText className="w-6 h-6 text-green-600 shrink-0" />
          <span className="text-sm font-medium text-green-800 flex-1">{fileName}</span>
          <Button variant="ghost" size="icon" onClick={clear} className="h-7 w-7"><X className="w-4 h-4" /></Button>
        </div>
      )}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}