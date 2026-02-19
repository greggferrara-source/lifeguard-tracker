import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Award,
  AlertTriangle,
  Calendar,
  DollarSign,
  Clock,
  Edit,
  X,
} from "lucide-react";
import { format, parseISO, isPast } from "date-fns";

const roleLabels = {
  lifeguard: "Lifeguard",
  head_lifeguard: "Head Lifeguard",
  supervisor: "Supervisor",
  manager: "Manager",
};

const statusColors = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  on_leave: "bg-amber-100 text-amber-700",
};

export default function EmployeeProfile({ employee, shifts = [], onEdit, onClose }) {
  const expiredCerts = employee?.certifications?.filter(
    (c) => c.expiry_date && isPast(parseISO(c.expiry_date))
  ) || [];

  const expiringSoon = employee?.certifications?.filter((c) => {
    if (!c.expiry_date) return false;
    const expiry = parseISO(c.expiry_date);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return !isPast(expiry) && expiry <= thirtyDaysFromNow;
  }) || [];

  const upcomingShifts = shifts
    .filter((s) => s.employee_id === employee?.id && s.status !== "cancelled")
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: employee?.color || "#0ea5e9" }}
          >
            {(employee?.first_name?.[0] || "")}{(employee?.last_name?.[0] || "")}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {employee?.first_name} {employee?.last_name}
            </h2>
            <p className="text-gray-600">{roleLabels[employee?.role]}</p>
            <Badge className={`mt-2 rounded-full ${statusColors[employee?.status]}`}>
              {employee?.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={onEdit} title="Edit">
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={onClose} title="Close">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Contact & Compensation */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Contact Information</h3>
        <div className="space-y-3">
          {employee?.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-500" />
              <a href={`mailto:${employee.email}`} className="text-blue-600 hover:underline">
                {employee.email}
              </a>
            </div>
          )}
          {employee?.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-500" />
              <a href={`tel:${employee.phone}`} className="text-blue-600 hover:underline">
                {employee.phone}
              </a>
            </div>
          )}
          {employee?.hourly_rate && (
            <div className="flex items-center gap-3 text-sm">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">${employee.hourly_rate}/hr</span>
            </div>
          )}
          {employee?.max_hours_per_week && (
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{employee.max_hours_per_week} hrs/week max</span>
            </div>
          )}
        </div>
      </Card>

      {/* Certifications */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-gray-900" />
          <h3 className="font-semibold text-gray-900">Certifications</h3>
        </div>

        {expiredCerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-900">
                  {expiredCerts.length} expired certification{expiredCerts.length !== 1 ? "s" : ""}
                </p>
                <div className="space-y-1 mt-2">
                  {expiredCerts.map((c, i) => (
                    <p key={i} className="text-xs text-red-700">
                      {c.name} - Expired {format(parseISO(c.expiry_date), "MMM d, yyyy")}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {expiringSoon.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-amber-900 mb-2">
              {expiringSoon.length} expiring soon
            </p>
            <div className="space-y-1">
              {expiringSoon.map((c, i) => (
                <p key={i} className="text-xs text-amber-700">
                  {c.name} - Expires {format(parseISO(c.expiry_date), "MMM d, yyyy")}
                </p>
              ))}
            </div>
          </div>
        )}

        {employee?.certifications && employee.certifications.length > 0 && (
          <div className="space-y-2">
            {employee.certifications.map((cert, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">{cert.name}</p>
                  {cert.expiry_date && (
                    <p className="text-xs text-gray-600">
                      Expires: {format(parseISO(cert.expiry_date), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!employee?.certifications || employee.certifications.length === 0 ? (
          <p className="text-sm text-gray-500">No certifications on file</p>
        ) : null}
      </Card>

      {/* Upcoming Shifts */}
      {upcomingShifts.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Upcoming Shifts</h3>
          <div className="space-y-2">
            {upcomingShifts.map((shift) => (
              <div key={shift.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{shift.location_name}</p>
                    <p className="text-xs text-gray-600">
                      {format(parseISO(shift.date), "MMM d, yyyy")} · {shift.start_time} – {shift.end_time}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs rounded-full">
                    {shift.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Notes */}
      {employee?.notes && (
        <Card className="p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Notes</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{employee.notes}</p>
        </Card>
      )}
    </div>
  );
}