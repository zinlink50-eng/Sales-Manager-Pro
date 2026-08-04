import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Package, AlertTriangle, TrendingUp, DollarSign, RefreshCw, Image, Barcode } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ── Categories ───────────────────────────────────────────
const CATEGORIES = [
  "မုန့်", "အချိုရည်", "ကိတ်", "ပေါင်မုန့်", "သရေစာ",
  "အိမ်သုံးပစ္စည်း", "မီးဖိုချောင်သုံးပစ္စည်း",
  "စားသောက်ကုန်ခြောက်", "ဆပ်ပြာနှင့်သန့်စင်ဆေးများ",
  "ကိုယ်ရေးကိုယ်တာသုံးပစ္စည်းများ",
];

const CAT_COLORS: Record<string, string> = {
  "မုန့်": "bg-amber-100 text-amber-700",
  "အချိုရည်": "bg-blue-100 text-blue-700",
  "ကိတ်": "bg-pink-100 text-pink-700",
  "ပေါင်မုန့်": "bg-yellow-100 text-yellow-700",
  "သရေစာ": "bg-orange-100 text-orange-700",
  "အိမ်သုံးပစ္စည်း": "bg-teal-100 text-teal-700",
  "မီးဖိုချောင်သုံးပစ္စည်း": "bg-red-100 text-red-700",
  "စားသောက်ကုန်ခြောက်": "bg-lime-100 text-lime-700",
  "ဆပ်ပြာနှင့်သန့်စင်ဆေးများ": "bg-cyan-100 text-cyan-700",
  "ကိုယ်ရေးကိုယ်တာသုံးပစ္စည်းများ": "bg-purple-100 text-purple-700",
};
const catColor = (cat: string) => CAT_COLORS[cat] ?? "bg-slate-100 text-slate-700";

// ── Thumbnail ────────────────────────────────────────────
function ProductThumb({ imageUrl, name, size = 10 }: { imageUrl?: string; name: string; size?: number }) {
  const cls = `h-${size} w-${size} rounded-lg object-cover`;
  if (imageUrl) return <img src={imageUrl} alt={name} className={cls} />;
  return (
    <div className={`h-${size} w-${size} rounded-lg bg-gray-100 flex items-center justify-center`}>
      <Package className="h-4 w-4 text-gray-300" />
    </div>
  );
}

// ── Product Form ─────────────────────────────────────────
function ProductForm({ product, onSubmit, onClose }: {
  product?: Product; onSubmit: (data: any) => void; onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    barcode: product?.barcode ?? "",
    category: product?.category ?? CATEGORIES[0],
    description: product?.description ?? "",
    imageUrl: product?.imageUrl ?? "",
    price: product?.price?.toString() ?? "",
    cost: product?.cost?.toString() ?? "",
    stock: product?.stock?.toString() ?? "",
    minStock: product?.minStock?.toString() ?? "5",
    unit: product?.unit ?? "ခု",
    active: product?.active ?? true,
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("imageUrl", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const autoSku = () => {
    // Trigger server-side generation by clearing the field — server will fill it
    set("sku", "");
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit({
        ...form,
        price: parseFloat(form.price) || 0,
        cost: form.cost ? parseFloat(form.cost) : undefined,
        stock: form.stock !== "" ? parseInt(form.stock) : undefined,
        minStock: form.minStock !== "" ? parseInt(form.minStock) : undefined,
        active: form.active,
      });
    }} className="space-y-4">

      {/* Image upload */}
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0 cursor-pointer" onClick={() => fileRef.current?.click()}>
          {form.imageUrl
            ? <img src={form.imageUrl} alt="product" className="h-20 w-20 object-cover rounded-xl" />
            : <Image className="h-6 w-6 text-gray-300" />
          }
        </div>
        <div className="flex-1 space-y-1">
          <Label>ကုန်ပစ္စည်းဓာတ်ပုံ</Label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()}>
              ဓာတ်ပုံတင်မည်
            </Button>
            {form.imageUrl && (
              <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => set("imageUrl", "")}>ဖယ်ရှားမည်</Button>
            )}
          </div>
          <Input placeholder="သို့မဟုတ် ပုံ URL ထည့်ပါ" value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} className="text-xs h-7" />
          <p className="text-xs text-muted-foreground">PNG, JPG — အများဆုံး 1MB</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div className="col-span-2 space-y-1.5">
          <Label>ကုန်ပစ္စည်းအမည် *</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="ဥပမာ — ချောကလက်ကိတ်" required />
        </div>

        {/* SKU */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5"><Barcode className="h-3.5 w-3.5" />SKU / ကုဒ်</Label>
          <div className="flex gap-1.5">
            <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="အလိုအလျောက်ထုတ်မည်" className="flex-1" />
            <Button type="button" variant="outline" size="icon" title="SKU အလိုအလျောက်ထုတ်မည်" onClick={autoSku} className="shrink-0">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">ဗလာထားပါက အလိုအလျောက်ထုတ်ပေးမည်</p>
        </div>

        {/* Barcode */}
        <div className="space-y-1.5">
          <Label>Barcode</Label>
          <Input value={form.barcode} onChange={(e) => set("barcode", e.target.value)} placeholder="အလိုအလျောက်ထုတ်မည်" />
          <p className="text-xs text-muted-foreground">ဗလာထားပါက SKU မှ ထုတ်ပေးမည်</p>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label>အမျိုးအစား</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Unit */}
        <div className="space-y-1.5">
          <Label>ယူနစ်</Label>
          <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["ခု", "ဝင်", "ထုပ်", "ပုလင်း", "ကီလို", "ဂရမ်", "လီတာ", "မီလီ", "ဘောင်း", "ကတ်"].map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selling Price */}
        <div className="space-y-1.5">
          <Label>ရောင်းစျေး (MMK) *</Label>
          <Input
            type="number" min="0" step="1"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="0"
            required
          />
          {form.price && <p className="text-xs text-muted-foreground">{formatCurrency(parseFloat(form.price) || 0)}</p>}
        </div>

        {/* Cost Price */}
        <div className="space-y-1.5">
          <Label>ဝယ်ကုန်ကျစရိတ် (MMK)</Label>
          <Input
            type="number" min="0" step="1"
            value={form.cost}
            onChange={(e) => set("cost", e.target.value)}
            placeholder="0"
          />
          {form.cost && <p className="text-xs text-muted-foreground">{formatCurrency(parseFloat(form.cost) || 0)}</p>}
        </div>

        {/* Current Stock */}
        <div className="space-y-1.5">
          <Label>လက်ကျန်ပမာဏ (လက်ရှိ)</Label>
          <Input
            type="number" min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            placeholder="အကန့်အသတ်မရှိ"
          />
        </div>

        {/* Min Stock */}
        <div className="space-y-1.5">
          <Label>အနည်းဆုံးလက်ကျန် (သတိပေးမည်)</Label>
          <Input
            type="number" min="0"
            value={form.minStock}
            onChange={(e) => set("minStock", e.target.value)}
            placeholder="5"
          />
        </div>

        {/* Description */}
        <div className="col-span-2 space-y-1.5">
          <Label>ဖော်ပြချက်</Label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="ကုန်ပစ္စည်းအကြောင်း အကျဉ်းချုပ်..." />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>မလုပ်တော့</Button>
        <Button type="submit">{product ? "သိမ်းဆည်းမည်" : "ကုန်ပစ္စည်းထည့်မည်"}</Button>
      </DialogFooter>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function Products() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<Product[]>("/api/products"),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["products"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/products", data),
    onSuccess: () => { invalidate(); setDialogOpen(false); toast({ title: "ကုန်ပစ္စည်းထည့်ပြီး" }); },
    onError: (e: any) => toast({ title: "အမှား", description: e.message, variant: "destructive" }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/api/products/${id}`, data),
    onSuccess: () => { invalidate(); setDialogOpen(false); setEditing(undefined); toast({ title: "ကုန်ပစ္စည်းပြင်ဆင်ပြီး" }); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/products/${id}`),
    onSuccess: () => { invalidate(); toast({ title: "ကုန်ပစ္စည်းဖျက်ပြီး" }); },
  });

  const categories = ["all", ...CATEGORIES.filter((c) => products.some((p) => p.category === c))];
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || p.name.toLowerCase().includes(q)
      || p.sku?.toLowerCase().includes(q)
      || p.barcode?.includes(q);
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalValue = products.reduce((s, p) => s + p.price * (p.stock ?? 0), 0);
  const lowStock = products.filter((p) => p.stock !== undefined && p.stock !== null && p.stock < (p.minStock ?? 10));
  const avgMargin = (() => {
    const withCost = products.filter((p) => p.cost && p.price);
    if (!withCost.length) return 0;
    return withCost.reduce((a, p) => a + ((p.price - (p.cost ?? 0)) / p.price) * 100, 0) / withCost.length;
  })();

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "ကုန်ပစ္စည်းစုစုပေါင်း", value: String(products.length), icon: Package, color: "bg-blue-50 text-blue-600" },
          { label: "လက်ကျန်တန်ဖိုး",       value: formatCurrency(totalValue),         icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
          { label: "လက်ကျန်နည်းသော",       value: String(lowStock.length),            icon: AlertTriangle, color: lowStock.length > 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-400" },
          { label: "ပျမ်းမျှအမြတ်",         value: `${Math.round(avgMargin)}%`,        icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
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

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const count = c === "all" ? products.length : products.filter((p) => p.category === c).length;
          return (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                categoryFilter === c ? "bg-primary text-white border-primary" : "bg-white hover:bg-gray-50 text-gray-600"
              )}>
              {c === "all" ? `အားလုံး (${count})` : `${c} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="အမည်၊ SKU၊ Barcode ဖြင့်ရှာမည်..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" /> ကုန်ပစ္စည်းထည့်မည်
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["ကုန်ပစ္စည်း", "SKU / Barcode", "အမျိုးအစား", "ရောင်းစျေး", "ကုန်ကျ", "အမြတ်", "လက်ကျန်", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((product) => {
                  const margin = product.cost ? Math.round(((product.price - product.cost) / product.price) * 100) : null;
                  const isLow = product.stock !== undefined && product.stock !== null && product.stock < (product.minStock ?? 10);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 group">
                      {/* Name + image */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductThumb imageUrl={product.imageUrl} name={product.name} size={10} />
                          <div>
                            <div className="font-medium text-sm text-gray-900">{product.name}</div>
                            {product.description && <div className="text-xs text-gray-400 truncate max-w-36">{product.description}</div>}
                          </div>
                        </div>
                      </td>
                      {/* SKU / Barcode */}
                      <td className="px-4 py-3">
                        {product.sku && <div className="text-xs font-mono text-gray-600">{product.sku}</div>}
                        {product.barcode && <div className="text-xs text-gray-400">{product.barcode}</div>}
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", catColor(product.category))}>
                          {product.category}
                        </span>
                      </td>
                      {/* Selling price */}
                      <td className="px-4 py-3 text-sm font-semibold text-primary whitespace-nowrap">
                        {formatCurrency(product.price)}<span className="text-gray-400 font-normal text-xs">/{product.unit}</span>
                      </td>
                      {/* Cost */}
                      <td className="px-4 py-3 text-sm text-gray-500">{product.cost ? formatCurrency(product.cost) : "—"}</td>
                      {/* Margin */}
                      <td className="px-4 py-3 text-sm">
                        {margin !== null ? (
                          <span className={cn("font-medium", margin >= 50 ? "text-emerald-600" : margin >= 25 ? "text-amber-600" : "text-red-600")}>
                            {margin}%
                          </span>
                        ) : "—"}
                      </td>
                      {/* Stock */}
                      <td className="px-4 py-3 text-sm">
                        {product.stock !== undefined && product.stock !== null ? (
                          <div className={cn("flex items-center gap-1", isLow && "text-red-600 font-medium")}>
                            {isLow && <AlertTriangle className="h-3.5 w-3.5" />}
                            <span>{product.stock} {product.unit}</span>
                            {product.minStock !== undefined && (
                              <span className="text-xs text-gray-400 ml-1">(min {product.minStock})</span>
                            )}
                          </div>
                        ) : <span className="text-gray-400">∞</span>}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditing(product); setDialogOpen(true); }}>
                              <Edit className="h-4 w-4 mr-2" />ပြင်ဆင်
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(product.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />ဖျက်
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">ကုန်ပစ္စည်းမတွေ့ပါ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(undefined); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "ကုန်ပစ္စည်းပြင်ဆင်မည်" : "ကုန်ပစ္စည်းအသစ်ထည့်မည်"}</DialogTitle>
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
