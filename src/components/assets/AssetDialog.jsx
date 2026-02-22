import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["safety_equipment","pool_equipment","chemical_equipment","technology","vehicle","furniture","other"];
const STATUSES = ["operational","needs_maintenance","out_of_service","retired","lost"];
const CONDITIONS = ["excellent","good","fair","poor"];

const defaultForm = {
  name: "", asset_tag: "", serial_number: "", category: "safety_equipment",
  status: "operational", condition: "good", location_id: "", assigned_to: "",
  purchase_date: "", purchase_price: "", warranty_expiry: "",
  last_maintenance_date: "", next_maintenance_due: "", maintenance_interval_days: "",
  manufacturer: "", model: "", notes: ""
};

export default function AssetDialog({ open, onOpenChange, asset }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(defaultForm);
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => base44.entities.Location.list() });

  useEffect(() => {
    if (asset) setForm({ ...defaultForm, ...asset });
    else setForm(defaultForm);
  }, [asset]);

  const save = useMutation({
    mutationFn: (data) => asset
      ? base44.entities.Asset.update(asset.id, data)
      : base44.entities.Asset.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["assets"] }); onOpenChange(false); },
  });

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });
  const sel = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const loc = locations.find(l => l.id === form.location_id);
    save.mutate({
      ...form,
      location_name: loc?.name || form.location_name,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : undefined,
      maintenance_interval_days: form.maintenance_interval_days ? Number(form.maintenance_interval_days) : undefined,
    });
  };

  const label = (text) => <label className="text-xs font-medium text-gray-600 block mb-1">{text}</label>;
  const selectClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{asset ? "Edit Asset" : "Add Asset"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">{label("Asset Name *")}<Input required {...f("name")} placeholder="e.g. AED Unit #1" /></div>
            <div>{label("Asset Tag / ID")}<Input {...f("asset_tag")} placeholder="e.g. AQ-001" /></div>
            <div>{label("Serial Number")}<Input {...f("serial_number")} /></div>
            <div>
              {label("Category *")}
              <select className={selectClass} value={form.category} onChange={sel("category")}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, x => x.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              {label("Status *")}
              <select className={selectClass} value={form.status} onChange={sel("status")}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, x => x.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              {label("Condition")}
              <select className={selectClass} value={form.condition} onChange={sel("condition")}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              {label("Location")}
              <select className={selectClass} value={form.location_id} onChange={sel("location_id")}>
                <option value="">-- None --</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">{label("Assigned To")}<Input {...f("assigned_to")} placeholder="Employee or department" /></div>
            <div>{label("Manufacturer")}<Input {...f("manufacturer")} /></div>
            <div>{label("Model")}<Input {...f("model")} /></div>
            <div>{label("Purchase Date")}<Input type="date" {...f("purchase_date")} /></div>
            <div>{label("Purchase Price ($)")}<Input type="number" step="0.01" {...f("purchase_price")} /></div>
            <div>{label("Warranty Expiry")}<Input type="date" {...f("warranty_expiry")} /></div>
            <div>{label("Maintenance Interval (days)")}<Input type="number" {...f("maintenance_interval_days")} placeholder="e.g. 90" /></div>
            <div>{label("Last Maintenance")}<Input type="date" {...f("last_maintenance_date")} /></div>
            <div>{label("Next Maintenance Due")}<Input type="date" {...f("next_maintenance_due")} /></div>
            <div className="col-span-2">{label("Notes")}<textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} {...f("notes")} /></div>
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e]" disabled={save.isPending}>
              {asset ? "Save Changes" : "Add Asset"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}