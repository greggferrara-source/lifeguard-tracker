import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, DollarSign, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { subDays, subMonths, isAfter, parseISO } from "date-fns";

const PERIODS = [
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Last 6 months", value: 180 },
  { label: "All time", value: 0 },
];

export default function VendorPerformance({ bills, vendors }) {
  const [periodDays, setPeriodDays] = useState(90);

  const filteredBills = useMemo(() => {
    if (!periodDays) return bills;
    const cutoff = subDays(new Date(), periodDays);
    return bills.filter(b => b.issue_date && isAfter(parseISO(b.issue_date), cutoff));
  }, [bills, periodDays]);

  const vendorMetrics = useMemo(() => {
    const map = {};
    for (const bill of filteredBills) {
      const key = bill.vendor_name || "Unknown";
      if (!map[key]) map[key] = { name: key, bills: [], totalSpent: 0, paidOnTime: 0, paidLate: 0, unpaid: 0 };
      map[key].bills.push(bill);
      map[key].totalSpent += bill.amount || 0;
      if (bill.status === "paid") {
        const due = bill.due_date ? new Date(bill.due_date) : null;
        const paid = bill.paid_date ? new Date(bill.paid_date) : null;
        if (due && paid && paid <= due) map[key].paidOnTime++;
        else map[key].paidLate++;
      } else if (bill.status === "overdue" || (bill.due_date && new Date(bill.due_date) < new Date() && bill.status !== "cancelled")) {
        map[key].unpaid++;
      }
    }
    return Object.values(map).map(v => ({
      ...v,
      avgAmount: v.bills.length ? v.totalSpent / v.bills.length : 0,
      totalPaid: v.paidOnTime + v.paidLate,
      onTimeRate: (v.paidOnTime + v.paidLate) > 0 ? Math.round((v.paidOnTime / (v.paidOnTime + v.paidLate)) * 100) : null,
    })).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);
  }, [filteredBills]);

  const chartData = vendorMetrics.map(v => ({ name: v.name.length > 14 ? v.name.slice(0, 13) + "…" : v.name, spent: parseFloat(v.totalSpent.toFixed(2)) }));

  const COLORS = ["#1a9c5b", "#2db872", "#3dca82", "#56d994", "#74e2a8", "#93eabc"];

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 font-medium">Period:</span>
        <div className="flex gap-1 flex-wrap">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriodDays(p.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${periodDays === p.value ? "bg-[#1a9c5b] text-white border-[#1a9c5b]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {vendorMetrics.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p>No vendor data for this period.</p>
        </div>
      ) : (
        <>
          {/* Top vendors chart */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Total Spend by Vendor (Top 10)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(val) => [`$${val.toFixed(2)}`, "Spent"]} />
                <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Vendor table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Vendor", "Bills", "Total Spent", "Avg Amount", "On-Time Rate", "Overdue"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendorMetrics.map(v => (
                  <tr key={v.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                    <td className="px-4 py-3 text-gray-600">{v.bills.length}</td>
                    <td className="px-4 py-3 font-semibold">${v.totalSpent.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">${v.avgAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {v.onTimeRate === null ? (
                        <span className="text-gray-400 text-xs">No data</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${v.onTimeRate}%`, backgroundColor: v.onTimeRate >= 80 ? "#1a9c5b" : v.onTimeRate >= 50 ? "#f59e0b" : "#ef4444" }} />
                          </div>
                          <span className={`text-xs font-medium ${v.onTimeRate >= 80 ? "text-green-700" : v.onTimeRate >= 50 ? "text-yellow-700" : "text-red-600"}`}>{v.onTimeRate}%</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {v.unpaid > 0 ? (
                        <Badge className="bg-red-100 text-red-700 border-0">{v.unpaid} overdue</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 border-0">All clear</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}