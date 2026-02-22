import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, User, Heart } from "lucide-react";

export default function EmergencyContactCard({ employee }) {
  if (!employee?.emergency_contact_name) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No emergency contact information on file</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Heart className="w-4 h-4 text-orange-600" />
          Emergency Contact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-gray-600" />
            <p className="text-sm font-semibold text-gray-900">{employee.emergency_contact_name}</p>
          </div>
          {employee.emergency_contact_relationship && (
            <p className="text-xs text-gray-600 ml-6">{employee.emergency_contact_relationship}</p>
          )}
        </div>
        {employee.emergency_contact_phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-600" />
            <a href={`tel:${employee.emergency_contact_phone}`} className="text-sm text-[#1a9c5b] hover:underline">
              {employee.emergency_contact_phone}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}