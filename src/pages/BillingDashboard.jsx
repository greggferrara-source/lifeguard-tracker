import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "date-fns";

export default function BillingDashboard() {
  const [user, setUser] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: billingData, isLoading } = useQuery({
    queryKey: ["billing-transactions"],
    queryFn: async () => {
      const res = await base44.functions.invoke("getStripeTransactions", {
        limit: 50,
      });
      return res.data;
    },
    enabled: !!user?.role === 'admin',
  });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600">
              Only administrators can access the billing dashboard.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const transactions = billingData?.transactions || [];
  const customers = billingData?.customers || [];
  const subscriptions = billingData?.subscriptions || [];

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const emailMatch = !searchEmail || t.customer_email?.toLowerCase().includes(searchEmail.toLowerCase());
    const statusMatch = statusFilter === 'all' || t.status === statusFilter;
    return emailMatch && statusMatch;
  });

  // Calculate totals
  const successfulTransactions = transactions.filter((t) => t.paid);
  const totalRevenue = successfulTransactions.reduce((sum, t) => sum + t.amount, 0);
  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active').length;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Billing Dashboard
          </h1>
          <p className="text-gray-600">
            Manage payments, subscriptions, and customer information
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Successful Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {successfulTransactions.length}
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeSubscriptions}
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.length}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="open">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Customer Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {t.customer_email || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${t.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge
                          className={`${
                            t.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : t.status === "open"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(new Date(t.created), "MMM dd, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Subscriptions Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscriptions</h2>
          <Card>
            {subscriptions.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No subscriptions</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {subscriptions.slice(0, 10).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-6 hover:bg-gray-50 transition-colors flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {sub.customer}
                      </p>
                      <p className="text-sm text-gray-600">
                        {sub.items.data[0]?.plan?.product} •{" "}
                        {sub.items.data[0]?.plan?.interval === "month"
                          ? "Monthly"
                          : "Yearly"}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={`${
                          sub.status === "active"
                            ? "bg-green-100 text-green-800"
                            : sub.status === "past_due"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {sub.status.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}