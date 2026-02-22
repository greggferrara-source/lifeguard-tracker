import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Clock, MapPin, User, Calendar, AlertTriangle, Siren, ClipboardList } from "lucide-react";
import IncidentFollowUpPanel from "./IncidentFollowUpPanel";

const typeStyle = { rescue: "bg-red-100 text-red-700", incident: "bg-orange-100 text-orange-700", near_miss: "bg-yellow-100 text-yellow-700", first_aid: "bg-blue-100 text-blue-700", injury: "bg-purple-100 text-purple-700", other: "bg-gray-100 text-gray-600" };
const severityStyle = { minor: "bg-green-100 text-green-700", moderate: "bg-yellow-100 text-yellow-700", serious: "bg-orange-100 text-orange-700", critical: "bg-red-100 text-red-700" };
const statusStyle = { open: "bg-red-100 text-red-700", reviewed: "bg-yellow-100 text-yellow-700", closed: "bg-green-100 text-green-700" };

export default function IncidentDetailDrawer({ incident, onClose }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState("details");

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.IncidentLog.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incident-logs"] })
  });

  if (!incident) return null;

  return (
    <Sheet open={!!incident} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Incident Report
          </SheetTitle>
        </SheetHeader>

        {/* Tabs */}
        <div className="mt-4 mb-2">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1 text-xs">Details</TabsTrigger>
              <TabsTrigger value="followup" className="flex-1 text-xs flex items-center gap-1">
                <ClipboardList className="w-3 h-3" />
                Follow-Up
                {incident.follow_up_required && incident.status !== "closed" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 ml-1" />
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {tab === "details" && <div className="space-y-5 mt-4">
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge className={typeStyle[incident.type]}>{incident.type?.replace("_", " ")}</Badge>
            <Badge className={severityStyle[incident.severity]}>{incident.severity}</Badge>
            <Badge className={statusStyle[incident.status]}>{incident.status}</Badge>
            {incident.ems_called && <Badge className="bg-red-100 text-red-700"><Siren className="w-3 h-3 mr-1" />EMS Called</Badge>}
            {incident.patron_transported && <Badge className="bg-purple-100 text-purple-700">Patron Transported</Badge>}
            {incident.follow_up_required && <Badge className="bg-yellow-100 text-yellow-700">Follow-Up Required</Badge>}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div><p className="text-xs text-gray-400">Location</p><p className="font-medium">{incident.location_name || "—"}</p></div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div><p className="text-xs text-gray-400">Date / Time</p><p className="font-medium">{incident.date}{incident.time ? ` · ${incident.time}` : ""}</p></div>
            </div>
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-gray-400 mt-0.5" />
              <div><p className="text-xs text-gray-400">Reported By</p><p className="font-medium">{incident.reporting_staff_name || incident.reporting_staff_email || "—"}</p></div>
            </div>
            {incident.patron_name && (
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div><p className="text-xs text-gray-400">Patron / Victim</p><p className="font-medium">{incident.patron_name}{incident.patron_age ? `, age ${incident.patron_age}` : ""}</p></div>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Description</p>
            <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 rounded-lg p-3">{incident.description}</p>
          </div>

          {incident.action_taken && (
            <div>
              <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Action Taken</p>
              <p className="text-sm text-gray-800 bg-blue-50 rounded-lg p-3">{incident.action_taken}</p>
            </div>
          )}

          {incident.witnesses && (
            <div>
              <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Witnesses</p>
              <p className="text-sm text-gray-800">{incident.witnesses}</p>
            </div>
          )}

          {incident.follow_up_notes && (
            <div>
              <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Follow-Up Notes</p>
              <p className="text-sm text-gray-800 bg-yellow-50 rounded-lg p-3">{incident.follow_up_notes}</p>
            </div>
          )}

          {/* Photo Attachments */}
          {incident.photo_urls?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Photos ({incident.photo_urls.length})</p>
              <div className="flex flex-wrap gap-2">
                {incident.photo_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Photo ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Status actions */}
          {incident.status !== "closed" && (
            <div className="flex gap-2 pt-2 border-t">
              {incident.status === "open" && (
                <Button variant="outline" size="sm" className="flex-1"
                  onClick={() => updateStatus.mutate({ id: incident.id, status: "reviewed" })}
                  disabled={updateStatus.isPending}>
                  <Clock className="w-4 h-4 mr-1" />Mark Reviewed
                </Button>
              )}
              <Button size="sm" className="flex-1 bg-[#1a9c5b] hover:bg-[#158a4e]"
                onClick={() => updateStatus.mutate({ id: incident.id, status: "closed" })}
                disabled={updateStatus.isPending}>
                <CheckCircle2 className="w-4 h-4 mr-1" />Close Incident
              </Button>
            </div>
          )}
        </div>}

        {tab === "followup" && (
          <div className="mt-4">
            <IncidentFollowUpPanel incident={incident} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}