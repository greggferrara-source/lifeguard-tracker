import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, Wrench, AlertTriangle, Loader2 } from 'lucide-react';

export default function EquipmentTracking() {
  const [open, setOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'equipment',
    status: 'available',
    location_id: '',
    assigned_to_employee_id: '',
  });

  const queryClient = useQueryClient();

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list('-created_date', 500),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 500),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list('-created_date', 100),
  });

  const createAsset = useMutation({
    mutationFn: (data) => base44.entities.Asset.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setOpen(false);
      setFormData({ name: '', type: 'equipment', status: 'available', location_id: '', assigned_to_employee_id: '' });
    },
  });

  const updateAsset = useMutation({
    mutationFn: (data) => base44.entities.Asset.update(editingAsset.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setOpen(false);
      setEditingAsset(null);
      setFormData({ name: '', type: 'equipment', status: 'available', location_id: '', assigned_to_employee_id: '' });
    },
  });

  const deleteAsset = useMutation({
    mutationFn: (id) => base44.entities.Asset.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  const handleOpenDialog = (asset = null) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        name: asset.name,
        type: asset.type,
        status: asset.status,
        location_id: asset.location_id || '',
        assigned_to_employee_id: asset.assigned_to_employee_id || '',
      });
    } else {
      setEditingAsset(null);
      setFormData({ name: '', type: 'equipment', status: 'available', location_id: '', assigned_to_employee_id: '' });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    if (editingAsset) {
      updateAsset.mutate(formData);
    } else {
      createAsset.mutate(formData);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'in-use':
        return 'bg-blue-100 text-blue-700';
      case 'broken':
        return 'bg-red-100 text-red-700';
      case 'maintenance':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const groupedAssets = useMemo(() => {
    const grouped = {};
    assets.forEach(asset => {
      const status = asset.status || 'available';
      if (!grouped[status]) grouped[status] = [];
      grouped[status].push(asset);
    });
    return grouped;
  }, [assets]);

  if (assetsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Equipment & Assets</h1>
          <p className="text-slate-600">Track status, maintenance, and assignments</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['available', 'in-use', 'maintenance', 'broken'].map(status => {
          const count = groupedAssets[status]?.length || 0;
          return (
            <Card key={status}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-1 capitalize">{status}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assets by Status */}
      <div className="space-y-6">
        {Object.entries(groupedAssets).map(([status, statusAssets]) => (
          <div key={status}>
            <h2 className="text-lg font-semibold mb-3 capitalize flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[0]}`} />
              {status}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statusAssets.map(asset => {
                const emp = employees.find(e => e.id === asset.assigned_to_employee_id);
                const loc = locations.find(l => l.id === asset.location_id);

                return (
                  <Card key={asset.id}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{asset.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{asset.type}</p>
                        </div>
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </div>

                      {loc && (
                        <div className="text-sm">
                          <p className="text-slate-600">Location: <span className="font-medium">{loc.name}</span></p>
                        </div>
                      )}

                      {emp && (
                        <div className="text-sm">
                          <p className="text-slate-600">Assigned to: <span className="font-medium">{emp.name}</span></p>
                        </div>
                      )}

                      {asset.last_maintenance && (
                        <div className="text-xs text-slate-500 border-t border-slate-200 pt-2">
                          Last maintenance: {format(new Date(asset.last_maintenance), 'MMM d, yyyy')}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDialog(asset)}>
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteAsset.mutate(asset.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Asset Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Fire Extinguisher, AED"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="equipment">Equipment</option>
                <option value="tool">Tool</option>
                <option value="rescue">Rescue Gear</option>
                <option value="vehicle">Vehicle</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="broken">Broken</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <select
                value={formData.location_id}
                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="">Select location</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assigned to Employee</label>
              <select
                value={formData.assigned_to_employee_id}
                onChange={(e) => setFormData({ ...formData, assigned_to_employee_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="">Not assigned</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1" disabled={createAsset.isPending || updateAsset.isPending}>
                {createAsset.isPending || updateAsset.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}