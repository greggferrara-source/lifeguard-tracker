import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, MapPin, Users, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import LocationDialog from "@/components/locations/LocationDialog";

const typeIcons = {
  pool: "🏊",
  beach: "🏖️",
  waterpark: "🎢",
  lake: "🌊",
  other: "📍",
};

const statusStyles = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-500",
  seasonal: "bg-blue-100 text-blue-700",
};

export default function Locations() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list(),
  });

  const createLocation = useMutation({
    mutationFn: (data) => base44.entities.Location.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogOpen(false);
    },
  });

  const updateLocation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Location.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogOpen(false);
    },
  });

  const deleteLocation = useMutation({
    mutationFn: (id) => base44.entities.Location.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["locations"] }),
  });

  const handleSave = (formData) => {
    if (editingLocation) {
      updateLocation.mutate({ id: editingLocation.id, data: formData });
    } else {
      createLocation.mutate(formData);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{locations.length} location{locations.length !== 1 ? "s" : ""}</p>
        <Button
          onClick={() => { setEditingLocation(null); setDialogOpen(true); }}
          className="bg-cyan-600 hover:bg-cyan-700"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Location
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc, i) => (
          <motion.div
            key={loc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="p-5 border-0 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: loc.color || "#0ea5e9" }} />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeIcons[loc.type] || "📍"}</span>
                  <div>
                    <p className="font-semibold text-slate-900">{loc.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{loc.type}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditingLocation(loc); setDialogOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => { if (confirm(`Delete "${loc.name}"? This cannot be undone.`)) deleteLocation.mutate(loc.id); }}>
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className={`text-[10px] ${statusStyles[loc.status] || ""}`}>
                  {loc.status}
                </Badge>
                <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                  <Users className="w-2.5 h-2.5" /> Min {loc.min_guards_required} guard{loc.min_guards_required > 1 ? "s" : ""}
                </Badge>
              </div>
              {loc.address && (
                <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {loc.address}
                </p>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {locations.length === 0 && !isLoading && (
        <div className="text-center py-16 text-slate-400">
          <Waves className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium text-gray-700">No locations yet</p>
          <p className="text-sm mt-1 mb-4">Add the pools, beaches, or waterparks you manage</p>
          <Button size="sm" className="bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={() => { setEditingLocation(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add First Location
          </Button>
        </div>
      )}

      <LocationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        location={editingLocation}
        onSave={handleSave}
      />
    </div>
  );
}