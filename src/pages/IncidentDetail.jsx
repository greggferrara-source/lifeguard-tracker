import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import IncidentDetail from '@/components/IncidentDetail';

export default function IncidentDetailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const incidentId = params.get('id');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(createPageUrl('IncidentManagement'))}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Incidents
      </Button>
      <IncidentDetail 
        incidentId={incidentId} 
        onClose={() => navigate(createPageUrl('IncidentManagement'))}
      />
    </div>
  );
}