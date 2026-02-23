import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, AlertTriangle, CheckCircle2, Wrench, TrendingDown, Clock, DollarSign, Upload, Filter, Download, Pencil } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";
import AssetDialog from "@/components/assets/AssetDialog";
import AssetImporter from "@/components/import/AssetImporter";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "safety_equipment", label: "Safety Equipment" },
  { value: "pool_equipment", label: "Pool Equipment" },
  { value: "chemical_equipment", label: "Chemical Equipment" },
  { value: "technology", label: "Technology" },
  { value: "vehicle", label: "Vehicle" },
  { value: "furniture", label: "Furniture" },
  { value: "other", label: "Other" },
];

export default function AssetManagement() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: () => base44.entities.Asset.list()
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: () => base44.entities.MaintenanceRequest.list("-submitted_date")
  });

  const { data: serviceHistory = [] } = useQuery({
    queryKey: ["service-history"],
    queryFn: () => base44.entities.ServiceHistory.list("-service_date")
  });

  const pendingRequests = requests.filter(r => r.status === "submitted" || r.status === "approved");
  const completedRequests = requests.filter(r => r.status === "completed");

  // Calculate metrics
  const maintenanceDue = assets.filter(a => {
    const d = a.next_maintenance_due ? differenceInDays(parseISO(a.next_maintenance_due), new Date()) : null;
    return d !== null && d <= 14 && d >= 0;
  }).length;

  const overdueMaintenance = assets.filter(a => {
    const d = a.next_maintenance_due ? differenceInDays(parseISO(a.next_maintenance_due), new Date()) : null;
    return d !== null && d < 0;
  }).length;

  const totalValue = assets.reduce((sum, a) => sum + (a.purchase_price || 0), 0);
  const totalServiceCost = serviceHistory.reduce((sum, s) => sum + (s.cost || 0), 0);

  const openAdd = () => { setEditingAsset(null); setShowAssetDialog(true); };
  const openEdit = (asset) => { setEditingAsset(asset); setShowAssetDialog(true); };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-4xl font-bold">Asset Management Hub</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowImporter(true)}>
            <Upload className="w-4 h-4 mr-2" />Import CSV
          </Button>
          <Button variant="outline" onClick={() => setShowMaintenanceDialog(true)}>
            <Wrench className="w-4 h-4 mr-2" />Maintenance Request
          </Button>
          <Button onClick={openAdd} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
            <Plus className="w-4 h-4 mr-2" />Add Asset
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-900">
              <AlertTriangle className="w-4 h-4" />
              Overdue Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{overdueMaintenance}</div>
            <p className="text-xs text-orange-700 mt-1">Immediate action needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Due Within 14 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{maintenanceDue}</div>
            <p className="text-xs text-gray-600 mt-1">Schedule soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{pendingRequests.length}</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting approval/completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-900">
              <DollarSign className="w-4 h-4" />
              Total Asset Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">${(totalValue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-gray-600 mt-1">{assets.length} assets</p>
          </CardContent>
        </Card>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              categoryFilter === cat.value
                ? "bg-[#1a9c5b] text-white border-[#1a9c5b]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#1a9c5b]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {[
          { id: "overview", label: "Overview" },
          { id: "requests", label: `Maintenance Requests (${pendingRequests.length})` },
          { id: "history", label: "Service History" },
          { id: "dashboard", label: "Equipment Performance" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? "border-[#1a9c5b] text-[#1a9c5b]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && <OverviewTab assets={assets} maintenanceDue={maintenanceDue} overdueMaintenance={overdueMaintenance} categoryFilter={categoryFilter} onEdit={openEdit} />}
      {tab === "requests" && <MaintenanceRequestsTab requests={requests} setShowDialog={setShowMaintenanceDialog} />}
      {tab === "history" && <ServiceHistoryTab serviceHistory={serviceHistory} />}
      {tab === "dashboard" && <PerformanceDashboard assets={assets} serviceHistory={serviceHistory} requests={requests} />}

      {/* Dialogs */}
      <AssetDialog open={showAssetDialog} onOpenChange={setShowAssetDialog} asset={editingAsset} />
      <MaintenanceRequestDialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog} assets={assets} />
      <ServiceLogDialog open={showServiceDialog} onOpenChange={setShowServiceDialog} assets={assets} />
      {showImporter && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Import Assets from CSV</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowImporter(false)}>✕</Button>
            </div>
            <AssetImporter onComplete={() => { setShowImporter(false); qc.invalidateQueries({ queryKey: ["assets"] }); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewTab({ assets, maintenanceDue, overdueMaintenance }) {
  const [search, setSearch] = React.useState("");

  const filtered = assets.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.asset_tag?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search assets..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {overdueMaintenance > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-900">⚠️ Overdue Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assets.filter(a => {
                const d = a.next_maintenance_due ? differenceInDays(parseISO(a.next_maintenance_due), new Date()) : null;
                return d !== null && d < 0;
              }).map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 bg-white rounded border border-red-100">
                  <div>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-sm text-gray-600">Last maintenance: {a.last_maintenance_date || "Never"}</p>
                  </div>
                  <Button variant="outline" size="sm">Schedule Now</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(asset => (
          <Card key={asset.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{asset.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={asset.status === "operational" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                  {asset.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Condition:</span>
                <span className="font-medium">{asset.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Maintenance:</span>
                <span className="font-medium">{asset.next_maintenance_due || "Not set"}</span>
              </div>
              {asset.purchase_price && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-medium">${asset.purchase_price.toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MaintenanceRequestsTab({ requests, setShowDialog }) {
  const pending = requests.filter(r => ["submitted", "approved"].includes(r.status));
  const completed = requests.filter(r => r.status === "completed");

  const priorityColor = (p) => {
    switch(p) {
      case "critical": return "bg-red-100 text-red-700";
      case "high": return "bg-orange-100 text-orange-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Pending Requests</h3>
          <div className="space-y-2">
            {pending.map(req => (
              <Card key={req.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{req.title}</p>
                      <p className="text-sm text-gray-600">{req.asset_name}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge className={priorityColor(req.priority)}>{req.priority}</Badge>
                        <Badge variant="outline">{req.status}</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Review</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Completed Requests</h3>
          <div className="space-y-2">
            {completed.slice(0, 5).map(req => (
              <Card key={req.id} className="bg-green-50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-900">{req.title}</p>
                      <p className="text-sm text-green-700">Completed on {req.completion_date}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceHistoryTab({ serviceHistory }) {
  const [search, setSearch] = React.useState("");

  const filtered = serviceHistory.filter(s =>
    s.asset_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by asset..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <div className="space-y-2">
        {filtered.slice(0, 20).map(service => (
          <Card key={service.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium">{service.asset_name}</p>
                  <p className="text-sm text-gray-600">{service.service_type} • {service.service_date}</p>
                  <p className="text-sm text-gray-700 mt-1">{service.description}</p>
                  {service.cost && (
                    <p className="text-sm font-semibold text-blue-600 mt-1">Cost: ${service.cost.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PerformanceDashboard({ assets, serviceHistory, requests }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.slice(0, 6).map(asset => {
          const assetServices = serviceHistory.filter(s => s.asset_id === asset.id);
          const assetRequests = requests.filter(r => r.asset_id === asset.id && r.status === "completed");
          const avgServiceCost = assetServices.length > 0 ? (assetServices.reduce((sum, s) => sum + (s.cost || 0), 0) / assetServices.length).toFixed(0) : 0;

          return (
            <Card key={asset.id}>
              <CardHeader>
                <CardTitle className="text-base">{asset.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-bold">{asset.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Condition</p>
                    <p className="font-bold">{asset.condition}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Services</p>
                    <p className="font-bold">{assetServices.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Cost/Service</p>
                    <p className="font-bold">${avgServiceCost}</p>
                  </div>
                </div>
                {asset.warranty_expiry && (
                  <div className="pt-2 border-t text-xs">
                    <p className="text-gray-600">Warranty expires: {asset.warranty_expiry}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MaintenanceRequestDialog({ open, onOpenChange, assets }) {
  const qc = useQueryClient();
  const [formData, setFormData] = React.useState({
    asset_id: "",
    title: "",
    description: "",
    priority: "medium",
    estimated_cost: ""
  });

  const create = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceRequest.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance-requests"] });
      onOpenChange(false);
      setFormData({ asset_id: "", title: "", description: "", priority: "medium", estimated_cost: "" });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.asset_id || !formData.title) {
      alert("Please fill required fields");
      return;
    }
    const asset = assets.find(a => a.id === formData.asset_id);
    create.mutate({
      ...formData,
      asset_name: asset?.name,
      submitted_date: new Date().toISOString(),
      status: "submitted"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Maintenance Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Asset *</label>
            <select
              required
              value={formData.asset_id}
              onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">Select asset...</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              required
              placeholder="e.g., Filter replacement needed"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description *</label>
            <textarea
              required
              placeholder="Describe the issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Est. Cost</label>
              <Input
                type="number"
                placeholder="$0.00"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={create.isPending}>
              {create.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ServiceLogDialog({ open, onOpenChange, assets }) {
  const qc = useQueryClient();
  const [formData, setFormData] = React.useState({
    asset_id: "",
    service_type: "maintenance",
    description: "",
    cost: "",
    duration_hours: ""
  });

  const create = useMutation({
    mutationFn: (data) => base44.entities.ServiceHistory.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-history"] });
      onOpenChange(false);
      setFormData({ asset_id: "", service_type: "maintenance", description: "", cost: "", duration_hours: "" });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const asset = assets.find(a => a.id === formData.asset_id);
    create.mutate({
      ...formData,
      asset_name: asset?.name,
      service_date: format(new Date(), "yyyy-MM-dd")
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Asset</label>
            <select
              value={formData.asset_id}
              onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">Select asset...</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Service Type</label>
            <select
              value={formData.service_type}
              onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="maintenance">Maintenance</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
              <option value="replacement">Replacement</option>
              <option value="upgrade">Upgrade</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              placeholder="What was done..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Duration (hours)</label>
              <Input
                type="number"
                value={formData.duration_hours}
                onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Cost</label>
              <Input
                type="number"
                placeholder="$0.00"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={create.isPending}>
              {create.isPending ? "Logging..." : "Log Service"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}