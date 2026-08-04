import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PipelineStage, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Save, User as UserIcon, GitBranch, Users, Building2, Bell } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const STAGE_COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

function ProfileTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg bg-primary text-white">
            {user ? getInitials(user.name) : "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-lg">{user?.name}</div>
          <Badge variant="secondary" className="capitalize">{user?.role?.replace("_", " ")}</Badge>
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Full Name</Label>
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Email Address</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Phone Number</Label>
          <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        </div>
      </div>
      <Button className="gap-2" onClick={() => toast({ title: "Profile updated" })}><Save className="h-4 w-4" />Save Profile</Button>

      <Separator />
      <div className="space-y-3">
        <h3 className="font-medium">Change Password</h3>
        <div className="space-y-1.5">
          <Label>Current Password</Label>
          <Input type="password" placeholder="••••••••" />
        </div>
        <div className="space-y-1.5">
          <Label>New Password</Label>
          <Input type="password" placeholder="••••••••" />
        </div>
        <div className="space-y-1.5">
          <Label>Confirm New Password</Label>
          <Input type="password" placeholder="••••••••" />
        </div>
        <Button variant="outline" onClick={() => toast({ title: "Password updated" })}>Update Password</Button>
      </div>
    </div>
  );
}

function PipelineTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: stages = [] } = useQuery({ queryKey: ["pipeline-stages"], queryFn: () => api.get<PipelineStage[]>("/api/pipeline-stages") });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/api/pipeline-stages/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pipeline-stages"] }); toast({ title: "Stage updated" }); },
  });

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h3 className="font-medium mb-1">Pipeline Stages</h3>
        <p className="text-sm text-muted-foreground">Customize the stages in your sales pipeline. Changes apply immediately.</p>
      </div>
      <div className="space-y-3">
        {stages.map((stage) => (
          <Card key={stage.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{stage.name}</div>
                    <div className="text-xs text-gray-400">Order: {stage.order}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500">Probability</Label>
                    <Input
                      type="number" min="0" max="100"
                      defaultValue={stage.probability}
                      className="w-16 h-7 text-sm"
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) updateMutation.mutate({ id: stage.id, data: { probability: val } });
                      }}
                    />
                    <span className="text-xs text-gray-400">%</span>
                  </div>
                  <div className="flex gap-1">
                    {STAGE_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => updateMutation.mutate({ id: stage.id, data: { color: c } })}
                        className="h-5 w-5 rounded-full border-2 transition-all"
                        style={{ backgroundColor: c, borderColor: stage.color === c ? "#1e40af" : "transparent" }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TeamTab() {
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => api.get<User[]>("/api/users") });
  const { toast } = useToast();

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Team Members</h3>
          <p className="text-sm text-muted-foreground">{users.length} members in your workspace</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast({ title: "Invite sent" })}>Invite Member</Button>
      </div>
      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-sm">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <Badge variant="secondary" className="capitalize">{user.role?.replace("_", " ")}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NotificationsTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    newLead: true, dealUpdate: true, taskDue: true, weeklyReport: false, emailDigest: true,
  });
  const toggle = (k: keyof typeof settings) => setSettings((p) => ({ ...p, [k]: !p[k] }));

  const items = [
    { key: "newLead" as const, label: "New Lead Assigned", desc: "When a lead is assigned to you" },
    { key: "dealUpdate" as const, label: "Deal Stage Changes", desc: "When deals in your pipeline move stages" },
    { key: "taskDue" as const, label: "Task Due Reminders", desc: "One day before a task is due" },
    { key: "weeklyReport" as const, label: "Weekly Sales Report", desc: "Summary of your week every Monday" },
    { key: "emailDigest" as const, label: "Daily Email Digest", desc: "Daily overview of your activities" },
  ];

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h3 className="font-medium mb-1">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">Choose what you want to be notified about.</p>
      </div>
      <Card>
        <CardContent className="p-0 divide-y">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between px-4 py-3.5">
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
              <Switch checked={settings[item.key]} onCheckedChange={() => toggle(item.key)} />
            </div>
          ))}
        </CardContent>
      </Card>
      <Button className="gap-2" onClick={() => toast({ title: "Notification settings saved" })}><Save className="h-4 w-4" />Save Preferences</Button>
    </div>
  );
}

function CompanyTab() {
  const { toast } = useToast();
  return (
    <div className="space-y-5 max-w-lg">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Company Name</Label>
          <Input defaultValue="Sales Manager Pro Inc." />
        </div>
        <div className="space-y-1.5">
          <Label>Website</Label>
          <Input defaultValue="https://salesmanagerpro.com" />
        </div>
        <div className="space-y-1.5">
          <Label>Industry</Label>
          <Input defaultValue="Software & Technology" />
        </div>
        <div className="space-y-1.5">
          <Label>Company Size</Label>
          <Input defaultValue="10–50 employees" />
        </div>
        <div className="space-y-1.5">
          <Label>Currency</Label>
          <Input defaultValue="USD ($)" />
        </div>
        <div className="space-y-1.5">
          <Label>Fiscal Year Start</Label>
          <Input defaultValue="January" />
        </div>
      </div>
      <Button className="gap-2" onClick={() => toast({ title: "Company settings saved" })}><Save className="h-4 w-4" />Save Company Info</Button>
    </div>
  );
}

export default function Settings() {
  return (
    <div className="max-w-4xl">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-1.5"><UserIcon className="h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-1.5"><GitBranch className="h-4 w-4" />Pipeline</TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5"><Users className="h-4 w-4" />Team</TabsTrigger>
          <TabsTrigger value="company" className="gap-1.5"><Building2 className="h-4 w-4" />Company</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-4 w-4" />Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="pipeline"><PipelineTab /></TabsContent>
        <TabsContent value="team"><TeamTab /></TabsContent>
        <TabsContent value="company"><CompanyTab /></TabsContent>
        <TabsContent value="notifications"><NotificationsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
