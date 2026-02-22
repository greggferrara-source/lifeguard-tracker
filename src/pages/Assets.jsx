import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AssetDialog from "@/components/assets/AssetDialog";
import {
  Plus, Search, Package, AlertTriangle, CheckCircle2, Wrench,
  XCircle, Filter, MoreVertical, MapPin, Calendar, DollarSign,
  TrendingDown, Edit, Trash2, Eye
} from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";

const statusConfig = {
  operational: { label: "Operational", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  needs_maintenance: { label: "Needs Maintenance", color: "bg-yellow-100 text-yellow-700", icon: Wrench },
  out_of_service: { label: "Out of Service", color: "bg-red-100 text-red-700", icon: XCircle },
  retired: { label: "Retired", color: "bg-gray-100 text-gray-500", icon: XCircle },
  lost: { label: "Lost", color: "bg-purple-100 text-purple-700", icon: AlertTriangle },
};

const conditionConfig = {
  excellent: "bg-green-100 text-green-700",
  good: "bg-blue-100 text-blue-700",
  fair: "bg-yellow-100 text-yellow-700",
  poor: "bg-red-100 text-red-700",
};

const categoryIcons = {
  safety_equipment: "🦺",
  pool_equipment: "🏊",
  chemical_equipment: "🧪",
  technology: "💻",
  vehicle: "🚗",
  furniture: "🪑",
  other: "📦",
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return differenceInDays(parseISO(dateStr), new Date());
}

export default function Assets() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [selected, setSelected] = useState(null);

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: () => base44.entities.Asset.list("-created_date", 500)
  });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });

  const deleteAsset = useMutation({
    mutationFn: (id) => base44.entities.Asset.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["assets"] }); setSelected(null); },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Asset.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] }),
  });

  // Stats
  const operational = assets.filter(a => a.status === "operational").length;
  const needsMaintenance = assets.filter(a => a.status === "needs_maintenance").length;
  const outOfService = assets.filter(a => a.status === "out_of_service").length;
  const maintenanceDueSoon = assets.filter(a => { const d = daysUntil(a.next_maintenance_due); return d !== null && d <= 14 && d >= 0; });
  const totalValue = assets.reduce((sum, a) => sum + (a.purchase_price || 0), 0);

  // Filters
  const filtered = assets.filter(a => {
    const matchSearch = !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.asset_tag?.toLowerCase().includes(search.toLowerCase()) || a.location_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchCat = filterCategory === "all" || a.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const openAdd = () => { setEditAsset(null); setDialogOpen(true); };
  const openEdit = (asset) => { setEditAsset(asset); setDialogOpen(true); setSelected(null); };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Tracking</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all facility assets</p>
        </div>
        <Button onClick={openAdd} className="bg-[#1a9c5b] hover:bg-[#158a4e] gap-2">
          <Plus className="w-4 h-4" /> Add Asset
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Assets", value: assets.length, color: "text-gray-900", icon: Package },
          { label: "Operational", value: operational, color: "text-green-600", icon: CheckCircle2 },
          { label: "Needs Maintenance", value: needsMaintenance, color: "text-yellow-600", icon: Wrench },
          { label: "Out of Service", value: outOfService, color: "text-red-600", icon: XCircle },
          { label: "Total Value", value: `$${totalValue.toLocaleString()}`, color: "text-blue-600", icon: DollarSign },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-gray-50 rounded-xl p-4">
              <Icon className={`w-4 h-4 mb-1 ${s.color}`} />
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Maintenance Due Alert */}
      {maintenanceDueSoon.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <Wrench className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">{maintenanceDueSoon.length} asset{maintenanceDueSoon.length > 1 ? "s" : ""} due for maintenance within 14 days</p>
            <p className="text-xs text-yellow-700 mt-0.5">{maintenanceDueSoon.map(a => a.name).join(", ")}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search by name, tag, location…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="all">All Statuses</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="all">All Categories</option>
          {["safety_equipment","pool_equipment","chemical_equipment","technology","vehicle","furniture","other"].map(c => (
            <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, x => x.toUpperCase())}</option>
          ))}
        </select>
      </div>

      {/* Asset Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400"><Package className="w-10 h-10 mx-auto mb-2 opacity-40 animate-pulse" /><p>Loading assets…</p></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="font-medium">{assets.length === 0 ? "No assets yet — add your first one" : "No assets match your filters"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(asset => {
            const sc = statusConfig[asset.status] || statusConfig.operational;
            const StatusIcon = sc.icon;
            const maintDays = daysUntil(asset.next_maintenance_due);
            const warrantyDays = daysUntil(asset.warranty_expiry);
            const maintAlert = maintDays !== null && maintDays <= 14;

            return (
              <Card key={asset.id} className={`border hover:shadow-md transition-all cursor-pointer ${maintAlert && asset.status !== "out_of_service" ? "border-yellow-300" : "border-gray-200"}`}
                onClick={() => setSelected(asset)}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{categoryIcons[asset.category] || "📦"}</span>
                      <div>
                        <p className="font-semibold text-gray-900 leading-tight">{asset.name}</p>
                        {asset.asset_tag && <p className="text-xs text-gray-400">{asset.asset_tag}</p>}
                      </div>
                    </div>
                    <Badge className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600">
                    {asset.location_name && (
                      <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-gray-400" />{asset.location_name}</div>
                    )}
                    {asset.assigned_to && (
                      <div className="flex items-center gap-1.5"><span className="text-gray-400">→</span>{asset.assigned_to}</div>
                    )}
                    {asset.condition && (
                      <Badge className={`text-[10px] ${conditionConfig[asset.condition]}`}>{asset.condition} condition</Badge>
                    )}
                  </div>

                  {maintAlert && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-50 px-2 py-1.5 rounded-lg">
                      <Wrench className="w-3 h-3" />
                      Maintenance due in {maintDays} day{maintDays !== 1 ? "s" : ""}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Asset Form Dialog */}
      <AssetDialog open={dialogOpen} onOpenChange={setDialogOpen} asset={editAsset} />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{categoryIcons[selected?.category] || "📦"}</span>
              {selected?.name}
            </DialogTitle>
          </DialogHeader>
          {selected && (() => {
            const sc = statusConfig[selected.status] || statusConfig.operational;
            const maintDays = daysUntil(selected.next_maintenance_due);
            const warrantyDays = daysUntil(selected.warranty_expiry);
            return (
              <div className="space-y-4 text-sm">
                <div className="flex gap-2 flex-wrap">
                  <Badge className={sc.color}>{sc.label}</Badge>
                  {selected.condition && <Badge className={conditionConfig[selected.condition]}>{selected.condition} condition</Badge>}
                  {selected.asset_tag && <Badge variant="outline">{selected.asset_tag}</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 text-xs">
                  {[
                    ["Category", selected.category?.replace(/_/g, " ")],
                    ["Location", selected.location_name],
                    ["Assigned To", selected.assigned_to],
                    ["Manufacturer", selected.manufacturer],
                    ["Model", selected.model],
                    ["Serial #", selected.serial_number],
                    ["Purchased", selected.purchase_date],
                    ["Purchase Price", selected.purchase_price ? `$${Number(selected.purchase_price).toLocaleString()}` : null],
                    ["Warranty Expires", selected.warranty_expiry],
                    ["Last Maintenance", selected.last_maintenance_date],
                    ["Next Maintenance", selected.next_maintenance_due],
                  ].filter(([_, v]) => v).map(([k, v]) => (
                    <div key={k}><p className="text-gray-400">{k}</p><p className="font-medium text-gray-900 capitalize">{v}</p></div>
                  ))}
                </div>

                {maintDays !== null && maintDays <= 30 && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg text-xs ${maintDays <= 0 ? "bg-red-50 text-red-700" : maintDays <= 7 ? "bg-orange-50 text-orange-700" : "bg-yellow-50 text-yellow-700"}`}>
                    <Wrench className="w-4 h-4" />
                    {maintDays <= 0 ? "Maintenance overdue!" : `Maintenance due in ${maintDays} days`}
                  </div>
                )}

                {warrantyDays !== null && warrantyDays <= 30 && warrantyDays >= 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg text-xs bg-blue-50 text-blue-700">
                    <Calendar className="w-4 h-4" />
                    Warranty expires in {warrantyDays} days
                  </div>
                )}

                {selected.notes && <div className="text-gray-600 border-t pt-3">{selected.notes}</div>}

                {/* Status change */}
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Change Status</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statusConfig).filter(([k]) => k !== selected.status).map(([k, v]) => (
                      <Button key={k} variant="outline" size="sm" className="text-xs"
                        onClick={() => { updateStatus.mutate({ id: selected.id, status: k }); setSelected(s => ({...s, status: k})); }}>
                        {v.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(selected)}>
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 gap-1"
                    onClick={() => { if (confirm("Delete this asset?")) deleteAsset.mutate(selected.id); }}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}