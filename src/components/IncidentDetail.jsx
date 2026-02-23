import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Edit2, X } from 'lucide-react';

export default function IncidentDetail({ incidentId, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: incident } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: () => base44.entities.IncidentReport.filter({ id: incidentId }).then(r => r[0]),
    enabled: !!incidentId
  });

  const { data: auditTrail = [] } = useQuery({
    queryKey: ['incident-audit', incidentId],
    queryFn: () => base44.entities.IncidentAuditTrail.filter({ incident_id: incidentId }),
    enabled: !!incidentId
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: (newStatus) => base44.entities.IncidentReport.update(incidentId, { status: newStatus }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incident', incidentId] })
  });

  if (!incident) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold capitalize">{incident.incident_type.replace('_', ' ')}</h2>
          <p className="text-gray-600 mt-1">{incident.location_name}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Incident Details</span>
            <div className="flex gap-2">
              <Badge variant="outline">{incident.status}</Badge>
              <Badge variant="secondary">{incident.severity}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Date & Time</p>
              <p className="font-semibold">{new Date(incident.date_time).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Reported By</p>
              <p className="font-semibold">{incident.reported_by_name}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Description</p>
            <p className="text-gray-700">{incident.description}</p>
          </div>
          {incident.immediate_actions_taken && (
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Actions Taken</p>
              <p className="text-gray-700">{incident.immediate_actions_taken}</p>
            </div>
          )}
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={incident.first_aid_provided} readOnly />
              <span>First Aid Provided</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={incident.emergency_services_called} readOnly />
              <span>Emergency Services Called</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Media Attachments */}
      {incident.media_attachments && incident.media_attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {incident.media_attachments.map((att, i) => (
                <a key={i} href={att.file_url} target="_blank" rel="noopener noreferrer">
                  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Download className="w-4 h-4 mb-2 text-blue-600" />
                    <p className="text-sm font-semibold capitalize">{att.file_type}</p>
                    <p className="text-xs text-gray-500">{att.caption}</p>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditTrail.map(entry => (
              <div key={entry.id} className="flex gap-3 pb-3 border-b last:border-b-0">
                <div>
                  <p className="font-semibold text-sm capitalize">{entry.action}</p>
                  <p className="text-xs text-gray-600">{entry.performed_by_name}</p>
                  <p className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</p>
                  {entry.description && <p className="text-sm text-gray-700 mt-1">{entry.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Actions */}
      {incident.status !== 'closed' && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => updateStatus('under_review')}
          >
            Send for Review
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => updateStatus('closed')}
          >
            Close Incident
          </Button>
        </div>
      )}
    </div>
  );
}