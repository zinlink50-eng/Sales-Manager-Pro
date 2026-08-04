import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Deal, PipelineStage, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, MoreHorizontal, Edit, Trash2, GripVertical, Calendar, DollarSign, Building2, LayoutGrid, List } from "lucide-react";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function DealForm({ deal, stages, users, onSubmit, onClose }: {
  deal?: Deal; stages: PipelineStage[]; users: User[];
  onSubmit: (data: any) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: deal?.title ?? "",
    company: deal?.company ?? "",
    stage: deal?.stage ?? stages[0]?.name ?? "Prospecting",
    value: deal?.value?.toString() ?? "",
    probability: deal?.probability?.toString() ?? "10",
    expectedClose: deal?.expectedClose ?? "",
    assignedTo: deal?.assignedTo?.toString() ?? "",
    description: deal?.description ?? "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleStageChange = (v: string) => {
    const stage = stages.find((s) => s.name === v);
    set("stage", v);
    if (stage) set("probability", stage.probability.toString());
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, value: parseFloat(form.value) || 0, probability: parseInt(form.probability) || 0, assignedTo: form.assignedTo ? parseInt(form.assignedTo) : undefined }); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Deal Title *</Label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. TechCorp Enterprise Suite" required />
        </div>
        <div className="space-y-1.5">
          <Label>Company</Label>
          <Input value={form.company} onChange={(e) => set("company", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Deal Value ($) *</Label>
          <Input type="number" value={form.value} onChange={(e) => set("value", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Stage</Label>
          <Select value={form.stage} onValueChange={handleStageChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{stages.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Probability (%)</Label>
          <Input type="number" min="0" max="100" value={form.probability} onChange={(e) => set("probability", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Expected Close Date</Label>
          <Input type="date" value={form.expectedClose} onChange={(e) => set("expectedClose", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Assigned To</Label>
          <Select value={form.assignedTo} onValueChange={(v) => set("assignedTo", v)}>
            <SelectTrigger><SelectValue placeholder="Select rep" /></SelectTrigger>
            <SelectContent>{users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">{deal ? "Save Changes" : "Create Deal"}</Button>
      </DialogFooter>
    </form>
  );
}

function DealCard({ deal, stages, onEdit, onDelete, onStageChange }: {
  deal: Deal; stages: PipelineStage[];
  onEdit: () => void; onDelete: () => void;
  onStageChange: (stage: string) => void;
}) {
  const stage = stages.find((s) => s.name === deal.stage);
  return (
    <Card className="mb-2 hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium text-sm text-gray-900 leading-tight flex-1">{deal.title}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {stages.filter(s => s.name !== deal.stage).map(s => (
                <DropdownMenuItem key={s.id} onClick={() => onStageChange(s.name)}>
                  Move to {s.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={onEdit}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={onDelete}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {deal.company && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Building2 className="h-3 w-3" />{deal.company}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-primary">{formatCurrency(deal.value)}</span>
          <span className="text-xs text-gray-400">{deal.probability}%</span>
        </div>
        {deal.expectedClose && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <Calendar className="h-3 w-3" />Closes {formatDate(deal.expectedClose)}
          </div>
        )}
        {deal.assignedToName && (
          <div className="flex items-center gap-1 mt-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{getInitials(deal.assignedToName)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500">{deal.assignedToName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Deals() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | undefined>();
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => api.get<Deal[]>("/api/deals") });
  const { data: stages = [] } = useQuery({ queryKey: ["pipeline-stages"], queryFn: () => api.get<PipelineStage[]>("/api/pipeline-stages") });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => api.get<User[]>("/api/users") });

  const invalidate = () => { qc.invalidateQueries({ queryKey: ["deals"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); };

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/deals", data),
    onSuccess: () => { invalidate(); setDialogOpen(false); toast({ title: "Deal created" }); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/api/deals/${id}`, data),
    onSuccess: () => { invalidate(); setDialogOpen(false); setEditing(undefined); toast({ title: "Deal updated" }); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/deals/${id}`),
    onSuccess: () => { invalidate(); toast({ title: "Deal deleted" }); },
  });

  const totalPipeline = deals
    .filter((d) => !["Closed Won", "Closed Lost"].includes(d.stage))
    .reduce((s, d) => s + d.value, 0);
  const wonRevenue = deals.filter((d) => d.stage === "Closed Won").reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Pipeline", value: formatCurrency(totalPipeline), color: "text-blue-600" },
          { label: "Won Revenue", value: formatCurrency(wonRevenue), color: "text-emerald-600" },
          { label: "Active Deals", value: String(deals.filter((d) => !["Closed Won", "Closed Lost"].includes(d.stage)).length), color: "text-indigo-600" },
          { label: "Win Rate", value: `${deals.length > 0 ? Math.round((deals.filter((d) => d.stage === "Closed Won").length / deals.length) * 100) : 0}%`, color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border p-3">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 border rounded-lg p-1 bg-white">
          <button onClick={() => setView("kanban")} className={cn("px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 transition-colors", view === "kanban" ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50")}>
            <LayoutGrid className="h-4 w-4" />Kanban
          </button>
          <button onClick={() => setView("list")} className={cn("px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 transition-colors", view === "list" ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50")}>
            <List className="h-4 w-4" />List
          </button>
        </div>
        <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Deal
        </Button>
      </div>

      {view === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.name);
            const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
            return (
              <div key={stage.id} className="shrink-0 w-72">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-sm font-semibold text-gray-700">{stage.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{stageDeals.length}</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatCurrency(stageValue)}</span>
                </div>
                <div className="min-h-20 bg-gray-50/80 rounded-lg p-2">
                  {stageDeals.map((deal) => (
                    <DealCard
                      key={deal.id} deal={deal} stages={stages}
                      onEdit={() => { setEditing(deal); setDialogOpen(true); }}
                      onDelete={() => deleteMutation.mutate(deal.id)}
                      onStageChange={(newStage) => updateMutation.mutate({ id: deal.id, data: { stage: newStage } })}
                    />
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="py-6 text-center text-xs text-gray-300">No deals</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    {["Deal", "Company", "Stage", "Value", "Probability", "Close Date", "Assigned", ""].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {deals.map((deal) => {
                    const stage = stages.find((s) => s.name === deal.stage);
                    return (
                      <tr key={deal.id} className="hover:bg-gray-50/50 group">
                        <td className="px-4 py-3 font-medium text-sm">{deal.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{deal.company || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-sm">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage?.color }} />
                            {deal.stage}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-primary">{formatCurrency(deal.value)}</td>
                        <td className="px-4 py-3 text-sm">{deal.probability}%</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(deal.expectedClose)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{deal.assignedToName || "—"}</td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditing(deal); setDialogOpen(true); }}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(deal.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Deal" : "Add New Deal"}</DialogTitle>
          </DialogHeader>
          <DealForm
            deal={editing} stages={stages} users={users}
            onSubmit={(data) => editing ? updateMutation.mutate({ id: editing.id, data }) : createMutation.mutate(data)}
            onClose={() => { setDialogOpen(false); setEditing(undefined); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
