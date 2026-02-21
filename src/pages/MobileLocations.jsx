import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Users, AlertCircle, Edit2, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function MobileLocations() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({ name: "", type: "pool", min_guards_required: 1 });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list(),
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => base44.entities.Shift.list("-created_date", 500),
  });

  const createLocation = useMutation({
    mutationFn: (data) => base44.entities.Location.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogOpen(false);
      setFormData({ name: "", type: "pool", min_guards_required: 1 });
      toast.success("Location created successfully.");
    },
    onError: () => toast.error("Failed to create location."),
  });

  const updateLocation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Location.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogOpen(false);
      setEditingLocation(null);
      toast.success("Location updated successfully.");
    },
    onError: () => toast.error("Failed to update location."),
  });

  const deleteLocation = useMutation({
    mutationFn: (id) => base44.entities.Location.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Location deleted.");
    },
    onError: () => toast.error("Failed to delete location."),
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Location name is required.");
      return;
    }
    if (editingLocation) {
      updateLocation.mutate({ id: editingLocation.id, data: formData });
    } else {
      createLocation.mutate(formData);
    }
  };

  const openDialog = (location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({ name: location.name, type: location.type, min_guards_required: location.min_guards_required });
    } else {
      setEditingLocation(null);
      setFormData({ name: "", type: "pool", min_guards_required: 1 });
    }
    setDialogOpen(true);
  };

  const activeLocations = locations.filter(l => l.status === "active" || !l.status);
  const getShiftCount = (locId) => shifts.filter(s => s.location_id === locId).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("Dashboard")} className="text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-gray-900">Locations</h1>
            <p className="text-xs text-gray-500">{activeLocations.length} active</p>
          </div>
        </div>
        <Button
          onClick={() => openDialog(null)}
          className="bg-[#1a9c5b] hover:bg-[#158a4e] h-9 w-9 p-0 rounded-full"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Locations List */}
      <div className="p-4 space-y-3">
        {activeLocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="w-8 h-8 text-gray-300 mb-2" />
            <p className="font-semibold text-gray-400 text-sm">No locations yet</p>
            <p className="text-xs text-gray-300 mt-1">Add your first facility</p>
          </div>
        ) : (
          activeLocations.map((loc) => (
            <div key={loc.id} className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{loc.name}</p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{loc.type}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openDialog(loc)}
                    className="p-1.5 rounded-lg hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => deleteLocation.mutate(loc.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Users className="w-3 h-3" />
                  Min {loc.min_guards_required} guard{loc.min_guards_required !== 1 ? "s" : ""}
                </div>
                <div className="text-xs text-gray-600">
                  {getShiftCount(loc.id)} shift{getShiftCount(loc.id) !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">
              {editingLocation ? "Edit Location" : "Add Location"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Pool"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30"
                >
                  <option value="pool">Pool</option>
                  <option value="beach">Beach</option>
                  <option value="waterpark">Waterpark</option>
                  <option value="lake">Lake</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Min Guards Required</label>
                <input
                  type="number"
                  value={formData.min_guards_required}
                  onChange={(e) => setFormData({ ...formData, min_guards_required: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={createLocation.isPending || updateLocation.isPending}
                className="flex-1 bg-[#1a9c5b] hover:bg-[#158a4e]"
              >
                {editingLocation ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}