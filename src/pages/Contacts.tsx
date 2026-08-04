import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Contact, User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Mail, Phone, Building2 } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; variant: any }> = {
  active: { label: "တက်ကြွ", variant: "success" },
  inactive: { label: "တက်ကြွမှုမရှိ", variant: "secondary" },
  prospect: { label: "ဖောက်သည်မျိုး", variant: "info" },
};

const sources = ["LinkedIn", "Referral", "Cold Outreach", "Conference", "Website", "Trade Show", "Social Media", "Other"];

function ContactForm({ contact, users, onSubmit, onClose }: {
  contact?: Contact; users: User[]; onSubmit: (data: any) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    firstName: contact?.firstName ?? "",
    lastName: contact?.lastName ?? "",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    company: contact?.company ?? "",
    position: contact?.position ?? "",
    status: contact?.status ?? "prospect",
    source: contact?.source ?? "LinkedIn",
    assignedTo: contact?.assignedTo?.toString() ?? "",
    notes: contact?.notes ?? "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, assignedTo: form.assignedTo ? parseInt(form.assignedTo) : undefined }); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>အမည် (ပထမ) *</Label>
          <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>အမည် (နောက်ဆုံး) *</Label>
          <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>အီးမေးလ် *</Label>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>ဖုန်းနံပါတ်</Label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>ကုမ္ပဏီ</Label>
          <Input value={form.company} onChange={(e) => set("company", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>ရာထူး / ဝတ်ဆောင်</Label>
          <Input value={form.position} onChange={(e) => set("position", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>အခြေအနေ</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>ရင်းမြစ်</Label>
          <Select value={form.source} onValueChange={(v) => set("source", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>တာဝန်ပေးသူ</Label>
          <Select value={form.assignedTo} onValueChange={(v) => set("assignedTo", v)}>
            <SelectTrigger><SelectValue placeholder="တာဝန်မပေးရသေး" /></SelectTrigger>
            <SelectContent>{users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>မှတ်ချက်</Label>
          <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>မလုပ်တော့</Button>
        <Button type="submit">{contact ? "သိမ်းဆည်းမည်" : "အဆက်အသွယ်ဖန်တီးမည်"}</Button>
      </DialogFooter>
    </form>
  );
}

export default function Contacts() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | undefined>();

  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => api.get<Contact[]>("/api/contacts") });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => api.get<User[]>("/api/users") });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["contacts"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/contacts", data),
    onSuccess: () => { invalidate(); setDialogOpen(false); toast({ title: "အဆက်အသွယ်ဖန်တီးပြီး" }); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/api/contacts/${id}`, data),
    onSuccess: () => { invalidate(); setDialogOpen(false); setEditing(undefined); toast({ title: "အဆက်အသွယ်ပြင်ဆင်ပြီး" }); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/contacts/${id}`),
    onSuccess: () => { invalidate(); toast({ title: "အဆက်အသွယ်ဖျက်ပြီး" }); },
  });

  const filtered = contacts.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchSearch = !search || fullName.includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "active", "prospect", "inactive"].map((s) => {
          const count = s === "all" ? contacts.length : contacts.filter((c) => c.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${statusFilter === s ? "bg-primary text-white border-primary" : "bg-white hover:bg-gray-50 text-gray-600"}`}
            >
              {s === "all" ? "အားလုံး" : statusConfig[s]?.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="အဆက်အသွယ်ရှာဖွေမည်..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" /> အဆက်အသွယ်ထည့်မည်
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(`${contact.firstName} ${contact.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{contact.firstName} {contact.lastName}</div>
                    {contact.position && <div className="text-xs text-gray-500">{contact.position}</div>}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 -mr-1"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditing(contact); setDialogOpen(true); }}><Edit className="h-4 w-4 mr-2" />ပြင်ဆင်</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(contact.id)}><Trash2 className="h-4 w-4 mr-2" />ဖျက်</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 space-y-1.5">
                {contact.company && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    {contact.company}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:text-primary truncate">{contact.email}</a>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    {contact.phone}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <Badge variant={statusConfig[contact.status]?.variant}>{statusConfig[contact.status]?.label}</Badge>
                {contact.assignedToName && (
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px] bg-gray-100">{getInitials(contact.assignedToName)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-500">{contact.assignedToName}</span>
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-400">ထည့်သည့်ရက် {formatDate(contact.createdAt)}</div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 py-12 text-center text-sm text-gray-400">အဆက်အသွယ်မတွေ့ပါ</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "အဆက်အသွယ်ပြင်ဆင်မည်" : "အဆက်အသွယ်အသစ်ထည့်မည်"}</DialogTitle>
          </DialogHeader>
          <ContactForm
            contact={editing} users={users}
            onSubmit={(data) => editing ? updateMutation.mutate({ id: editing.id, data }) : createMutation.mutate(data)}
            onClose={() => { setDialogOpen(false); setEditing(undefined); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
