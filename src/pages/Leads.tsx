import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Lead, User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Phone, Mail, Building2, Filter, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; variant: any }> = {
  new: { label: "New", variant: "info" },
  contacted: { label: "Contacted", variant: "secondary" },
  qualified: { label: "Qualified", variant: "success" },
  unqualified: { label: "Unqualified", variant: "destructive" },
  converted: { label: "Converted", variant: "purple" },
};

const sources = ["LinkedIn", "Referral", "Cold Outreach", "Conference", "Website", "Trade Show", "Social Media", "Other"];

function LeadForm({
  lead, users, onSubmit, onClose,
}: {
  lead?: Lead; users: User[]; onSubmit: (data: any) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: lead?.title ?? "",
    company: lead?.company ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    source: lead?.source ?? "LinkedIn",
    status: lead?.status ?? "new",
    value: lead?.value?.toString() ?? "",
    notes: lead?.notes ?? "",
    assignedTo: lead?.assignedTo?.toString() ?? "",
  });

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      value: form.value ? parseFloat(form.value) : undefined,
      assignedTo: form.assignedTo ? parseInt(form.assignedTo) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Lead Title *</Label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. TechCorp CRM Deal" required />
        </div>
        <div className="space-y-1.5">
          <Label>Company</Label>
          <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Company name" />
        </div>
        <div className="space-y-1.5">
          <Label>Est. Value ($)</Label>
          <Input type="number" value={form.value} onChange={(e) => set("value", e.target.value)} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@company.com" />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1-555-0100" />
        </div>
        <div className="space-y-1.5">
          <Label>Source</Label>
          <Select value={form.source} onValueChange={(v) => set("source", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
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
        <div className="col-span-2 space-y-1.5">
          <Label>Assigned To</Label>
          <Select value={form.assignedTo} onValueChange={(v) => set("assignedTo", v)}>
            <SelectTrigger><SelectValue placeholder="Select team member" /></SelectTrigger>
            <SelectContent>
              {users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Notes</Label>
          <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Additional notes..." rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">{lead ? "Save Changes" : "Create Lead"}</Button>
      </DialogFooter>
    </form>
  );
}

export default function Leads() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | undefined>();

  const { data: leads = [] } = useQuery({ queryKey: ["leads"], queryFn: () => api.get<Lead[]>("/api/leads") });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => api.get<User[]>("/api/users") });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["leads"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/leads", data),
    onSuccess: () => { invalidate(); setDialogOpen(false); toast({ title: "Lead created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/api/leads/${id}`, data),
    onSuccess: () => { invalidate(); setDialogOpen(false); setEditing(undefined); toast({ title: "Lead updated" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/leads/${id}`),
    onSuccess: () => { invalidate(); toast({ title: "Lead deleted" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = leads.filter((l) => {
    const matchSearch = !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.company?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreate = () => { setEditing(undefined); setDialogOpen(true); };
  const openEdit = (lead: Lead) => { setEditing(lead); setDialogOpen(true); };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {["all", "new", "contacted", "qualified", "converted"].map((s) => {
          const count = s === "all" ? leads.length : leads.filter((l) => l.status === s).length;
          const val = s === "all"
            ? leads.reduce((acc, l) => acc + (l.value || 0), 0)
            : leads.filter((l) => l.status === s).reduce((acc, l) => acc + (l.value || 0), 0);
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`p-3 rounded-lg border text-left transition-colors ${statusFilter === s ? "bg-primary text-white border-primary" : "bg-white hover:bg-gray-50"}`}
            >
              <div className={`text-lg font-bold ${statusFilter === s ? "text-white" : ""}`}>{count}</div>
              <div className={`text-xs capitalize ${statusFilter === s ? "text-white/80" : "text-muted-foreground"}`}>{s === "all" ? "Total Leads" : statusConfig[s]?.label}</div>
              {val > 0 && <div className={`text-xs font-medium mt-0.5 ${statusFilter === s ? "text-white/90" : "text-primary"}`}>{formatCurrency(val)}</div>}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search leads..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Lead
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Lead", "Company", "Source", "Value", "Status", "Assigned To", "Created", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-gray-900">{lead.title}</div>
                      {lead.email && <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" />{lead.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        {lead.company || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.source}</td>
                    <td className="px-4 py-3 text-sm font-medium">{lead.value ? formatCurrency(lead.value) : "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusConfig[lead.status]?.variant}>{statusConfig[lead.status]?.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {lead.assignedToName ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(lead.assignedToName)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{lead.assignedToName}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(lead)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(lead.id)}
                          ><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">No leads found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Lead" : "Add New Lead"}</DialogTitle>
          </DialogHeader>
          <LeadForm
            lead={editing}
            users={users}
            onSubmit={(data) => editing ? updateMutation.mutate({ id: editing.id, data }) : createMutation.mutate(data)}
            onClose={() => { setDialogOpen(false); setEditing(undefined); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
