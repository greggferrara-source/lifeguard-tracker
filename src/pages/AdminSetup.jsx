import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, MapPin, Users, Calendar, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminSetup() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  if (user && user.role !== "admin") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Setup Guide</h1>
        <p className="text-gray-600 mt-2">Admin access required.</p>
      </div>
    );
  }

  const steps = [
    {
      title: "Add Locations",
      description: "Create pools, beaches, or facilities you manage",
      icon: MapPin,
      completed: locations.length > 0,
      action: "Locations",
      count: locations.length,
    },
    {
      title: "Add Employees",
      description: "Invite lifeguards and managers to the system",
      icon: Users,
      completed: employees.length > 0,
      action: "Employees",
      count: employees.length,
    },
    {
      title: "Set Up Schedule",
      description: "Create your first week of shifts",
      icon: Calendar,
      completed: false,
      action: "Schedule",
    },
    {
      title: "Configure Permissions",
      description: "Set roles and access levels for your team",
      icon: Lock,
      completed: true,
      action: "Settings",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-14 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Welcome to LifeGuard Tracker</h1>
        <p className="text-gray-500 mt-2 text-lg">Complete these steps to get your facility up and running.</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-[#f0faf5] to-[#e8f5f1] rounded-2xl p-6 border border-[#1a9c5b]/20">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-[#1a9c5b]" />
          <p className="font-semibold text-gray-900">Getting Started</p>
        </div>
        <p className="text-sm text-gray-700">You have {[locations.length > 0, employees.length > 0].filter(Boolean).length} of 4 steps completed. Let's finish setting up your account!</p>
      </div>

      {/* Setup Steps */}
      <div className="space-y-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <Card key={i} className={`border-2 ${step.completed ? "border-green-200 bg-green-50" : "border-gray-200"}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${step.completed ? "bg-green-100" : "bg-gray-100"}`}>
                    <Icon className={`w-6 h-6 ${step.completed ? "text-green-600" : "text-gray-600"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      {step.completed && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      {step.count !== undefined && <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium">{step.count} added</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                  <Link to={createPageUrl(step.action)}>
                    <Button
                      variant={step.completed ? "outline" : "default"}
                      className={step.completed ? "text-gray-600" : "bg-[#1a9c5b] hover:bg-[#158a4e]"}
                    >
                      {step.completed ? "Manage" : "Get Started"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">
            Check out our <Link to={createPageUrl("Docs")} className="text-[#1a9c5b] hover:underline font-medium">documentation</Link> or <Link to={createPageUrl("Contact")} className="text-[#1a9c5b] hover:underline font-medium">contact support</Link> if you get stuck.
          </p>
          <Link to={createPageUrl("Tutorials")}>
            <Button variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-100">
              Watch Setup Videos
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}