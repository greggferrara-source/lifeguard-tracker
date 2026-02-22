import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pin, X, Settings, BarChart2, Users, Shield, AlertTriangle, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

const AVAILABLE_MODULES = [
  { page: "Schedule", name: "Schedule", icon: BarChart2, category: "Operations" },
  { page: "Employees", name: "Employees", icon: Users, category: "People" },
  { page: "ComplianceDashboard", name: "Compliance", icon: Shield, category: "Compliance" },
  { page: "IncidentLogs", name: "Incidents", icon: AlertTriangle, category: "Safety" },
  { page: "AssetManagement", name: "Assets", icon: Settings, category: "Operations" },
  { page: "PoolTestReporting", name: "Pool Tests", icon: BarChart2, category: "Operations" },
  { page: "AdvancedReporting", name: "Reports", icon: BarChart2, category: "Analytics" },
  { page: "DocumentManagement", name: "Documents", icon: FileText, category: "Documents" },
  { page: "WorkflowAutomation", name: "Workflows", icon: Settings, category: "Automation" }
];

export default function CustomDashboard() {
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: preferences } = useQuery({
    queryKey: ['user-preferences', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const prefs = await base44.entities.UserPreferences.filter({ user_email: user.email });
      return prefs.length > 0 ? prefs[0] : null;
    },
    enabled: !!user?.email
  });

  const updatePrefsMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences?.id) {
        return base44.entities.UserPreferences.update(preferences.id, data);
      } else {
        return base44.entities.UserPreferences.create({ ...data, user_email: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    }
  });

  const togglePin = (module) => {
    const pinnedModules = preferences?.pinned_modules || [];
    const isPinned = pinnedModules.some(m => m.page_name === module.page);

    if (isPinned) {
      updatePrefsMutation.mutate({
        pinned_modules: pinnedModules.filter(m => m.page_name !== module.page)
      });
    } else {
      updatePrefsMutation.mutate({
        pinned_modules: [...pinnedModules, {
          page_name: module.page,
          display_name: module.name,
          order: pinnedModules.length
        }]
      });
    }
  };

  const pinnedModules = (preferences?.pinned_modules || [])
    .map(pm => AVAILABLE_MODULES.find(m => m.page === pm.page_name))
    .filter(Boolean);

  const unpinnedModules = AVAILABLE_MODULES.filter(
    m => !pinnedModules.some(p => p.page === m.page)
  );

  const categories = new Map();
  AVAILABLE_MODULES.forEach(m => {
    if (!categories.has(m.category)) {
      categories.set(m.category, []);
    }
    categories.get(m.category).push(m);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 mt-2">Pin your most used modules for quick access</p>
          </div>
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            className={isEditMode ? "bg-green-600 hover:bg-green-700" : "bg-[#1a9c5b] hover:bg-[#158a4e]"}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isEditMode ? "Done Editing" : "Edit Dashboard"}
          </Button>
        </div>

        {/* Pinned Modules */}
        {pinnedModules.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pinned Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Link
                    key={module.page}
                    to={createPageUrl(module.page)}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      isEditMode
                        ? "border-[#1a9c5b] bg-[#f0faf5]"
                        : "border-gray-200 bg-white hover:border-[#1a9c5b] hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#1a9c5b]/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-[#1a9c5b]" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{module.name}</p>
                          <Badge variant="outline" className="mt-1 text-xs">{module.category}</Badge>
                        </div>
                      </div>
                      {isEditMode && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            togglePin(module);
                          }}
                          className="text-[#1a9c5b] hover:text-red-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Modules for Pinning */}
        {isEditMode && unpinnedModules.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Modules</h2>
            {Array.from(categories.entries()).map(([category, modules]) => {
              const available = modules.filter(m => !pinnedModules.some(p => p.page === m.page));
              if (available.length === 0) return null;
              return (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {available.map((module) => {
                      const Icon = module.icon;
                      return (
                        <button
                          key={module.page}
                          onClick={() => togglePin(module)}
                          className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#1a9c5b] hover:bg-[#f0faf5] transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{module.name}</p>
                              <p className="text-xs text-gray-500">{category}</p>
                            </div>
                            <Pin className="w-4 h-4 text-gray-300 ml-auto" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        {!isEditMode && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link to={createPageUrl("Schedule")} className="text-sm text-[#1a9c5b] hover:underline">View Schedule</Link>
                  <Link to={createPageUrl("Employees")} className="block text-sm text-[#1a9c5b] hover:underline">Manage Team</Link>
                  <Link to={createPageUrl("ComplianceDashboard")} className="block text-sm text-[#1a9c5b] hover:underline">Check Compliance</Link>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">Access your most used reports quickly from your pinned modules.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">Click "Edit Dashboard" to customize your pinned modules.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}