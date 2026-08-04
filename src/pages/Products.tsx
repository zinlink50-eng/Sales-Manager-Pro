import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  Software: "bg-blue-100 text-blue-700",
  Hardware: "bg-gray-100 text-gray-700",
  Service: "bg-purple-100 text-purple-700",
  Subscription: "bg-green-100 text-green-700",
  Consulting: "bg-amber-100 text-amber-700",
  Other: "bg-slate-100 text-slate-700",
};

function ProductForm({ product, onSubmit, onClose }: {
  product?: Product; onSubmit: (data: any) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    category: product?.category ?? "Software",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    cost: product?.cost?.toString() ?? "",
    stock: product?.stock?.toString() ?? "",
    unit: product?.unit ?? "license",
    active: product?.active ?? true,
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit({
        ...form,
        price: parseFloat(form.price) || 0,
        cost: form.cost ? parseFloat(form.cost) : undefined,
        stock: form.stock !== "" ? parseInt(form.stock) : undefined,
      });
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Product Name *</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Enterprise CRM License" required />
        </div>
        <div className="space-y-1.5">
          <Label>SKU / Code</Label>
          <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. CRM-ENT-001" />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(categoryColors).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Price ($) *</Label>
          <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Cost ($)</Label>
          <Input type="number" min="0" step="0.01" value={form.cost} onChange={(e) => set("cost", e.target.value)} placeholder="Optional" />
        </div>
        <div className="space-y-1.5">
          <Label>Stock Qty</Label>
          <Input type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="Leave blank if unlimited" />
        </div>
        <div className="space-y-1.5">
          <Label>Unit</Label>
          <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["license", "seat", "unit", "hour", "month", "year", "project"].map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">{product ? "Save Changes" : "Add Product"}</Button>
      </DialogFooter>
    </form>
  );
}

export default function Products() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>();

  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => api.get<Product[]>("/api/products") });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["products"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/products", data),
    onSuccess: () => { invalidate(); setDialogOpen(false); toast({ title: "Product added" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/api/products/${id}`, data),
    onSuccess: () => { invalidate(); setDialogOpen(false); setEditing(undefined); toast({ title: "Product updated" }); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/products/${id}`),
    onSuccess: () => { invalidate(); toast({ title: "Product deleted" }); },
  });

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalInventoryValue = products.reduce((s, p) => s + p.price * (p.stock ?? 0), 0);
  const lowStockCount = products.filter((p) => p.stock !== undefined && p.stock !== null && p.stock < 10).length;
  const avgMargin = products.filter((p) => p.cost).reduce((acc, p, _, arr) => {
    return acc + ((p.price - (p.cost ?? 0)) / p.price) * 100 / arr.length;
  }, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Products", value: String(products.length), icon: Package, color: "bg-blue-50 text-blue-600" },
          { label: "Inventory Value", value: formatCurrency(totalInventoryValue), icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
          { label: "Low Stock Items", value: String(lowStockCount), icon: AlertTriangle, color: lowStockCount > 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-400" },
          { label: "Avg Margin", value: `${Math.round(avgMargin)}%`, icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
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

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategoryFilter(c)}
            className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize",
              categoryFilter === c ? "bg-primary text-white border-primary" : "bg-white hover:bg-gray-50 text-gray-600"
            )}>
            {c === "all" ? `All (${products.length})` : `${c} (${products.filter((p) => p.category === c).length})`}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search products..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Product", "SKU", "Category", "Price", "Cost", "Margin", "Stock", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((product) => {
                  const margin = product.cost ? Math.round(((product.price - product.cost) / product.price) * 100) : null;
                  const isLowStock = product.stock !== undefined && product.stock !== null && product.stock < 10;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 group">
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm text-gray-900">{product.name}</div>
                        {product.description && <div className="text-xs text-gray-400 truncate max-w-48">{product.description}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{product.sku || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", categoryColors[product.category] || categoryColors.Other)}>
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-primary">{formatCurrency(product.price)}<span className="text-gray-400 font-normal text-xs">/{product.unit}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{product.cost ? formatCurrency(product.cost) : "—"}</td>
                      <td className="px-4 py-3 text-sm">
                        {margin !== null ? (
                          <span className={cn("font-medium", margin >= 50 ? "text-emerald-600" : margin >= 25 ? "text-amber-600" : "text-red-600")}>
                            {margin}%
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {product.stock !== undefined && product.stock !== null ? (
                          <span className={cn("flex items-center gap-1", isLowStock && "text-red-600 font-medium")}>
                            {isLowStock && <AlertTriangle className="h-3.5 w-3.5" />}
                            {product.stock}
                          </span>
                        ) : <span className="text-gray-400">∞</span>}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditing(product); setDialogOpen(true); }}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(product.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editing}
            onSubmit={(data) => editing ? updateMutation.mutate({ id: editing.id, data }) : createMutation.mutate(data)}
            onClose={() => { setDialogOpen(false); setEditing(undefined); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
