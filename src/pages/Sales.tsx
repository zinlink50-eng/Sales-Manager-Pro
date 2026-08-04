import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Sale, Product, Contact, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Eye, Trash2, ShoppingCart, DollarSign, TrendingUp, Package, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; variant: any }> = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "info" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

interface SaleItem { productId: number; productName: string; quantity: number; unitPrice: number; }

function SaleForm({ products, contacts, users, onSubmit, onClose }: {
  products: Product[]; contacts: Contact[]; users: User[];
  onSubmit: (data: any) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    contactId: "",
    assignedTo: "",
    status: "confirmed",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [items, setItems] = useState<SaleItem[]>([{ productId: 0, productName: "", quantity: 1, unitPrice: 0 }]);
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const addItem = () => setItems((prev) => [...prev, { productId: 0, productName: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: keyof SaleItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [key]: value };
      if (key === "productId") {
        const p = products.find((p) => p.id === parseInt(value));
        if (p) { updated[i].productName = p.name; updated[i].unitPrice = p.price; }
      }
      return updated;
    });
  };

  const total = items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const validItems = items.filter((i) => i.productId > 0 && i.quantity > 0);
      if (validItems.length === 0) return;
      onSubmit({
        ...form,
        contactId: form.contactId ? parseInt(form.contactId) : undefined,
        assignedTo: form.assignedTo ? parseInt(form.assignedTo) : undefined,
        items: validItems,
        total,
      });
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Customer / Contact</Label>
          <Select value={form.contactId} onValueChange={(v) => set("contactId", v)}>
            <SelectTrigger><SelectValue placeholder="Select contact" /></SelectTrigger>
            <SelectContent>
              {contacts.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.firstName} {c.lastName}{c.company ? ` · ${c.company}` : ""}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Sale Date</Label>
          <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Assigned Rep</Label>
          <Select value={form.assignedTo} onValueChange={(v) => set("assignedTo", v)}>
            <SelectTrigger><SelectValue placeholder="Select rep" /></SelectTrigger>
            <SelectContent>{users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Line Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-3.5 w-3.5 mr-1" />Add Item</Button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <Select value={item.productId ? String(item.productId) : ""} onValueChange={(v) => updateItem(i, "productId", parseInt(v))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>{products.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)} className="h-8 text-sm" placeholder="Qty" />
              </div>
              <div className="col-span-3">
                <Input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)} className="h-8 text-sm" placeholder="Price" />
              </div>
              <div className="col-span-1 text-xs text-right text-gray-500">{formatCurrency(item.quantity * item.unitPrice)}</div>
              <div className="col-span-1 flex justify-end">
                <button type="button" onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2 border-t">
          <div className="text-sm font-bold">Total: {formatCurrency(total)}</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional notes..." />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Record Sale</Button>
      </DialogFooter>
    </form>
  );
}

function SaleDetailModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Sale #{sale.id} — {formatDate(sale.date)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Customer:</span> <span className="font-medium">{sale.contactName || "—"}</span></div>
            <div><span className="text-gray-500">Status:</span> <Badge variant={statusConfig[sale.status]?.variant} className="ml-1">{statusConfig[sale.status]?.label}</Badge></div>
            <div><span className="text-gray-500">Rep:</span> <span className="font-medium">{sale.assignedToName || "—"}</span></div>
            <div><span className="text-gray-500">Date:</span> <span className="font-medium">{formatDate(sale.date)}</span></div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 text-xs text-gray-500">Product</th>
                  <th className="text-right px-3 py-2 text-xs text-gray-500">Qty</th>
                  <th className="text-right px-3 py-2 text-xs text-gray-500">Unit Price</th>
                  <th className="text-right px-3 py-2 text-xs text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sale.items?.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{item.productName}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right font-semibold text-sm">Total</td>
                  <td className="px-3 py-2 text-right font-bold text-primary">{formatCurrency(sale.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {sale.notes && <p className="text-sm text-gray-500">{sale.notes}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Sales() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewSale, setViewSale] = useState<Sale | undefined>();

  const { data: sales = [] } = useQuery({ queryKey: ["sales"], queryFn: () => api.get<Sale[]>("/api/sales") });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => api.get<Product[]>("/api/products") });
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => api.get<Contact[]>("/api/contacts") });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => api.get<User[]>("/api/users") });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["sales"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/sales", data),
    onSuccess: () => { invalidate(); setDialogOpen(false); toast({ title: "Sale recorded" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/sales/${id}`),
    onSuccess: () => { invalidate(); toast({ title: "Sale deleted" }); },
  });

  const filtered = sales.filter((s) => {
    const matchSearch = !search || s.contactName?.toLowerCase().includes(search.toLowerCase()) || String(s.id).includes(search);
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSales = sales.reduce((s, sale) => s + sale.total, 0);
  const confirmedSales = sales.filter((s) => s.status === "confirmed" || s.status === "delivered");
  const confirmedRevenue = confirmedSales.reduce((s, sale) => s + sale.total, 0);
  const avgOrderValue = sales.length > 0 ? totalSales / sales.length : 0;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Orders", value: String(sales.length), icon: ShoppingCart, color: "bg-blue-50 text-blue-600" },
          { label: "Confirmed Revenue", value: formatCurrency(confirmedRevenue), icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
          { label: "Avg Order Value", value: formatCurrency(avgOrderValue), icon: TrendingUp, color: "bg-indigo-50 text-indigo-600" },
          { label: "Total Items Sold", value: String(sales.reduce((s, sale) => s + (sale.items?.length ?? 0), 0)), icon: Package, color: "bg-amber-50 text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div>
              <div className="text-lg font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {[["all", "All"], ["pending", "Pending"], ["confirmed", "Confirmed"], ["delivered", "Delivered"], ["cancelled", "Cancelled"]] .map(([s, label]) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn("px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
              statusFilter === s ? "bg-primary text-white border-primary" : "bg-white hover:bg-gray-50 text-gray-600"
            )}>
            {label} ({s === "all" ? sales.length : sales.filter((sale) => sale.status === s).length})
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by customer or order #..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Record Sale
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Order #", "Customer", "Items", "Total", "Status", "Rep", "Date", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 group">
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">#{String(sale.id).padStart(4, "0")}</td>
                    <td className="px-4 py-3 text-sm font-medium">{sale.contactName || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{sale.items?.length ?? 0} item{(sale.items?.length ?? 0) !== 1 ? "s" : ""}</td>
                    <td className="px-4 py-3 text-sm font-bold text-primary">{formatCurrency(sale.total)}</td>
                    <td className="px-4 py-3"><Badge variant={statusConfig[sale.status]?.variant}>{statusConfig[sale.status]?.label}</Badge></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{sale.assignedToName || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(sale.date)}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewSale(sale)}><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(sale.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">No sales found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Record New Sale</DialogTitle></DialogHeader>
          <SaleForm
            products={products} contacts={contacts} users={users}
            onSubmit={(data) => createMutation.mutate(data)}
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {viewSale && <SaleDetailModal sale={viewSale} onClose={() => setViewSale(undefined)} />}
    </div>
  );
}
