import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Upload, X } from 'lucide-react';

export default function CreateIncidentReport() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    incident_type: 'injury',
    location_id: '',
    date_time: new Date().toISOString().slice(0, 16),
    description: '',
    severity: 'moderate',
    immediate_actions_taken: '',
    first_aid_provided: false,
    emergency_services_called: false
  });
  const [attachments, setAttachments] = useState([]);
  const [people, setPeople] = useState([]);

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list(),
  });

  const { mutate: createIncident, isPending } = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.IncidentReport.create({
        ...form,
        reported_by_email: user.email,
        reported_by_name: user.full_name,
        people_involved: people,
        media_attachments: attachments,
        status: 'submitted',
        created_at: new Date().toISOString(),
      });
    },
    onSuccess: (incident) => {
      navigate(createPageUrl('IncidentManagement'));
    }
  });

  const handleAddAttachment = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAttachments([...attachments, {
      file_url,
      file_type: file.type.startsWith('image') ? 'photo' : file.type.startsWith('video') ? 'video' : 'document',
      uploaded_at: new Date().toISOString()
    }]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Report Incident</h1>
        <p className="text-gray-600 mt-1">Document incident details with full audit trail</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Incident Type *</label>
              <select
                value={form.incident_type}
                onChange={(e) => setForm({ ...form, incident_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="drowning">Drowning</option>
                <option value="rescue">Rescue</option>
                <option value="injury">Injury</option>
                <option value="chemical_spill">Chemical Spill</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Severity *</label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Location *</label>
            <Select value={form.location_id} onValueChange={(v) => {
              const loc = locations.find(l => l.id === v);
              setForm({ ...form, location_id: v, location_name: loc?.name || '' });
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select location…" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Date & Time *</label>
            <input
              type="datetime-local"
              value={form.date_time}
              onChange={(e) => setForm({ ...form, date_time: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of what happened..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Immediate Actions Taken</label>
            <textarea
              value={form.immediate_actions_taken}
              onChange={(e) => setForm({ ...form, immediate_actions_taken: e.target.value })}
              placeholder="What was done immediately after incident..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.first_aid_provided}
                onChange={(e) => setForm({ ...form, first_aid_provided: e.target.checked })}
              />
              <span className="text-sm font-semibold">First aid was provided</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.emergency_services_called}
                onChange={(e) => setForm({ ...form, emergency_services_called: e.target.checked })}
              />
              <span className="text-sm font-semibold">Emergency services were called</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Media Attachments */}
      <Card>
        <CardHeader>
          <CardTitle>Media Attachments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">Drag photos/videos or click to upload</p>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => Array.from(e.target.files || []).forEach(handleAddAttachment)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="outline" className="mt-2">
                Choose Files
              </Button>
            </label>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((att, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{att.file_type}</span>
                  <button
                    onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => navigate(createPageUrl('IncidentManagement'))}>
          Cancel
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => createIncident()}
          disabled={isPending || !form.description || !form.location_id}
        >
          {isPending ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </div>
  );
}