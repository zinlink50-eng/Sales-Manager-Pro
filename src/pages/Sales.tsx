import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salesOffline, productsOffline, contactsOffline, usersOffline } from "@/lib/offline-api";
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
  DollarSign, TrendingUp, Package, X, Minus, UserPlus, ZoomIn,
  ChevronLeft,
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
    <div className={cn("h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center", className)}>
      <Package className="h-1/2 w-1/2 text-gray-300" />
    </div>
  );
}

// ── Image Lightbox ────────────────────────────────────────
function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt}
        className="max-w-[92vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute top-5 right-5 text-white bg-white/10 hover:bg-white/25 rounded-full p-3 transition-colors backdrop-blur-sm"
        onClick={onClose}
        aria-label="ပိတ်မည်"
      >
        <X className="h-6 w-6" />
      </button>
      <p className="absolute bottom-6 left-0 right-0 text-center text-white/60 text-sm">{alt}</p>
    </div>
  );
}

// ── Add Customer — full-screen on mobile ──────────────────
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
      const created = await contactsOffline.create({
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        phone:     form.phone.trim() || undefined,
        company:   form.company.trim() || undefined,
        email:     `${form.firstName.toLowerCase().replace(/\s+/g, "")}.${Date.now()}@customer.local`,
        status:    "active",
      } as any);
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
      {/* Full-screen on mobile, compact sheet on sm+ */}
      <DialogContent className="
        max-sm:fixed max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:max-h-none
        max-sm:rounded-none max-sm:[transform:none] max-sm:border-0
        overflow-y-auto sm:max-w-md sm:rounded-2xl
      ">
        <DialogHeader className="flex-row items-center gap-3 pb-0">
          <button
            className="sm:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
            onClick={onClose}
            type="button"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-primary" />
            ဖောက်သည်အသစ်ထည့်မည်
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-base">နာမည် *</Label>
              <Input
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                placeholder="မောင်မောင်"
                required autoFocus
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">မိသားစုနာမည်</Label>
              <Input
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                placeholder="ရွေးချယ်နိုင်"
                className="h-12 text-base"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-base">ဖုန်းနံပါတ်</Label>
            <Input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="09-XXXXXXXXX"
              type="tel"
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base">ကုမ္ပဏီ / အဖွဲ့အစည်း</Label>
            <Input
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="ရွေးချယ်နိုင်"
              className="h-12 text-base"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy} className="flex-1 h-12 text-base">
              မလုပ်တော့
            </Button>
            <Button type="submit" disabled={busy || !form.firstName.trim()} className="flex-1 h-12 text-base font-semibold">
              {busy ? "ထည့်နေသည်..." : "ဖောက်သည်ထည့်မည်"}
            </Button>
          </div>
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
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | undefined>();

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

  // ── Cart panel ────────────────────────────────────────
  const CartPanel = () => (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b bg-gray-50 text-sm font-semibold text-gray-600 shrink-0">
        🛒 ပြောင်းလဲချက် ({cart.length} မျိုး)
      </div>
      <div className="flex-1 overflow-y-auto divide-y min-h-0">
        {cart.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
            <ShoppingCart className="h-10 w-10 text-gray-200" />
            <span>ကုန်ပစ္စည်းရွေးပါ</span>
          </div>
        )}
        {cart.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3">
            <div className="h-14 w-14 rounded-xl overflow-hidden border shrink-0 bg-gray-50">
              <ProductThumb imageUrl={item.imageUrl} name={item.productName} className="rounded-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{item.productName}</div>
              <div className="text-sm text-primary font-bold">{formatCurrency(item.unitPrice)}</div>
              <div className="text-xs text-gray-400">ပေါင်း: {formatCurrency(item.quantity * item.unitPrice)}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => updateQty(i, -1)}
                className="h-11 w-11 rounded-xl border-2 flex items-center justify-center hover:bg-red-50 hover:border-red-300 active:scale-95 touch-manipulation transition-colors"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-base font-bold w-8 text-center tabular-nums">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQty(i, 1)}
                className="h-11 w-11 rounded-xl border-2 border-primary/40 bg-primary/5 flex items-center justify-center hover:bg-primary/15 active:scale-95 touch-manipulation transition-colors text-primary"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeFromCart(i)}
              className="text-gray-300 hover:text-red-500 p-1 ml-1 touch-manipulation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="border-t px-4 py-3 bg-gray-50 shrink-0">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-600">စုစုပေါင်း</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );

  // ── Product Grid — MOBILE: single-column horizontal cards ──────────────
  // ── Product Grid — TABLET+: 2-col or 3-col vertical cards ─────────────
  const ProductGrid = () => (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-2.5 border-b bg-gray-50 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="h-10 pl-9 text-sm"
            placeholder="ကုန်ပစ္စည်းရှာမည်..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">

        {/* ── MOBILE: single-column horizontal card list ── */}
        <div className="sm:hidden divide-y">
          {filteredProducts.map((p) => {
            const inCart  = cart.find((c) => c.productId === p.id);
            const cartIdx = cart.findIndex((c) => c.productId === p.id);
            const isLow   = p.stock !== undefined && p.stock !== null && p.stock < (p.minStock ?? 5);
            return (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 transition-colors active:bg-gray-50",
                  inCart ? "bg-primary/5" : "bg-white"
                )}
              >
                {/* Thumbnail — tappable to open lightbox */}
                <div
                  className="relative h-[72px] w-[72px] rounded-2xl overflow-hidden border shrink-0 bg-gray-100 shadow-sm"
                  onClick={() => p.imageUrl && setLightbox({ src: p.imageUrl, alt: p.name })}
                >
                  <ProductThumb imageUrl={p.imageUrl} name={p.name} />
                  {p.imageUrl && (
                    <div className="absolute inset-0 flex items-end justify-end p-1 pointer-events-none">
                      <ZoomIn className="h-3.5 w-3.5 text-white/80 drop-shadow" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2">
                    {p.name}
                  </div>
                  <div className="text-lg font-bold text-primary mt-0.5">
                    {formatCurrency(p.price)}
                  </div>
                  {p.stock !== undefined && (
                    <div className={cn("text-xs mt-0.5", isLow ? "text-red-500 font-semibold" : "text-gray-400")}>
                      {isLow ? "⚠ " : ""}ကျန်: {p.stock} {p.unit}
                    </div>
                  )}
                </div>

                {/* Add / quantity control */}
                {inCart ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQty(cartIdx, -1)}
                      className="h-12 w-12 rounded-2xl border-2 flex items-center justify-center hover:bg-red-50 hover:border-red-300 active:scale-95 touch-manipulation transition-all shadow-sm"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="text-lg font-bold w-9 text-center tabular-nums text-primary">
                      {inCart.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(p)}
                      className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 active:scale-95 touch-manipulation transition-all shadow-md"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToCart(p)}
                    className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 active:scale-95 touch-manipulation transition-all shadow-md shrink-0"
                    aria-label="ထည့်မည်"
                  >
                    <Plus className="h-6 w-6" />
                  </button>
                )}
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
              <Package className="h-10 w-10 text-gray-200" />
              <span>ကုန်ပစ္စည်းမတွေ့ပါ</span>
            </div>
          )}
        </div>

        {/* ── TABLET+: 2-col / 3-col vertical card grid ── */}
        <div className="hidden sm:block p-3">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 content-start">
            {filteredProducts.map((p) => {
              const inCart = cart.find((c) => c.productId === p.id);
              const isLow  = p.stock !== undefined && p.stock !== null && p.stock < (p.minStock ?? 5);
              return (
                <div key={p.id} className="relative">
                  <button
                    type="button"
                    onClick={() => addToCart(p)}
                    className={cn(
                      "relative flex flex-col items-center w-full rounded-2xl border text-center transition-all",
                      "hover:shadow-lg hover:border-primary/50 active:scale-[0.97] overflow-hidden pb-3 touch-manipulation",
                      inCart ? "border-primary bg-primary/5 shadow-md" : "border-gray-200 bg-white shadow-sm"
                    )}
                  >
                    {/* Square image */}
                    <div className="w-full aspect-square overflow-hidden bg-gray-50 rounded-t-2xl">
                      <ProductThumb imageUrl={p.imageUrl} name={p.name} className="rounded-t-2xl" />
                    </div>
                    <div className="px-2.5 pt-2 pb-0.5 w-full">
                      <div className="text-[13px] font-semibold text-gray-800 leading-tight line-clamp-2">
                        {p.name}
                      </div>
                      <div className="text-base font-bold text-primary mt-1">{formatCurrency(p.price)}</div>
                      {p.stock !== undefined && (
                        <div className={cn("text-[11px] mt-0.5", isLow ? "text-red-500 font-semibold" : "text-gray-400")}>
                          {isLow ? "⚠ " : ""}{p.stock} {p.unit}
                        </div>
                      )}
                    </div>
                    {inCart && (
                      <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold shadow-lg">
                        {inCart.quantity}
                      </div>
                    )}
                  </button>
                  {/* Lightbox zoom */}
                  {p.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setLightbox({ src: p.imageUrl!, alt: p.name })}
                      className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white transition-colors z-10 touch-manipulation"
                      aria-label="ပုံကြည့်မည်"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="col-span-3 py-10 text-center text-sm text-gray-400">
                ကုန်ပစ္စည်းမတွေ့ပါ
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(undefined)} />
      )}
      <AddCustomerDialog
        open={addCustOpen}
        onClose={() => setAddCustOpen(false)}
        onCreated={(c) => {
          setContacts((prev) => [...prev, c]);
          set("contactId", String(c.id));
        }}
      />

      <form
        onSubmit={(e) => {
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
        }}
        className="flex flex-col gap-4"
      >
        {/* ── Header fields ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Customer — full width */}
          <div className="col-span-2 space-y-2">
            <Label className="text-sm">ဖောက်သည်</Label>
            <div className="flex gap-2">
              <Select value={form.contactId} onValueChange={(v) => set("contactId", v)}>
                <SelectTrigger className="h-11 text-sm flex-1">
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
                className="h-11 w-11 shrink-0 border-primary/40 text-primary hover:bg-primary/5"
                title="ဖောက်သည်အသစ်ထည့်မည်"
                onClick={() => setAddCustOpen(true)}
              >
                <UserPlus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">ရောင်းသူ</Label>
            <Select value={form.assignedTo} onValueChange={(v) => set("assignedTo", v)}>
              <SelectTrigger className="h-11 text-sm">
                <SelectValue placeholder="ရောင်းသူရွေးပါ" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">ရောင်းရက်</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="h-11 text-sm"
              required
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label className="text-sm">အခြေအနေ</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="h-11 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── MOBILE: tab switcher + full panels ── */}
        <div className="sm:hidden">
          <div className="flex rounded-xl border overflow-hidden mb-3 shadow-sm">
            <button
              type="button"
              onClick={() => setMobileTab("products")}
              className={cn(
                "flex-1 py-3 text-sm font-semibold transition-colors",
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
                "flex-1 py-3 text-sm font-semibold transition-colors relative",
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
          {/* Panel — tall enough to show several products */}
          <div className="border rounded-2xl overflow-hidden shadow-sm" style={{ height: 420 }}>
            {mobileTab === "products" ? <ProductGrid /> : <CartPanel />}
          </div>
        </div>

        {/* ── TABLET+: side-by-side ── */}
        <div className="hidden sm:grid sm:grid-cols-5 gap-4 border rounded-2xl overflow-hidden shadow-sm" style={{ height: 400 }}>
          <div className="col-span-3 border-r overflow-hidden flex flex-col">
            <ProductGrid />
          </div>
          <div className="col-span-2 overflow-hidden flex flex-col">
            <CartPanel />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-sm">မှတ်ချက်</Label>
          <Input
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="ရွေးချယ်နိုင်သောမှတ်ချက်..."
            className="h-11"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none h-12 text-base">
            မလုပ်တော့
          </Button>
          <Button
            type="submit"
            disabled={cart.length === 0}
            className="flex-1 h-12 text-base font-semibold gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">အရောင်းမှတ်တမ်းတင်မည်</span>
            <span className="sm:hidden">မှတ်တမ်းတင်မည်</span>
            {cart.length > 0 && (
              <span className="font-bold ml-1">({formatCurrency(total)})</span>
            )}
          </Button>
        </div>
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
      <DialogContent className="
        max-sm:fixed max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:max-h-none
        max-sm:rounded-none max-sm:[transform:none] max-sm:border-0
        overflow-y-auto sm:max-w-lg sm:max-h-[90vh] sm:rounded-2xl
      ">
        <DialogHeader>
          <DialogTitle>
            အရောင်း #{String(sale.id).padStart(4, "0")} — {formatDate(sale.date)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">ဖောက်သည်:</span>
              <span className="font-medium ml-1">{sale.contactName || "—"}</span>
            </div>
            <div>
              <span className="text-gray-500">အခြေအနေ:</span>
              <Badge variant={statusConfig[sale.status]?.variant} className="ml-1">
                {statusConfig[sale.status]?.label}
              </Badge>
            </div>
            <div>
              <span className="text-gray-500">ရောင်းသူ:</span>
              <span className="font-medium ml-1">{sale.assignedToName || "—"}</span>
            </div>
            <div>
              <span className="text-gray-500">ရက်စွဲ:</span>
              <span className="font-medium ml-1">{formatDate(sale.date)}</span>
            </div>
          </div>
          <div className="border rounded-xl overflow-hidden">
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
                        <div className="h-10 w-10 rounded-lg overflow-hidden border bg-gray-50">
                          <ProductThumb imageUrl={p?.imageUrl} name={item.productName} className="rounded-lg" />
                        </div>
                      </td>
                      <td className="px-3 py-2 font-medium">{item.productName}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-primary">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-3 py-2 text-right font-semibold text-sm">စုစုပေါင်း</td>
                  <td className="px-3 py-2 text-right font-bold text-primary text-base">
                    {formatCurrency(sale.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {sale.notes && (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">{sale.notes}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="h-11 px-6">ပိတ်မည်</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function Sales() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [viewSale, setViewSale]         = useState<Sale | undefined>();

  // ── Offline-first reads — always from IndexedDB (SyncContext keeps it current) ──
  const { data: sales    = [] } = useQuery({ queryKey: ["sales"],    queryFn: salesOffline.list });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: productsOffline.list });
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: contactsOffline.list });
  const { data: users    = [] } = useQuery({ queryKey: ["users"],    queryFn: usersOffline.list });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["sales"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => salesOffline.create(data),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ["contacts"] });
      setDialogOpen(false);
      toast({ title: "အရောင်းမှတ်တမ်းတင်ပြီး" });
    },
    onError: (e: any) => toast({ title: "အမှား", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => salesOffline.delete(id),
    onSuccess: () => { invalidate(); toast({ title: "အရောင်းဖျက်ပြီး" }); },
  });

  const filtered = sales.filter((s) => {
    const matchSearch = !search
      || s.contactName?.toLowerCase().includes(search.toLowerCase())
      || String(s.id).includes(search);
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSales       = sales.reduce((s, sale) => s + sale.total, 0);
  const confirmedRevenue = sales
    .filter((s) => s.status === "confirmed" || s.status === "delivered")
    .reduce((s, sale) => s + sale.total, 0);
  const avgOrderValue    = sales.length > 0 ? totalSales / sales.length : 0;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "မှာယူမှုစုစုပေါင်း",          value: String(sales.length),            icon: ShoppingCart, color: "bg-blue-50 text-blue-600" },
          { label: "အတည်ပြုဝင်ငွေ",                value: formatCurrency(confirmedRevenue), icon: DollarSign,   color: "bg-emerald-50 text-emerald-600" },
          { label: "ပျမ်းမျှမှာယူမှုတန်ဖိုး",      value: formatCurrency(avgOrderValue),    icon: TrendingUp,   color: "bg-indigo-50 text-indigo-600" },
          { label: "ရောင်းချသောပစ္စည်းစုစုပေါင်း",  value: String(sales.reduce((s, sale) => s + (sale.items?.length ?? 0), 0)), icon: Package, color: "bg-amber-50 text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-3 flex items-center gap-3">
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

      {/* Status filter */}
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

      {/* Search + New button */}
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
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5 shrink-0 h-10">
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
                      <Badge variant={statusConfig[sale.status]?.variant}>
                        {statusConfig[sale.status]?.label}
                      </Badge>
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

      {/* New Sale dialog — full-screen on mobile */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="
          max-sm:fixed max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:max-h-none
          max-sm:rounded-none max-sm:[transform:none] max-sm:border-0
          overflow-y-auto sm:max-w-3xl sm:max-h-[94vh] sm:rounded-2xl
        ">
          <DialogHeader className="flex-row items-center gap-3 pb-0 sm:pb-4">
            <button
              className="sm:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
              onClick={() => setDialogOpen(false)}
              type="button"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <DialogTitle className="text-lg font-semibold">
              အရောင်းအသစ်မှတ်တမ်းတင်မည်
            </DialogTitle>
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
