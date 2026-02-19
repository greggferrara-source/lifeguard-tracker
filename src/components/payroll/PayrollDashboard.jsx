import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function PayrollDashboard({ payPeriods, payrolls, payments, onNewPayroll }) {
  const openPayrolls = payrolls.filter(p => p.status === "draft");
  const readyPayrolls = payrolls.filter(p => p.status === "ready_for_review");
  const processingPayrolls = payrolls.filter(p => p.status === "processing");

  return (
    <div className="space-y-6">
      {/* Open Payrolls */}
      {openPayrolls.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-orange-900">
              <AlertCircle className="w-5 h-5" />
              Payrolls in Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {openPayrolls.map(payroll => (
              <div key={payroll.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{payroll.pay_period_name}</p>
                  <p className="text-sm text-gray-600">{payroll.total_employees} employees</p>
                </div>
                <Button variant="outline" size="sm">Continue Editing</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Ready for Approval */}
      {readyPayrolls.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-blue-900">
              <Clock className="w-5 h-5" />
              Ready for Approval
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {readyPayrolls.map(payroll => (
              <div key={payroll.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{payroll.pay_period_name}</p>
                  <p className="text-sm text-gray-600">Total: ${payroll.total_net_pay.toFixed(2)}</p>
                </div>
                <Button variant="default" size="sm">Review & Approve</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Processing */}
      {processingPayrolls.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {processingPayrolls.map(payroll => (
              <div key={payroll.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{payroll.pay_period_name}</p>
                  <p className="text-sm text-gray-600">Total: ${payroll.total_net_pay.toFixed(2)}</p>
                </div>
                <Badge>Processing</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Active Payrolls */}
      {openPayrolls.length === 0 && readyPayrolls.length === 0 && processingPayrolls.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-gray-500 mb-4">No active payrolls</p>
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={() => onNewPayroll(null)}>
              Create New Payroll
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Completions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-green-900">
            <CheckCircle className="w-5 h-5" />
            Recently Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {payrolls
              .filter(p => p.status === "completed")
              .sort((a, b) => new Date(b.processed_at) - new Date(a.processed_at))
              .slice(0, 10)
              .map(payroll => (
                <div key={payroll.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{payroll.pay_period_name}</p>
                    <p className="text-xs text-gray-500">${payroll.total_net_pay.toFixed(2)}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}