import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, ClipboardCheck } from "lucide-react";
import { format } from "date-fns";

const priorityColor = { low: "bg-blue-100 text-blue-700", medium: "bg-yellow-100 text-yellow-700", high: "bg-orange-100 text-orange-700", critical: "bg-red-100 text-red-700" };
const statusColor = { open: "bg-red-50 text-red-600", in_progress: "bg-yellow-50 text-yellow-700", resolved: "bg-green-50 text-green-700" };
const resultColor = { pass: "bg-green-100 text-green-700", conditional: "bg-yellow-100 text-yellow-700", fail: "bg-red-100 text-red-700" };

export default function LocationHistoryReport({ maintenance, inspections, locations, dateFrom, dateTo, locationFilter }) {
  const filterData = (arr, dateField = "date") => arr.filter(r => {
    if (dateFrom && r[dateField] < dateFrom) return false;
    if (dateTo && r[dateField] > dateTo) return false;
    if (locationFilter && r.location_id !== locationFilter) return false;
    return true;
  });

  const filteredMaint = filterData(maintenance);
  const filteredInsp = filterData(inspections);

  const openIssues = filteredMaint.filter(m => m.status === "open").length;
  const criticalIssues = filteredMaint.filter(m => m.priority === "critical").length;
  const passedInsp = filteredInsp.filter(i => i.overall_result === "pass").length;
  const inspPassRate = filteredInsp.length > 0 ? Math.round((passedInsp / filteredInsp.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Maintenance Reports", value: filteredMaint.length, color: "text-orange-500" },
          { label: "Open Issues", value: openIssues, color: "text-red-500" },
          { label: "Inspections", value: filteredInsp.length, color: "text-blue-500" },
          { label: "Pass Rate", value: `${inspPassRate}%`, color: "text-green-600" },
        ].map((s, i) => (
          <div key={i} className="bg-gray-50 rounded-2xl p-5">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Maintenance */}
        <Card className="p-6 border border-gray-100 shadow-none rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-4 h-4 text-orange-500" />
            <h3 className="text-base font-semibold text-gray-900">Maintenance History</h3>
          </div>
          {filteredMaint.length === 0 ? <p className="text-sm text-gray-400">No records for selected range</p> : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredMaint.map(m => (
                <div key={m.id} className="p-3 rounded-xl border border-gray-100 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{m.location_name} · {m.date}</p>
                      {m.description && <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>}
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge className={`text-[10px] rounded-full ${priorityColor[m.priority] || "bg-gray-100 text-gray-600"}`}>{m.priority}</Badge>
                      <Badge className={`text-[10px] rounded-full ${statusColor[m.status] || "bg-gray-100 text-gray-600"}`}>{m.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Inspections */}
        <Card className="p-6 border border-gray-100 shadow-none rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="w-4 h-4 text-blue-500" />
            <h3 className="text-base font-semibold text-gray-900">Inspection History</h3>
          </div>
          {filteredInsp.length === 0 ? <p className="text-sm text-gray-400">No records for selected range</p> : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredInsp.map(insp => (
                <div key={insp.id} className="p-3 rounded-xl border border-gray-100 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{insp.location_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{insp.date} · By {insp.inspector_name}</p>
                    </div>
                    <Badge className={`text-[10px] rounded-full ${resultColor[insp.overall_result] || "bg-gray-100"}`}>{insp.overall_result}</Badge>
                  </div>
                  {insp.notes && <p className="text-xs text-gray-400 mt-1">{insp.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}