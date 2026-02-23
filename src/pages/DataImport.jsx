import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Users, MapPin, Award, Wrench, CalendarDays, FileText } from "lucide-react";
import EmployeeImporter from "../components/import/EmployeeImporter";
import LocationImporter from "../components/import/LocationImporter";
import CertificationImporter from "../components/import/CertificationImporter";
import AssetImporter from "../components/import/AssetImporter";
import ShiftImporter from "../components/import/ShiftImporter";

export default function DataImport() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Upload className="w-7 h-7 text-[#1a9c5b]" />
            Data Import
          </h1>
          <p className="text-gray-600 mt-1">Import your company data from your previous system using CSV files.</p>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4 flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How it works</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Choose the data type you want to import</li>
                <li>Download the template CSV and fill in your data (or export from your old system)</li>
                <li>Upload the file — we'll validate and preview every row</li>
                <li>Review errors, then confirm the import</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="employees">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="employees" className="flex items-center gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />Employees
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5" />Locations
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-1.5 text-xs">
              <Award className="w-3.5 h-3.5" />Certifications
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-1.5 text-xs">
              <Wrench className="w-3.5 h-3.5" />Assets
            </TabsTrigger>
            <TabsTrigger value="shifts" className="flex items-center gap-1.5 text-xs">
              <CalendarDays className="w-3.5 h-3.5" />Shifts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="mt-4"><EmployeeImporter /></TabsContent>
          <TabsContent value="locations" className="mt-4"><LocationImporter /></TabsContent>
          <TabsContent value="certifications" className="mt-4"><CertificationImporter /></TabsContent>
          <TabsContent value="assets" className="mt-4"><AssetImporter /></TabsContent>
          <TabsContent value="shifts" className="mt-4"><ShiftImporter /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}