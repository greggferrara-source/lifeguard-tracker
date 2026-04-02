import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Eye, Edit2, Filter, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function IncidentManagement() {
  const [filters, setFilters] = useState({ type: 'all', severity: 'all', status: 'all', source: 'all' });
  const queryClient = useQueryClient();

  const { data: incidentReports = [], isLoading: loadingReports } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.IncidentReport.list('-created_at', 100)
  });

  const { data: incidentLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['incident-logs-mgmt'],
    queryFn: () => base44.entities.IncidentLog.list('-created_date', 100)
  });

  const isLoading = loadingReports || loadingLogs;

  // Unified incident list: normalize IncidentLog entries to match IncidentReport shape
  const incidents = [
    ...incidentReports.map(r => ({ ...r, _source: 'report' })),
    ...incidentLogs.map(l => ({
      id: l.id,
      _source: 'log',
      incident_type: l.type === 'rescue' ? 'rescue' : l.type === 'injury' ? 'injury' : 'injury',
      location_name: l.location_name,
      location_id: l.location_id,
      description: l.description,
      severity: l.severity === 'serious' ? 'severe' : (l.severity || 'minor'),
      status: l.status === 'open' ? 'submitted' : l.status === 'reviewed' ? 'under_review' : 'closed',
      created_at: l.created_date || l.date,
      reported_by_name: l.reporting_staff_name,
      _log_type: l.type,
    }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const stats = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    unreviewed: incidents.filter(i => i.status === 'submitted').length,
    thisMonth: incidents.filter(i => {
      const d = new Date(i.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length
  };

  const filtered = incidents.filter(incident => {
    if (filters.type !== 'all' && incident.incident_type !== filters.type) return false;
    if (filters.severity !== 'all' && incident.severity !== filters.severity) return false;
    if (filters.status !== 'all' && incident.status !== filters.status) return false;
    if (filters.source !== 'all' && incident._source !== filters.source) return false;
    return true;
  });

  const severityColor = {
    critical: 'destructive',
    severe: 'default',
    moderate: 'secondary',
    minor: 'outline'
  };

  const typeIcon = {
    drowning: '🌊',
    rescue: '🆘',
    injury: '🤕',
    chemical_spill: '⚠️'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Incident Management</h1>
          <p className="text-gray-600 mt-1">Track, report, and manage incidents with audit trail</p>
        </div>
        <Link to={createPageUrl('CreateIncidentReport')}>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Report Incident
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-sm text-gray-500 mt-1">Total Incidents</p>
            <p className="text-xs text-gray-400 mt-0.5">{incidentReports.length} reports · {incidentLogs.length} logs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-sm text-gray-500 mt-1">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-orange-600">{stats.unreviewed}</div>
            <p className="text-sm text-gray-500 mt-1">Needs Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600">{stats.thisMonth}</div>
            <p className="text-sm text-gray-500 mt-1">This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          <option value="drowning">Drowning</option>
          <option value="rescue">Rescue</option>
          <option value="injury">Injury</option>
          <option value="chemical_spill">Chemical Spill</option>
        </select>
        <select
          value={filters.severity}
          onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="severe">Severe</option>
          <option value="moderate">Moderate</option>
          <option value="minor">Minor</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted / Open</option>
          <option value="under_review">Under Review</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={filters.source}
          onChange={(e) => setFilters({ ...filters, source: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Sources</option>
          <option value="report">Full Reports</option>
          <option value="log">Mobile Logs</option>
        </select>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading incidents...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No incidents found</div>
        ) : (
          filtered.map(incident => (
            <Card key={incident.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{typeIcon[incident.incident_type] || '⚠️'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg capitalize">{(incident._log_type || incident.incident_type || '').replace('_', ' ')}</h3>
                        <Badge variant="outline" className={`text-xs ${incident._source === 'log' ? 'border-blue-300 text-blue-600' : 'border-gray-300 text-gray-500'}`}>
                          {incident._source === 'log' ? '📱 Mobile Log' : '📋 Full Report'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{incident.location_name}</p>
                    </div>
                  </div>
                    <p className="text-gray-700 mb-2">{incident.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={severityColor[incident.severity]}>
                        {incident.severity}
                      </Badge>
                      <Badge variant="outline">{incident.status}</Badge>
                      <span className="text-xs text-gray-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(incident.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {incident._source === 'report' && (
                      <>
                        <Link to={createPageUrl('IncidentDetail') + `?id=${incident.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {incident.status !== 'closed' && (
                          <Link to={createPageUrl('IncidentDetail') + `?id=${incident.id}&edit=true`}>
                            <Button variant="outline" size="sm">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </>
                    )}
                    {incident._source === 'log' && (
                      <Link to={createPageUrl('IncidentLogs')}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}