import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { DollarSign, Plus, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PayrollDashboard from "@/components/payroll/PayrollDashboard";
import PayPeriodList from "@/components/payroll/PayPeriodList";
import PayrollDialog from "@/components/payroll/PayrollDialog";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function Payroll() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const { data: payPeriods = [] } = useQuery({
    queryKey: ["payPeriods"],
    queryFn: () => base44.entities.PayPeriod.list("-start_date", 50),
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ["payrolls"],
    queryFn: () => base44.entities.Payroll.list("-created_date", 100),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: () => base44.entities.Payment.list("-created_date", 100),
  });

  const activePeriod = payPeriods.find(p => p.status === "open" || p.status === "closed");
  const pendingPayrolls = payrolls.filter(p => p.status === "draft" || p.status === "ready_for_review");
  const processingPayments = payments.filter(p => p.status === "processing");
  const completedPayments = payments.filter(p => p.status === "completed");

  const handleNewPayroll = (period) => {
    setSelectedPeriod(period);
    setDialogOpen(true);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600 mt-1">Manage employee compensation and payments</p>
        </div>
        <Button className="bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={() => {
          setSelectedPeriod(null);
          setDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New Pay Period
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Pay Period</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-gray-900">
              {activePeriod ? format(new Date(activePeriod.start_date), "MMM d") : "None"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {activePeriod ? activePeriod.status : "No active period"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Payrolls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-orange-600">{pendingPayrolls.length}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-blue-600">{processingPayments.length}</p>
            <p className="text-xs text-gray-500 mt-1">Payments in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-green-600">{completedPayments.length}</p>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="periods">Pay Periods</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <PayrollDashboard
            payPeriods={payPeriods}
            payrolls={payrolls}
            payments={payments}
            onNewPayroll={handleNewPayroll}
          />
        </TabsContent>

        <TabsContent value="periods" className="space-y-4">
          <PayPeriodList
            payPeriods={payPeriods}
            payrolls={payrolls}
            onNewPayroll={handleNewPayroll}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {payments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No payment history yet</p>
                </CardContent>
              </Card>
            ) : (
              payments.slice(0, 20).map(payment => (
                <Card key={payment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{payment.employee_name}</p>
                        <p className="text-sm text-gray-600">{payment.pay_period_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${payment.net_amount.toFixed(2)}</p>
                        <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <PayrollDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        payPeriod={selectedPeriod}
      />
    </div>
  );
}