import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Users, BarChart3 } from 'lucide-react';

export default function TrainingModuleManager() {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  const { data: modules = [] } = useQuery({
    queryKey: ['training-modules'],
    queryFn: () => base44.entities.TrainingModule.list('-created_at')
  });

  const { mutate: deleteModule } = useMutation({
    mutationFn: (id) => base44.entities.TrainingModule.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-modules'] })
  });

  const categoryColor = {
    incident_response: 'bg-red-100 text-red-800',
    water_quality: 'bg-blue-100 text-blue-800',
    lifeguarding: 'bg-green-100 text-green-800',
    first_aid: 'bg-purple-100 text-purple-800',
    compliance: 'bg-orange-100 text-orange-800',
    safety: 'bg-pink-100 text-pink-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Training Modules</h1>
          <p className="text-gray-600 mt-1">Create and manage training with quizzes and content</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Module
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{modules.length}</div>
            <p className="text-sm text-gray-500 mt-1">Total Modules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{modules.reduce((s, m) => s + (m.total_assigned || 0), 0)}</div>
            <p className="text-sm text-gray-500 mt-1">Total Assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{modules.filter(m => m.is_active).length}</div>
            <p className="text-sm text-gray-500 mt-1">Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(module => (
          <Card key={module.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <Badge className={categoryColor[module.category] + ' mt-2'}>
                    {module.category.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(module.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteModule(module.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{module.description}</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{module.total_assigned || 0} assigned</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>{module.completion_rate || 0}% completed</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}