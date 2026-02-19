import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { format, addDays, addWeeks } from "date-fns";
import { X } from "lucide-react";

export default function PayrollDialog({ open, onOpenChange, payPeriod }) {
  const [step, setStep] = useState("type");
  const [frequency, setFrequency] = useState("weekly");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [payDate, setPayDate] = useState(format(addDays(new Date(), 5), "yyyy-MM-dd"));

  const handleNext = () => {
    if (step === "type") {
      setStep("dates");
    } else {
      // Create pay period
      onOpenChange(false);
      setStep("type");
    }
  };

  const getEndDate = () => {
    const start = new Date(startDate);
    switch (frequency) {
      case "weekly":
        return format(addDays(start, 6), "yyyy-MM-dd");
      case "biweekly":
        return format(addDays(start, 13), "yyyy-MM-dd");
      case "semimonthly":
        return format(addDays(start, 14), "yyyy-MM-dd");
      case "monthly":
        return format(addDays(start, 29), "yyyy-MM-dd");
      default:
        return format(addDays(start, 6), "yyyy-MM-dd");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {payPeriod ? "Create Payroll" : "New Pay Period"}
          </DialogTitle>
          <DialogDescription>
            {step === "type" ? "Choose your payroll frequency" : "Set the pay period dates"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === "type" ? (
            <div className="space-y-3">
              {[
                { value: "weekly", label: "Weekly", desc: "Every 7 days" },
                { value: "biweekly", label: "Biweekly", desc: "Every 14 days" },
                { value: "semimonthly", label: "Semi-Monthly", desc: "Every 15 days" },
                { value: "monthly", label: "Monthly", desc: "Every 30 days" },
              ].map(opt => (
                <Card
                  key={opt.value}
                  className={`cursor-pointer transition-all ${
                    frequency === opt.value
                      ? "border-[#1a9c5b] bg-blue-50"
                      : "hover:border-gray-300"
                  }`}
                  onClick={() => setFrequency(opt.value)}
                >
                  <CardContent className="pt-4 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{opt.label}</p>
                      <p className="text-sm text-gray-600">{opt.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="start-date" className="text-sm font-medium">
                  Period Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Period End Date
                </Label>
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-gray-700">
                  {format(new Date(getEndDate()), "MMM dd, yyyy")}
                </div>
              </div>
              <div>
                <Label htmlFor="pay-date" className="text-sm font-medium">
                  Payment Date
                </Label>
                <Input
                  id="pay-date"
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#1a9c5b] hover:bg-[#158a4e]"
            onClick={handleNext}
          >
            {step === "type" ? "Next" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}