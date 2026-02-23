import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MapPin, AlertTriangle, Clock, Users, FileText, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function EmergencyCall() {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [notes, setNotes] = useState("");
  const [dispatched, setDispatched] = useState(false);
  const [dispatchRecord, setDispatchRecord] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });
  const { data: clockEntries = [] } = useQuery({ queryKey: ["clock-entries-all"], queryFn: () => base44.entities.ClockEntry.filter({ status: "clocked_in" }) });

  const location = locations.find(l => l.id === selectedLocation);
  const guardsOnSite = clockEntries.filter(e => e.location_id === selectedLocation);

  const incidentTypes = [
    "Drowning / Near-Drowning",
    "Cardiac Arrest",
    "Injury / Trauma",
    "Seizure",
    "Spinal Injury",
    "Breathing Emergency",
    "Unconscious Patron",
    "Other Medical Emergency",
  ];

  const logDispatch = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.IncidentLog.create({
        location_id: data.location_id,
        location_name: data.location_name,
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm"),
        type: "rescue",
        severity: "critical",
        description: `911 DISPATCH: ${data.incident_type}. ${data.notes}`,
        ems_called: true,
        reporting_staff_name: user?.full_name || "Unknown",
        reporting_staff_email: user?.email || "",
        action_taken: `EMS dispatched at ${format(new Date(), "HH:mm")}. Guards on site: ${data.guards.map(g => g.employee_name).join(", ")}`,
        status: "open",
      });
    },
    onSuccess: (record) => {
      setDispatchRecord(record);
      setDispatched(true);
      queryClient.invalidateQueries({ queryKey: ["incident-logs"] });
    },
  });

  const handleDispatch = () => {
    if (!selectedLocation || !incidentType) return;
    logDispatch.mutate({
      location_id: selectedLocation,
      location_name: location?.name,
      incident_type: incidentType,
      notes,
      guards: guardsOnSite,
    });
  };

  const reset = () => {
    setDispatched(false);
    setDispatchRecord(null);
    setSelectedLocation("");
    setIncidentType("");
    setNotes("");
  };

  if (dispatched) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-2 border-green-400 bg-green-50">
          <CardContent className="py-10 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-green-800">Dispatch Logged</h2>
            <p className="text-green-700">Incident has been logged and your team has been notified.</p>
            <div className="bg-white rounded-lg p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="font-medium">Location:</span><span>{location?.name}</span></div>
              <div className="flex justify-between"><span className="font-medium">Type:</span><span>{incidentType}</span></div>
              <div className="flex justify-between"><span className="font-medium">Time:</span><span>{format(new Date(), "HH:mm")}</span></div>
              <div className="flex justify-between"><span className="font-medium">Guards on site:</span><span>{guardsOnSite.length}</span></div>
              {location?.address && <div className="flex justify-between"><span className="font-medium">Address:</span><span>{location.address}</span></div>}
            </div>
            <p className="text-xs text-green-600 font-medium">📋 Incident report #{dispatchRecord?.id?.slice(0, 8)} created automatically</p>
            <Button onClick={reset} variant="outline">Log Another Incident</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Phone className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Emergency Dispatch</h1>
        <p className="text-gray-500 text-sm mt-1">Pre-populate 911 call details and auto-log the incident</p>
      </div>

      {/* Big 911 Call Button */}
      <Card className="border-2 border-red-300 bg-red-50">
        <CardContent className="py-6 text-center">
          <p className="text-red-700 font-semibold text-lg mb-1">📞 Call 911 Now</p>
          <p className="text-red-600 text-sm mb-4">Tap to call emergency services directly</p>
          <a href="tel:911">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white text-xl font-bold px-10 py-6 rounded-xl shadow-lg">
              CALL 911
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Incident Details Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" /> Log Incident Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location..." />
              </SelectTrigger>
              <SelectContent>
                {locations.map(loc => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Info Card */}
          {location && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
              {location.address && <div className="flex items-center gap-2 text-gray-700"><MapPin className="w-4 h-4 text-gray-400" />{location.address}</div>}
              {location.latitude && location.longitude && (
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4" />GPS: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-4 h-4 text-gray-400" />
                {guardsOnSite.length > 0
                  ? `Guards on site: ${guardsOnSite.map(g => g.employee_name).join(", ")}`
                  : "No guards currently clocked in"}
              </div>
            </div>
          )}

          {/* Incident Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Incident Type</label>
            <Select value={incidentType} onValueChange={setIncidentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select incident type..." />
              </SelectTrigger>
              <SelectContent>
                {incidentTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Additional Notes</label>
            <Textarea
              placeholder="Patient description, condition, any other relevant details..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleDispatch}
            disabled={!selectedLocation || !incidentType || logDispatch.isPending}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {logDispatch.isPending ? "Logging..." : "Log Incident & Notify Team"}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Quick Reference Numbers</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Police Non-Emergency", number: "311" },
              { label: "Poison Control", number: "1-800-222-1222" },
              { label: "Coast Guard", number: "*CG (*24)" },
            ].map(item => (
              <a key={item.label} href={`tel:${item.number}`} className="flex items-center gap-2 bg-white rounded-lg p-2 text-sm hover:bg-blue-50 transition-colors border border-gray-200">
                <Phone className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="font-medium text-xs">{item.label}</div>
                  <div className="text-gray-500 text-xs">{item.number}</div>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}