import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";

export default function PayPeriodList({ payPeriods, payrolls, onNewPayroll }) {
  const getPayrollForPeriod = (periodId) => {
    return payrolls.find(p => p.pay_period_id === periodId);
  };

  const statusColors = {
    open: "bg-blue-100 text-blue-800",
    closed: "bg-gray-100 text-gray-800",
    approved: "bg-green-100 text-green-800",
    processed: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-3">
      {payPeriods.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-gray-500 mb-4">No pay periods created yet</p>
            <Button className="bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={() => onNewPayroll(null)}>
              Create First Pay Period
            </Button>
          </CardContent>
        </Card>
      ) : (
        payPeriods.map(period => {
          const payroll = getPayrollForPeriod(period.id);
          return (
            <Card key={period.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{period.name}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(period.start_date), "MMM d")} - {format(new Date(period.end_date), "MMM d, yyyy")}
                    </p>
                    {payroll && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge className={statusColors[period.status] || "bg-gray-100 text-gray-800"}>
                          {period.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {payroll.total_employees} employees • ${payroll.total_net_pay.toFixed(2)} total
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNewPayroll(period)}
                  >
                    {payroll ? "View Payroll" : "Create Payroll"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}