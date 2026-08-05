import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Sale, Product, Contact, User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Plus, Search, MoreHorizontal, Eye, Trash2, ShoppingCart,
  DollarSign, TrendingUp, Package, X, Minus, UserPlus,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ── Status config ─────────────────────────────────────────
const statusConfig: Record<string, { label: string; variant: any }> = {
  pending:   { label: "စောင့်ဆိုင်းနေ", variant: "warning" },
  confirmed: { label: "အတည်ပြုပြီ",    variant: "info" },
  delivered: { label: "ပို့ဆောင်ပြီ",   variant: "success" },
  cancelled: { label: "ပယ်ဖျက်ပြီ",    variant: "destructive" },
};

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

// ── Product thumbnail ─────────────────────────────────────
function ProductThumb({
  imageUrl, name, className = "",
}: { imageUrl?: string; name: string; className?: string }) {
  if (imageUrl && imageUrl.length > 0) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn("h-full w-full object-cover", className)}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return (
    <div className={cn("h-full w-full bg-gray-100 flex items-center justify-center", className)}>
      <Package className="h-1/2 w-1/2 text-gray-300" />
    </div>
  );
}

// ── Quick Add Customer mini-dialog ────────────────────────
function AddCustomerDialog({
  open, onClose, onCreated,
}: { open: boolean; onClose: () => void; onCreated: (c: Contact) => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", company: "" });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim()) return;
    setBusy(true);
    try {
      const created = await api.post<Contact>("/api/contacts", {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        phone:     form.phone.trim() || undefined,
        company:   form.company.trim() || undefined,
        email:     `${form.firstName.toLowerCase().replace(/\s+/g, "")}.${Date.now()}@customer.local`,
        status:    "active",
      });
      toast({ title: `ဖောက်သည် "${form.firstName}" ထည့်ပြီး` });
      onCreated(created);
      onClose();
      setForm({ firstName: "", lastName: "", phone: "", company: "" });
    } catch (err: any) {
      toast({ title: "မအောင်မြင်ပါ", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            ဖောက်သည်အသစ်ထည့်မည်
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>နာမည် *</Label>
              <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)}
                placeholder="ဥပမာ — မောင်မောင်" required autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>မိသားစုနာမည်</Label>
              <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)}
                placeholder="ရွေးချယ်နိုင်" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>ဖုန်းနံပါတ်</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)}
              placeholder="09-XXXXXXXXX" type="tel" />
          </div>
          <div className="space-y-1.5">
            <Label>ကုမ္ပဏီ / အဖွဲ့အစည်း</Label>
            <Input value={form.company} onChange={(e) => set("company", e.target.value)}
              placeholder="ရွေးချယ်နိုင်" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>မလုပ်တော့</Button>
            <Button type="submit" disabled={busy || !form.firstName.trim()}>
              {busy ? "ထည့်နေသည်..." : "ဖောက်သည်ထည့်မည်"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── POS Sale Form ─────────────────────────────────────────
function SaleForm({
  products, initialContacts, users, onSubmit, onClose,
}: {
  products: Product[];
  initialContacts: Contact[];
  users: User[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    contactId: "", assignedTo: "",
    status: "confirmed",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [cart, setCart]           = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [mobileTab, setMobileTab] = useState<"products" | "cart">("products");
  const [contacts, setContacts]   = useState<Contact[]>(initialContacts);
  const [addCustOpen, setAddCustOpen] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.productId === p.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = { ...u[idx], quantity: u[idx].quantity + 1 };
        return u;
      }
      return [...prev, { productId: p.id, productName: p.name, quantity: 1, unitPrice: p.price, imageUrl: p.imageUrl }];
    });
  };

  const updateQty = (idx: number, delta: number) => {
    setCart((prev) => {
      const u = [...prev];
      const newQty = u[idx].quantity + delta;
      if (newQty <= 0) return u.filter((_, i) => i !== idx);
      u[idx] = { ...u[idx], quantity: newQty };
      return u;
    });
  };

  const removeFromCart = (idx: number) => setCart((prev) => prev.filter((_, i) => i !== idx));

  const filteredProducts = products.filter(
    (p) => !productSearch
      || p.name.toLowerCase().includes(productSearch.toLowerCase())
      || p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const total = cart.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
  const totalQty = cart.reduce((s, item) => s + item.quantity, 0);

  // ── Cart panel (shared between mobile and desktop) ────
  const CartPanel = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gray-50 text-xs font-semibold text-gray-500 shrink-0">
        🛒 ပြောင်းလဲချက် ({cart.length} မျိုး)
      </div>
      <div className="flex-1 overflow-y-auto divide-y min-h-0">
        {cart.length === 0 && (
          <div className="py-10 text-center text-xs text-gray-400">ကုန်ပစ္စည်းရွေးပါ</div>
        )}
        {cart.map((item, i) => (
          <div key={i} className="flex items-center gap-2 p-2">
            <div className="h-10 w-10 rounded-lg overflow-hidden border shrink-0 bg-gray-50">
              <ProductThumb imageUrl={item.imageUrl} name={item.productName} className="rounded-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{item.productName}</div>
              <div className="text-xs text-primary font-semibold">{formatCurrency(item.unitPrice)}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={() => updateQty(i, -1)}
                className="h-6 w-6 rounded border flex items-center justify-center hover:bg-gray-100 active:scale-95">
                <Minus className="h-2.5 w-2.5" />
              </button>
              <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
              <button type="button" onClick={() => updateQty(i, 1)}
                className="h-6 w-6 rounded border flex items-center justify-center hover:bg-gray-100 active:scale-95">
                <Plus className="h-2.5 w-2.5" />
              </button>
            </div>
            <button type="button" onClick={() => removeFromCart(i)} className="text-gray-300 hover:text-red-500 ml-1">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="border-t p-3 bg-gray-50 shrink-0">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-600">စုစုပေါင်း</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );

  // ── Product grid (shared between mobile and desktop) ──
  const ProductGrid = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gray-50 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            className="h-8 pl-8 text-sm"
            placeholder="ကုန်ပစ္စည်းရှာမည်..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 content-start">
          {filteredProducts.map((p) => {
            const inCart = cart.find((c) => c.productId === p.id);
            const isLow  = p.stock !== undefined && p.stock !== null && p.stock < (p.minStock ?? 5);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => { addToCart(p); setMobileTab("cart"); }}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-xl border text-center transition-all",
                  "hover:shadow-md hover:border-primary/50 active:scale-95 overflow-hidden pb-2",
                  inCart ? "border-primary bg-primary/5 shadow-sm" : "border-gray-200 bg-white"
                )}
              >
                {/* Image area — taller, fills top */}
                <div className="w-full aspect-square overflow-hidden bg-gray-50 rounded-t-xl">
                  <ProductThumb imageUrl={p.imageUrl} name={p.name} className="rounded-t-xl" />
                </div>
                <div className="px-1 w-full">
                  <div className="text-[11px] font-semibold text-gray-800 leading-tight line-clamp-2">{p.name}</div>
                  <div className="text-xs font-bold text-primary mt-0.5">{formatCurrency(p.price)}</div>
                  {p.stock !== undefined && (
                    <div className={cn("text-[10px] mt-0.5", isLow ? "text-red-500" : "text-gray-400")}>
                      {isLow ? "⚠ " : ""}{p.stock} {p.unit}
                    </div>
                  )}
                </div>
                {inCart && (
                  <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold shadow">
                    {inCart.quantity}
                  </div>
                )}
              </button>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="col-span-3 py-8 text-center text-sm text-gray-400">ကုန်ပစ္စည်းမတွေ့ပါ</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <AddCustomerDialog
        open={addCustOpen}
        onClose={() => setAddCustOpen(false)}
        onCreated={(c) => {
          setContacts((prev) => [...prev, c]);
          set("contactId", String(c.id));
        }}
      />

      <form onSubmit={(e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        onSubmit({
          ...form,
          contactId:  form.contactId  ? parseInt(form.contactId)  : undefined,
          assignedTo: form.assignedTo ? parseInt(form.assignedTo) : undefined,
          items: cart.map(({ productId, productName, quantity, unitPrice }) => ({
            productId, productName, quantity, unitPrice,
          })),
          total,
        });
      }} className="flex flex-col gap-4">

        {/* ── Header fields ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Customer row — full width with add button */}
          <div className="col-span-2 space-y-1.5">
            <Label>ဖောက်သည်</Label>
            <div className="flex gap-2">
              <Select value={form.contactId} onValueChange={(v) => set("contactId", v)}>
                <SelectTrigger className="h-9 text-sm flex-1">
                  <SelectValue placeholder="ဖောက်သည်ရွေးပါ (မဖြစ်မနေမလို)" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.firstName} {c.lastName}{c.company ? ` · ${c.company}` : ""}{c.phone ? ` · ${c.phone}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 border-primary/40 text-primary hover:bg-primary/5"
                title="ဖောက်သည်အသစ်ထည့်မည်"
                onClick={() => setAddCustOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>ရောင်းသူ</Label>
            <Select value={form.assignedTo} onValueChange={(v) => set("assignedTo", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="ရောင်းသူရွေးပါ" /></SelectTrigger>
              <SelectContent>
                {users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>ရောင်းရက်</Label>
            <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="h-9 text-sm" required />
          </div>

          <div className="space-y-1.5">
            <Label>အခြေအနေ</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── POS Grid ── */}

        {/* MOBILE: tab switcher + panels */}
        <div className="sm:hidden">
          {/* Tab bar */}
          <div className="flex rounded-lg border overflow-hidden mb-2">
            <button
              type="button"
              onClick={() => setMobileTab("products")}
              className={cn(
                "flex-1 py-2 text-sm font-semibold transition-colors",
                mobileTab === "products"
                  ? "bg-primary text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              )}
            >
              ကုန်ပစ္စည်းများ
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("cart")}
              className={cn(
                "flex-1 py-2 text-sm font-semibold transition-colors relative",
                mobileTab === "cart"
                  ? "bg-primary text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              )}
            >
              🛒 ပြောင်းလဲချက်
              {totalQty > 0 && (
                <span className={cn(
                  "ml-1.5 inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold",
                  mobileTab === "cart" ? "bg-white text-primary" : "bg-primary text-white"
                )}>
                  {totalQty}
                </span>
              )}
            </button>
          </div>
          {/* Active panel */}
          <div className="border rounded-xl overflow-hidden" style={{ height: 380 }}>
            {mobileTab === "products" ? <ProductGrid /> : <CartPanel />}
          </div>
        </div>

        {/* DESKTOP: side-by-side */}
        <div className="hidden sm:grid sm:grid-cols-5 gap-4 border rounded-xl overflow-hidden" style={{ height: 360 }}>
          <div className="col-span-3 border-r overflow-hidden flex flex-col">
            <ProductGrid />
          </div>
          <div className="col-span-2 overflow-hidden flex flex-col">
            <CartPanel />
          </div>
        </div>

        {/* Notes + Submit */}
        <div className="space-y-1.5">
          <Label>မှတ်ချက်</Label>
          <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="ရွေးချယ်နိုင်သောမှတ်ချက်..." />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>မလုပ်တော့</Button>
          <Button type="submit" disabled={cart.length === 0} className="gap-1.5">
            <ShoppingCart className="h-4 w-4" />
            အရောင်းမှတ်တမ်းတင်မည်
            {cart.length > 0 && <span className="font-bold">({formatCurrency(total)})</span>}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

// ── Sale detail modal ─────────────────────────────────────
function SaleDetailModal({ sale, products, onClose }: {
  sale: Sale; products: Product[]; onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            အရောင်း #{String(sale.id).padStart(4, "0")} — {formatDate(sale.date)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">ဖောက်သည်:</span> <span className="font-medium">{sale.contactName || "—"}</span></div>
            <div><span className="text-gray-500">အခြေအနေ:</span> <Badge variant={statusConfig[sale.status]?.variant} className="ml-1">{statusConfig[sale.status]?.label}</Badge></div>
            <div><span className="text-gray-500">ရောင်းသူ:</span> <span className="font-medium">{sale.assignedToName || "—"}</span></div>
            <div><span className="text-gray-500">ရက်စွဲ:</span> <span className="font-medium">{formatDate(sale.date)}</span></div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 text-xs text-gray-500" colSpan={2}>ကုန်ပစ္စည်း</th>
                  <th className="text-right px-3 py-2 text-xs text-gray-500">အရေ</th>
                  <th className="text-right px-3 py-2 text-xs text-gray-500">ယူနစ်</th>
                  <th className="text-right px-3 py-2 text-xs text-gray-500">စုစုပေါင်း</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sale.items?.map((item: any, i: number) => {
                  const p = products.find((pr) => pr.id === item.productId);
                  return (
                    <tr key={i}>
                      <td className="px-3 py-2 w-12">
                        <div className="h-9 w-9 rounded-lg overflow-hidden border bg-gray-50">
                          <ProductThumb imageUrl={p?.imageUrl} name={item.productName} className="rounded-lg" />
                        </div>
                      </td>
                      <td className="px-3 py-2 font-medium">{item.productName}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-primary">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-3 py-2 text-right font-semibold text-sm">စုစုပေါင်း</td>
                  <td className="px-3 py-2 text-right font-bold text-primary text-base">{formatCurrency(sale.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {sale.notes && <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">{sale.notes}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ပိတ်မည်</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function Sales() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [viewSale, setViewSale]       = useState<Sale | undefined>();

  const { data: sales    = [] } = useQuery({ queryKey: ["sales"],    queryFn: () => api.get<Sale[]>("/api/sales") });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => api.get<Product[]>("/api/products") });
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => api.get<Contact[]>("/api/contacts") });
  const { data: users    = [] } = useQuery({ queryKey: ["users"],    queryFn: () => api.get<User[]>("/api/users") });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["sales"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/sales", data),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ["contacts"] });
      setDialogOpen(false);
      toast({ title: "အရောင်းမှတ်တမ်းတင်ပြီး" });
    },
    onError: (e: any) => toast({ title: "အမှား", description: e.message, variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/sales/${id}`),
    onSuccess: () => { invalidate(); toast({ title: "အရောင်းဖျက်ပြီး" }); },
  });

  const filtered = sales.filter((s) => {
    const matchSearch = !search || s.contactName?.toLowerCase().includes(search.toLowerCase()) || String(s.id).includes(search);
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSales       = sales.reduce((s, sale) => s + sale.total, 0);
  const confirmedRevenue = sales.filter((s) => s.status === "confirmed" || s.status === "delivered").reduce((s, sale) => s + sale.total, 0);
  const avgOrderValue    = sales.length > 0 ? totalSales / sales.length : 0;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "မှာယူမှုစုစုပေါင်း",           value: String(sales.length),            icon: ShoppingCart, color: "bg-blue-50 text-blue-600" },
          { label: "အတည်ပြုဝင်ငွေ",                 value: formatCurrency(confirmedRevenue), icon: DollarSign,   color: "bg-emerald-50 text-emerald-600" },
          { label: "ပျမ်းမျှမှာယူမှုတန်ဖိုး",       value: formatCurrency(avgOrderValue),    icon: TrendingUp,   color: "bg-indigo-50 text-indigo-600" },
          { label: "ရောင်းချသောပစ္စည်းစုစုပေါင်း",  value: String(sales.reduce((s, sale) => s + (sale.items?.length ?? 0), 0)), icon: Package, color: "bg-amber-50 text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border p-3 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold text-gray-900 truncate">{s.value}</div>
              <div className="text-xs text-gray-500 leading-tight">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Status filter — scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {[["all","အားလုံး"],["pending","စောင့်ဆိုင်းနေ"],["confirmed","အတည်ပြုပြီ"],["delivered","ပို့ဆောင်ပြီ"],["cancelled","ပယ်ဖျက်ပြီ"]].map(([s, label]) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-colors shrink-0",
              statusFilter === s ? "bg-primary text-white border-primary" : "bg-white hover:bg-gray-50 text-gray-600"
            )}
          >
            {label} ({s === "all" ? sales.length : sales.filter((sale) => sale.status === s).length})
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ဖောက်သည် သို့ မှာယူမှုနံပါတ်ဖြင့်ရှာမည်..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">အရောင်းမှတ်တမ်းတင်မည်</span>
          <span className="sm:hidden">အရောင်း</span>
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["မှာယူမှု #", "ဖောက်သည်", "ပစ္စည်းများ", "စုစုပေါင်း", "အခြေအနေ", "ရောင်းသူ", "ရက်စွဲ", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 group">
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">#{String(sale.id).padStart(4, "0")}</td>
                    <td className="px-4 py-3 text-sm font-medium">{sale.contactName || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {sale.items?.slice(0, 3).map((item: any, i: number) => {
                          const p = products.find((pr) => pr.id === item.productId);
                          return (
                            <div key={i} className="h-8 w-8 rounded-lg border overflow-hidden bg-gray-50 shrink-0" title={item.productName}>
                              <ProductThumb imageUrl={p?.imageUrl} name={item.productName} className="rounded-lg" />
                            </div>
                          );
                        })}
                        {(sale.items?.length ?? 0) > 3 && (
                          <span className="text-xs text-gray-400">+{sale.items.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-primary">{formatCurrency(sale.total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusConfig[sale.status]?.variant}>{statusConfig[sale.status]?.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{sale.assignedToName || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(sale.date)}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewSale(sale)}>
                            <Eye className="h-4 w-4 mr-2" />အသေးစိတ်ကြည့်မည်
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(sale.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />ဖျက်
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                      အရောင်းမှတ်တမ်းမတွေ့ပါ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Sale dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>အရောင်းအသစ်မှတ်တမ်းတင်မည်</DialogTitle>
          </DialogHeader>
          <SaleForm
            products={products}
            initialContacts={contacts}
            users={users}
            onSubmit={(data) => createMutation.mutate(data)}
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {viewSale && (
        <SaleDetailModal
          sale={viewSale}
          products={products}
          onClose={() => setViewSale(undefined)}
        />
      )}
    </div>
  );
}
