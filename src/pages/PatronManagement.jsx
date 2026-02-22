import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, AlertCircle } from "lucide-react";

export default function PatronManagement() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState("");

  const { data: patrons = [] } = useQuery({
    queryKey: ["patrons"],
    queryFn: () => base44.entities.PatronProfile.list()
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => base44.entities.IncidentLog.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PatronProfile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patrons"] });
      setShowForm(false);
      setFormData({});
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const filtered = patrons.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const riskColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };

  const abilityEmoji = {
    non_swimmer: "🚫",
    beginner: "🏊",
    intermediate: "🏊‍♀️",
    advanced: "🏊‍♂️"
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Patron Management</h1>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Patron
        </Button>
      </div>

      <Input
        placeholder="Search patrons by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{patrons.length}</div>
            <p className="text-sm text-gray-600">Total Patrons</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">{patrons.filter(p => p.risk_level === "high").length}</div>
            <p className="text-sm text-gray-600">High Risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-600">{patrons.filter(p => p.swimming_ability === "non_swimmer").length}</div>
            <p className="text-sm text-gray-600">Non-Swimmers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{incidents.length}</div>
            <p className="text-sm text-gray-600">Total Incidents</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Patron</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Name *"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.age_group || ""}
              onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
            >
              <option value="">Select Age Group</option>
              <option value="child">Child</option>
              <option value="teen">Teen</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </select>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.swimming_ability || ""}
              onChange={(e) => setFormData({ ...formData, swimming_ability: e.target.value })}
            >
              <option value="">Select Swimming Ability</option>
              <option value="non_swimmer">Non-Swimmer</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">Create Patron</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setFormData({}); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filtered.map((patron) => {
          const patronIncidents = incidents.filter(i => i.patron_name === patron.name);
          return (
            <Card key={patron.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{patron.name}</h3>
                      <Badge className={riskColors[patron.risk_level || "low"]}>
                        {patron.risk_level?.replace("_", " ").toUpperCase()}
                      </Badge>
                      <span className="text-2xl">{abilityEmoji[patron.swimming_ability] || "?"}</span>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                      <div>Age: <span className="font-semibold">{patron.age_group}</span></div>
                      <div>Visits: <span className="font-semibold">{patron.visits_count}</span></div>
                      <div>Last Visit: <span className="font-semibold">{patron.last_visit || "Never"}</span></div>
                      <div>Frequency: <span className="font-semibold">{patron.visit_frequency}</span></div>
                    </div>
                    {patronIncidents.length > 0 && (
                      <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                        <AlertTriangle className="w-4 h-4" />
                        {patronIncidents.length} incident(s)
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}