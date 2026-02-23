import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, CreditCard, TrendingUp, AlertCircle, Loader2, Plus,
  Upload, Building2, Tag, DollarSign, Calendar, Pencil, Trash2
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BillDialog from "@/components/billing/BillDialog";
import VendorDialog from "@/components/billing/VendorDialog";
import CategoryDialog from "@/components/billing/CategoryDialog";
import BillImporter from "@/components/billing/BillImporter";

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-500"
};

export default function BillingDashboard() {
  const [user, setUser] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [billSearch, setBillSearch] = useState("");
  const [billStatusFilter, setBillStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showBillDialog, setShowBillDialog] = useState(false);
  const [editBill, setEditBill] = useState(null);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: billingData, isLoading: stripeLoading } = useQuery({
    queryKey: ["billing-transactions"],
    queryFn: async () => {
      const res = await base44.functions.invoke("getStripeTransactions", { limit: 50 });
      return res.data;
    },
    enabled: !!user?.email,
  });

  const { data: bills = [], isLoading: billsLoading } = useQuery({
    queryKey: ["bills"],
    queryFn: () => base44.entities.Bill.list("-due_date", 200),
    enabled: !!user?.email,
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => base44.entities.Vendor.list("name", 200),
    enabled: !!user?.email,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["bill-categories"],
    queryFn: () => base44.entities.BillCategory.list("name", 100),
    enabled: !!user?.email,
  });

  if (user && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white p-6">
        <Card className="p-12 text-center max-w-lg mx-auto mt-20">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access the billing dashboard.</p>
        </Card>
      </div>
    );
  }

  const transactions = billingData?.transactions || [];
  const customers = billingData?.customers || [];
  const subscriptions = billingData?.subscriptions || [];

  const filteredTransactions = transactions.filter(t => {
    const emailMatch = !searchEmail || t.customer_email?.toLowerCase().includes(searchEmail.toLowerCase());
    const statusMatch = statusFilter === 'all' || t.status === statusFilter;
    return emailMatch && statusMatch;
  });

  const successfulTransactions = transactions.filter(t => t.paid);
  const totalRevenue = successfulTransactions.reduce((sum, t) => sum + t.amount, 0);
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

  // Bills stats
  const totalBillsAmount = bills.reduce((sum, b) => sum + (b.amount || 0), 0);
  const overdueBills = bills.filter(b => b.status === "overdue" || (b.due_date && new Date(b.due_date) < new Date() && b.status !== "paid" && b.status !== "cancelled"));
  const pendingBills = bills.filter(b => b.status === "pending" || b.status === "approved");

  const filteredBills = bills.filter(b => {
    const searchMatch = !billSearch || b.vendor_name?.toLowerCase().includes(billSearch.toLowerCase()) || b.description?.toLowerCase().includes(billSearch.toLowerCase());
    const statusMatch = billStatusFilter === "all" || b.status === billStatusFilter;
    const catMatch = categoryFilter === "all" || b.category === categoryFilter;
    return searchMatch && statusMatch && catMatch;
  });

  const handleDeleteBill = async (id) => {
    if (!confirm("Delete this bill?")) return;
    await base44.entities.Bill.delete(id);
    qc.invalidateQueries({ queryKey: ["bills"] });
    toast.success("Bill deleted.");
  };

  const handleDeleteVendor = async (id) => {
    if (!confirm("Delete this vendor?")) return;
    await base44.entities.Vendor.delete(id);
    qc.invalidateQueries({ queryKey: ["vendors"] });
    toast.success("Vendor deleted.");
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    await base44.entities.BillCategory.delete(id);
    qc.invalidateQueries({ queryKey: ["bill-categories"] });
    toast.success("Category deleted.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Manage bills, vendors, categories, and Stripe payments</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
              <Upload className="w-4 h-4 mr-1" /> Import Bills
            </Button>
            <Button size="sm" className="bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={() => { setEditBill(null); setShowBillDialog(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Bill
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-xs text-gray-500 mb-1">Total Bills</p>
            <p className="text-2xl font-bold">${totalBillsAmount.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{bills.length} bills</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500 mb-1">Pending / Approved</p>
            <p className="text-2xl font-bold text-yellow-700">{pendingBills.length}</p>
            <p className="text-xs text-gray-400 mt-1">${pendingBills.reduce((s,b)=>s+(b.amount||0),0).toFixed(2)} due</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500 mb-1">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{overdueBills.length}</p>
            <p className="text-xs text-gray-400 mt-1">Needs attention</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500 mb-1">Stripe Revenue</p>
            <p className="text-2xl font-bold text-green-700">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{activeSubscriptions} active subs</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bills">
          <TabsList className="mb-4">
            <TabsTrigger value="bills"><DollarSign className="w-4 h-4 mr-1.5" />Bills</TabsTrigger>
            <TabsTrigger value="vendors"><Building2 className="w-4 h-4 mr-1.5" />Vendors</TabsTrigger>
            <TabsTrigger value="categories"><Tag className="w-4 h-4 mr-1.5" />Categories</TabsTrigger>
            <TabsTrigger value="stripe"><CreditCard className="w-4 h-4 mr-1.5" />Stripe</TabsTrigger>
          </TabsList>

          {/* BILLS TAB */}
          <TabsContent value="bills">
            <Card className="p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search vendor or description..." value={billSearch} onChange={e => setBillSearch(e.target.value)} className="pl-9" />
                </div>
                <select value={billStatusFilter} onChange={e => setBillStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white">
                  <option value="all">All Statuses</option>
                  {["draft","pending","approved","paid","overdue","cancelled"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white">
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </Card>

            {billsLoading ? (
              <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /></div>
            ) : filteredBills.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <DollarSign className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>No bills found. <button className="text-[#1a9c5b] underline" onClick={() => { setEditBill(null); setShowBillDialog(true); }}>Add your first bill</button></p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {["Vendor","Bill #","Description","Category","Amount","Due Date","Status",""].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBills.map(bill => (
                      <tr key={bill.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{bill.vendor_name}</td>
                        <td className="px-4 py-3 text-gray-500">{bill.bill_number || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{bill.description || "—"}</td>
                        <td className="px-4 py-3">
                          {bill.category ? (
                            <Badge variant="outline" className="text-xs">
                              {bill.category}
                            </Badge>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold">${(bill.amount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {bill.due_date ? format(new Date(bill.due_date), "MMM d, yyyy") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={STATUS_COLORS[bill.status] || "bg-gray-100 text-gray-600"}>
                            {bill.status?.charAt(0).toUpperCase() + bill.status?.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditBill(bill); setShowBillDialog(true); }}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDeleteBill(bill.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* VENDORS TAB */}
          <TabsContent value="vendors">
            <div className="flex justify-end mb-4">
              <Button size="sm" className="bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={() => { setEditVendor(null); setShowVendorDialog(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Vendor
              </Button>
            </div>
            {vendors.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>No vendors yet. <button className="text-[#1a9c5b] underline" onClick={() => { setEditVendor(null); setShowVendorDialog(true); }}>Add your first vendor</button></p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {vendors.map(v => (
                  <Card key={v.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{v.name}</p>
                        {v.category && <Badge variant="outline" className="text-xs mt-1">{v.category}</Badge>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditVendor(v); setShowVendorDialog(true); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDeleteVendor(v.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      {v.contact_name && <p>{v.contact_name}</p>}
                      {v.email && <p>{v.email}</p>}
                      {v.phone && <p>{v.phone}</p>}
                      {v.payment_terms && <p className="capitalize">{v.payment_terms.replace(/_/g," ")}</p>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* CATEGORIES TAB */}
          <TabsContent value="categories">
            <div className="flex justify-end mb-4">
              <Button size="sm" className="bg-[#1a9c5b] hover:bg-[#158a4e]" onClick={() => { setEditCategory(null); setShowCategoryDialog(true); }}>
                <Plus className="w-4 h-4 mr-1" /> New Category
              </Button>
            </div>
            {categories.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Tag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>No categories yet. <button className="text-[#1a9c5b] underline" onClick={() => { setEditCategory(null); setShowCategoryDialog(true); }}>Create your first category</button></p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {categories.map(c => {
                  const catBills = bills.filter(b => b.category === c.name);
                  const catTotal = catBills.reduce((s,b)=>s+(b.amount||0),0);
                  return (
                    <Card key={c.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: c.color || "#64748b" }} />
                          <p className="font-semibold text-gray-900">{c.name}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditCategory(c); setShowCategoryDialog(true); }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDeleteCategory(c.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      {c.description && <p className="text-sm text-gray-500 mt-1">{c.description}</p>}
                      <div className="mt-3 flex justify-between text-sm">
                        <span className="text-gray-500">{catBills.length} bills · ${catTotal.toFixed(2)}</span>
                        {c.budget_monthly && (
                          <span className={catTotal > c.budget_monthly ? "text-red-600 font-medium" : "text-green-700"}>
                            Budget: ${c.budget_monthly}/mo
                          </span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* STRIPE TAB */}
          <TabsContent value="stripe">
            {user?.email !== "greggferrara@gmail.com" ? (
              <div className="p-12 text-center text-gray-500">
                <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>You don't have access to Stripe data.</p>
              </div>
            ) : (<>
            <Card className="p-4 mb-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search by email..." value={searchEmail} onChange={e => setSearchEmail(e.target.value)} className="pl-9" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white">
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="open">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </Card>

            {stripeLoading ? (
              <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /></div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No Stripe transactions found</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {["Customer Email","Amount","Status","Date"].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{t.customer_email || "Unknown"}</td>
                        <td className="px-6 py-4 font-semibold">${t.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <Badge className={t.status === "paid" ? "bg-green-100 text-green-800" : t.status === "open" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                            {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{format(new Date(t.created), "MMM dd, yyyy")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {subscriptions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Subscriptions</h3>
                <div className="divide-y divide-gray-200 border rounded-lg bg-white overflow-hidden">
                  {subscriptions.slice(0, 10).map(sub => (
                    <div key={sub.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">{sub.customer}</p>
                        <p className="text-sm text-gray-500">
                          {sub.items?.data[0]?.plan?.product} · {sub.items?.data[0]?.plan?.interval === "month" ? "Monthly" : "Yearly"}
                        </p>
                      </div>
                      <Badge className={sub.status === "active" ? "bg-green-100 text-green-800" : sub.status === "past_due" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}>
                        {sub.status?.replace(/_/g," ").toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <BillDialog open={showBillDialog} onClose={() => { setShowBillDialog(false); setEditBill(null); }} bill={editBill} vendors={vendors} categories={categories} />
      <VendorDialog open={showVendorDialog} onClose={() => { setShowVendorDialog(false); setEditVendor(null); }} vendor={editVendor} />
      <CategoryDialog open={showCategoryDialog} onClose={() => { setShowCategoryDialog(false); setEditCategory(null); }} category={editCategory} />

      {/* Import Modal */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Bills from CSV</DialogTitle>
          </DialogHeader>
          <BillImporter onComplete={() => setShowImport(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}