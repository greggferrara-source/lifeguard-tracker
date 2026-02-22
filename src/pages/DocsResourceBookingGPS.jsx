import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, MapPin, Calendar, Users } from "lucide-react";

export default function DocsResourceBookingGPS() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Enhanced Features Documentation</h1>
          <p className="text-gray-600">Resource Booking, Employee Profiles, and GPS Tracking</p>
        </div>

        {/* Resource Booking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Resource Booking Enhancements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span><strong>Conflict Detection:</strong> Real-time visual indicators for double-booked resources</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span><strong>Request/Approval Workflow:</strong> Requests auto-approve if no conflicts exist</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span><strong>Recurring Bookings:</strong> Daily, weekly, bi-weekly, or monthly patterns supported</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span><strong>Calendar View:</strong> Visual availability across all resources</span></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Entities</h3>
              <div className="grid gap-2 text-sm">
                <div className="p-2 bg-blue-50 rounded"><strong>ResourceRequest:</strong> Manages booking requests with auto-approval logic</div>
                <div className="p-2 bg-blue-50 rounded"><strong>ResourceBooking:</strong> Confirmed bookings with conflict tracking</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Key Functions</h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-gray-50 rounded font-mono">checkResourceBookingConflicts</div>
                <div className="p-2 bg-gray-50 rounded font-mono">autoApproveResourceRequest</div>
                <div className="p-2 bg-gray-50 rounded font-mono">processResourceRequest</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Employee Profile System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span><strong>Contact Information:</strong> Email, phone, assigned location</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span><strong>Skills & Certifications:</strong> Track proficiency levels and expiry dates</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span><strong>Work History:</strong> Clock entries and shift assignments linked</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span><strong>HR Management:</strong> Total hours, recent entries, schedule tracking</span></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Pages</h3>
              <div className="grid gap-2 text-sm">
                <div className="p-2 bg-blue-50 rounded"><strong>EmployeeProfile:</strong> Comprehensive profile view with tabs for overview, schedule, and history</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Entities</h3>
              <div className="grid gap-2 text-sm">
                <div className="p-2 bg-blue-50 rounded"><strong>EmployeeSkill:</strong> Skills with proficiency levels and certifications</div>
                <div className="p-2 bg-blue-50 rounded"><strong>Employee:</strong> Extended with gps_tracking_enabled flag</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GPS Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              GPS Tracking & Geofencing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span><strong>Real-time Location Tracking:</strong> Live map view with Leaflet</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span><strong>Geofence Alerts:</strong> Automatic notifications on arrival/departure</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span><strong>Route History:</strong> Track employee movement patterns</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span><strong>Opt-in System:</strong> Employees control their tracking status</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span><strong>Clock-in Verification:</strong> GPS validation prevents out-of-area clock-ins</span></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Pages</h3>
              <div className="grid gap-2 text-sm">
                <div className="p-2 bg-blue-50 rounded"><strong>EmployeeLocationTracking:</strong> Live map with list of active employees</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Components</h3>
              <div className="grid gap-2 text-sm">
                <div className="p-2 bg-blue-50 rounded"><strong>EmployeeLocationMap:</strong> Interactive map with location history</div>
                <div className="p-2 bg-blue-50 rounded"><strong>GeofenceAlerts:</strong> Display arrival/departure events</div>
                <div className="p-2 bg-blue-50 rounded"><strong>MobileClockInWithGPS:</strong> GPS-verified clock in/out</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Entities</h3>
              <div className="grid gap-2 text-sm">
                <div className="p-2 bg-blue-50 rounded"><strong>EmployeeLocationTracking:</strong> GPS coordinates with timestamp and event type</div>
                <div className="p-2 bg-blue-50 rounded"><strong>ClockEntry:</strong> Extended with GPS coordinates and verification status</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Key Functions</h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-gray-50 rounded font-mono">updateEmployeeLocation</div>
                <div className="p-2 bg-gray-50 rounded font-mono">verifyGPSLocation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Setup & Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Enable GPS Tracking</h3>
              <p className="text-sm text-gray-600 mb-2">1. Go to Employee Management</p>
              <p className="text-sm text-gray-600 mb-2">2. Select an employee and enable "GPS Tracking"</p>
              <p className="text-sm text-gray-600 mb-2">3. Employee will see GPS tracking UI in mobile clock in/out</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Configure Geofences</h3>
              <p className="text-sm text-gray-600 mb-2">1. Edit a Location in Location Management</p>
              <p className="text-sm text-gray-600 mb-2">2. Set GPS coordinates (latitude/longitude)</p>
              <p className="text-sm text-gray-600 mb-2">3. Adjust geofence_radius_meters (default: 100m)</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Resource Booking Settings</h3>
              <p className="text-sm text-gray-600 mb-2">1. Check "Auto-approve if no conflicts" in Resource settings</p>
              <p className="text-sm text-gray-600 mb-2">2. Requests will be automatically approved without conflicts</p>
              <p className="text-sm text-gray-600 mb-2">3. Conflicting requests require manual review</p>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><Badge variant="outline">Tip 1</Badge><span>Set appropriate geofence radius based on location size (100-500m typical)</span></li>
              <li className="flex gap-2"><Badge variant="outline">Tip 2</Badge><span>Enable GPS tracking only for field employees who need monitoring</span></li>
              <li className="flex gap-2"><Badge variant="outline">Tip 3</Badge><span>Review location tracking data regularly for compliance</span></li>
              <li className="flex gap-2"><Badge variant="outline">Tip 4</Badge><span>Use recurring bookings for frequently scheduled resources</span></li>
              <li className="flex gap-2"><Badge variant="outline">Tip 5</Badge><span>Configure email notifications for pending approvals</span></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}