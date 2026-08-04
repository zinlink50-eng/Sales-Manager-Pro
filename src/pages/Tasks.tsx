import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Task, User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Edit, Trash2, Calendar, Flag, LinkIcon, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const priorityConfig: Record<string, { label: string; variant: any; color: string }> = {
  high: { label: "High", variant: "destructive", color: "text-red-600" },
  medium: { label: "Medium", variant: "warning", color: "text-amber-600" },
  low: { label: "Low", variant: "secondary", color: "text-gray-500" },
};

function TaskForm({ task, users, onSubmit, onClose }: {
  task?: Task; users: User[]; onSubmit: (data: any) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    dueDate: task?.dueDate ?? "",
    priority: task?.priority ?? "medium",
    status: task?.status ?? "todo",
    assignedTo: task?.assignedTo?.toString() ?? "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, assignedTo: form.assignedTo ? parseInt(form.assignedTo) : undefined }); }} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Task Title *</Label>
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Follow up with TechCorp" required />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Due Date</Label>
          <Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Assigned To</Label>
          <Select value={form.assignedTo} onValueChange={(v) => set("assignedTo", v)}>
            <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
            <SelectContent>{users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">{task ? "Save Changes" : "Create Task"}</Button>
      </DialogFooter>
    </form>
  );
}

export default function Tasks() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();

  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: () => api.get<Task[]>("/api/tasks") });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => api.get<User[]>("/api/users") });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["tasks"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/tasks", data),
    onSuccess: () => { invalidate(); setDialogOpen(false); toast({ title: "Task created" }); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/api/tasks/${id}`, data),
    onSuccess: () => { invalidate(); setDialogOpen(false); setEditing(undefined); toast({ title: "Task updated" }); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/tasks/${id}`),
    onSuccess: () => { invalidate(); toast({ title: "Task deleted" }); },
  });

  const toggleDone = (task: Task) => {
    updateMutation.mutate({ id: task.id, data: { status: task.status === "done" ? "todo" : "done" } });
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || t.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === "done") return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {([["all", "All"], ["todo", "To Do"], ["in_progress", "In Progress"], ["done", "Done"]] as const).map(([s, label]) => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
              filter === s ? "bg-primary text-white border-primary" : "bg-white hover:bg-gray-50 text-gray-600"
            )}>
            {label} ({counts[s]})
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search tasks..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      <div className="space-y-2">
        {filtered.map((task) => (
          <Card key={task.id} className={cn("transition-all hover:shadow-sm", task.status === "done" && "opacity-60")}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.status === "done"}
                  onCheckedChange={() => toggleDone(task)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("text-sm font-medium", task.status === "done" && "line-through text-gray-400")}>
                      {task.title}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(task); setDialogOpen(true); }}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(task.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <Badge variant={priorityConfig[task.priority]?.variant} className="text-xs">
                      <Flag className="h-3 w-3 mr-1" />{priorityConfig[task.priority]?.label}
                    </Badge>
                    {task.dueDate && (
                      <span className={cn("flex items-center gap-1 text-xs", isOverdue(task) ? "text-red-500 font-medium" : "text-gray-400")}>
                        <Calendar className="h-3 w-3" />
                        {isOverdue(task) ? "Overdue · " : ""}{formatDate(task.dueDate)}
                      </span>
                    )}
                    {task.relatedName && (
                      <span className="flex items-center gap-1 text-xs text-blue-500">
                        <LinkIcon className="h-3 w-3" />{task.relatedName}
                      </span>
                    )}
                    {task.assignedToName && (
                      <div className="flex items-center gap-1 ml-auto">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{getInitials(task.assignedToName)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">{task.assignedToName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No tasks found</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Task" : "Add New Task"}</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={editing} users={users}
            onSubmit={(data) => editing ? updateMutation.mutate({ id: editing.id, data }) : createMutation.mutate(data)}
            onClose={() => { setDialogOpen(false); setEditing(undefined); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
