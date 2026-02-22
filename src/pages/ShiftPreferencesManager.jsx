import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AlertCircle, Save, Edit2 } from "lucide-react";

export default function ShiftPreferencesManager() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me().catch(() => null) });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.list() });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });
  const { data: preferences = [] } = useQuery({ queryKey: ["preferences"], queryFn: () => base44.entities.ShiftPreference.list() });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingId) {
        return base44.entities.ShiftPreference.update(editingId, data);
      } else {
        return base44.entities.ShiftPreference.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
      setEditingId(null);
      setFormData({});
    },
  });

  const handleEdit = (pref) => {
    setEditingId(pref.id);
    setFormData(pref);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const myPref = preferences.find(p => p.employee_id === user?.id);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Shift Preferences</h1>

      {myPref && !editingId ? (
        <Card>
          <CardHeader className="flex flex-row justify-between items-start">
            <CardTitle>Your Preferences</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleEdit(myPref)}>
              <Edit2 className="w-4 h-4 mr-2" />Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Preferred Days</label>
              <div className="flex gap-2 mt-2">
                {dayNames.map((day, i) => (
                  <span key={i} className={`px-3 py-1 rounded text-sm ${myPref.preferred_days?.includes(i) ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                    {day}
                  </span>
                ))}
              </div>
            </div>
            {myPref.preferred_locations?.length > 0 && (
              <div>
                <label className="text-sm font-semibold">Preferred Locations</label>
                <p className="text-gray-600 mt-1">{myPref.preferred_locations.join(", ")}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-semibold">Max Consecutive Shifts</label>
              <p>{myPref.max_consecutive_shifts}</p>
            </div>
            {myPref.avoid_back_to_back && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <AlertCircle className="w-4 h-4" />
                Avoid back-to-back shifts enabled
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {editingId && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Preferred Days</label>
              <div className="flex gap-3">
                {dayNames.map((day, i) => (
                  <label key={i} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.preferred_days?.includes(i) || false}
                      onCheckedChange={(checked) => {
                        const days = formData.preferred_days || [];
                        setFormData({
                          ...formData,
                          preferred_days: checked ? [...days, i] : days.filter(d => d !== i)
                        });
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Max Consecutive Shifts</label>
              <Input
                type="number"
                min="1"
                max="14"
                value={formData.max_consecutive_shifts || 5}
                onChange={(e) => setFormData({ ...formData, max_consecutive_shifts: parseInt(e.target.value) })}
              />
            </div>

            <label className="flex items-center gap-2">
              <Checkbox
                checked={formData.avoid_back_to_back || false}
                onCheckedChange={(checked) => setFormData({ ...formData, avoid_back_to_back: checked })}
              />
              <span className="text-sm">Avoid back-to-back shifts</span>
            </label>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />Save Preferences
              </Button>
              <Button variant="outline" onClick={() => { setEditingId(null); setFormData({}); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}