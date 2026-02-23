import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Users, MapPin, CheckCircle2, AlertTriangle, Download, Loader, X, FileText } from "lucide-react";
import EmployeeImporter from "@/components/import/EmployeeImporter";
import LocationImporter from "@/components/import/LocationImporter";

export default function DataImport() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Upload className="w-7 h-7 text-[#1a9c5b]" />
            Data Import
          </h1>
          <p className="text-gray-600 mt-1">Import your employee roster and facility locations from your previous system using CSV files.</p>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4 flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How it works</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Download the template CSV for employees or locations</li>
                <li>Fill in your data using your old system's export or manually</li>
                <li>Upload the file — we'll preview and validate it before importing</li>
                <li>Review and confirm the import</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="employees">
          <TabsList className="grid grid-cols-2 w-full max-w-xs">
            <TabsTrigger value="employees"><Users className="w-3.5 h-3.5 mr-1.5" />Employees</TabsTrigger>
            <TabsTrigger value="locations"><MapPin className="w-3.5 h-3.5 mr-1.5" />Locations</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="mt-4">
            <EmployeeImporter />
          </TabsContent>

          <TabsContent value="locations" className="mt-4">
            <LocationImporter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}