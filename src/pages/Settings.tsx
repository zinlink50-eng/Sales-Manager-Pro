import { useState, useRef } from "react";
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
import { useBranding, type Branding } from "@/contexts/BrandingContext";
import { Save, User as UserIcon, GitBranch, Users, Building2, Bell, Store, Upload, X } from "lucide-react";
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
          <Label>အမည်အပြည့်အစုံ</Label>
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>အီးမေးလ်လိပ်စာ</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>ဖုန်းနံပါတ်</Label>
          <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        </div>
      </div>
      <Button className="gap-2" onClick={() => toast({ title: "ကိုယ်ရေးအချက်အလက်သိမ်းပြီး" })}><Save className="h-4 w-4" />ကိုယ်ရေးအချက်အလက်သိမ်းမည်</Button>

      <Separator />
      <div className="space-y-3">
        <h3 className="font-medium">စကားဝှက်ပြောင်းမည်</h3>
        <div className="space-y-1.5">
          <Label>လက်ရှိစကားဝှက်</Label>
          <Input type="password" placeholder="••••••••" />
        </div>
        <div className="space-y-1.5">
          <Label>စကားဝှက်အသစ်</Label>
          <Input type="password" placeholder="••••••••" />
        </div>
        <div className="space-y-1.5">
          <Label>စကားဝှက်အသစ် အတည်ပြုမည်</Label>
          <Input type="password" placeholder="••••••••" />
        </div>
        <Button variant="outline" onClick={() => toast({ title: "စကားဝှက်ပြောင်းပြီး" })}>စကားဝှက်ပြောင်းမည်</Button>
      </div>
    </div>
  );
}

function BrandingTab() {
  const { branding, updateBranding } = useBranding();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Pick<Branding, "shopName" | "shopTagline" | "logoUrl">>({
    shopName: branding.shopName,
    shopTagline: branding.shopTagline,
    logoUrl: branding.logoUrl,
  });
  const [saving, setSaving] = useState(false);

  // Keep form in sync when branding loads
  const [synced, setSynced] = useState(false);
  if (!synced && (branding.shopName !== "Sales Manager Pro" || branding.logoUrl)) {
    setForm({ shopName: branding.shopName, shopTagline: branding.shopTagline, logoUrl: branding.logoUrl });
    setSynced(true);
  }

  const shopInitials = form.shopName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SM";

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast({ title: "လိုဂိုဖိုင်သည် 1MB ထက် မကျော်ရ", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setForm((p) => ({ ...p, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBranding(form);
      toast({ title: "ဆိုင်အချက်အလက်သိမ်းပြီး" });
    } catch {
      toast({ title: "သိမ်းမသိမ်းနိုင်ပါ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h3 className="font-medium mb-1">ဆိုင်အမည်နှင့် လိုဂို</h3>
        <p className="text-sm text-muted-foreground">ဆိုင်အမည်နှင့် လိုဂိုကို ပြောင်းလဲပါက sidebar နှင့် အတူ app တစ်ခုလုံးတွင် ချက်ချင်းဖေါ်ပြမည်။</p>
      </div>

      {/* Live preview */}
      <Card className="bg-sidebar border-sidebar-border">
        <CardContent className="p-4">
          <p className="text-xs text-sidebar-foreground/40 mb-3 uppercase tracking-wider font-semibold">အသွင်အပြင် ကြိုတင်ကြည့်ရှုချက်</p>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-white font-bold text-sm overflow-hidden">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt={form.shopName} className="h-10 w-10 object-cover" />
              ) : (
                shopInitials
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">{form.shopName || "ဆိုင်အမည်"}</div>
              <div className="text-xs text-sidebar-foreground/60">{form.shopTagline || "ကြော်ငြာစာသား"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Logo upload */}
      <div className="space-y-3">
        <Label>ဆိုင်လိုဂို</Label>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
            {form.logoUrl ? (
              <img src={form.logoUrl} alt="logo" className="h-16 w-16 object-cover rounded-lg" />
            ) : (
              <Store className="h-6 w-6 text-gray-300" />
            )}
          </div>
          <div className="space-y-1.5">
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              ပုံတင်မည်
            </Button>
            {form.logoUrl && (
              <Button type="button" variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={() => setForm((p) => ({ ...p, logoUrl: "" }))}>
                <X className="h-4 w-4" />
                ဖယ်ရှားမည်
              </Button>
            )}
            <p className="text-xs text-muted-foreground">PNG, JPG, SVG — အများဆုံး 1MB</p>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
      </div>

      {/* Shop name */}
      <div className="space-y-1.5">
        <Label>ဆိုင်အမည်</Label>
        <Input
          value={form.shopName}
          onChange={(e) => setForm((p) => ({ ...p, shopName: e.target.value }))}
          placeholder="ဥပမာ — မင်းကျော်ဆိုင်"
        />
      </div>

      {/* Tagline */}
      <div className="space-y-1.5">
        <Label>ကြော်ငြာစာသား <span className="text-muted-foreground">(ရွေးချယ်နိုင်)</span></Label>
        <Input
          value={form.shopTagline}
          onChange={(e) => setForm((p) => ({ ...p, shopTagline: e.target.value }))}
          placeholder="ဥပမာ — အကောင်းဆုံးဝန်ဆောင်မှု"
        />
      </div>

      <Button className="gap-2" onClick={handleSave} disabled={saving}>
        <Save className="h-4 w-4" />
        {saving ? "သိမ်းနေသည်…" : "ဆိုင်အချက်အလက်သိမ်းမည်"}
      </Button>
    </div>
  );
}

function PipelineTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: stages = [] } = useQuery({ queryKey: ["pipeline-stages"], queryFn: () => api.get<PipelineStage[]>("/api/pipeline-stages") });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/api/pipeline-stages/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pipeline-stages"] }); toast({ title: "ဆင့်ပြင်ဆင်ပြီး" }); },
  });

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h3 className="font-medium mb-1">ဈေးကွက်ဆင့်များ</h3>
        <p className="text-sm text-muted-foreground">သင်၏ အရောင်းဆင့်များကို စိတ်ကြိုက်ပြင်ဆင်ပါ။ ပြောင်းလဲမှုများ ချက်ချင်းအကျိုးသက်ရောက်မည်။</p>
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
                    <div className="text-xs text-gray-400">အစဉ်: {stage.order}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500">ဖြစ်နိုင်ချေ</Label>
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
          <h3 className="font-medium">အဖွဲ့ဝင်များ</h3>
          <p className="text-sm text-muted-foreground">သင်၏ workspace တွင် {users.length} ဦး ရှိသည်</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast({ title: "ဖိတ်ကြားချက်ပို့ပြီး" })}>အဖွဲ့ဝင်ဖိတ်မည်</Button>
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
    { key: "newLead" as const, label: "လိဒ်အသစ်တာဝန်ပေးခြင်း", desc: "လိဒ်တစ်ခုကို သင့်ထံ တာဝန်ပေးသောအခါ" },
    { key: "dealUpdate" as const, label: "ဈေးကွက်ဆင့်ပြောင်းမှု", desc: "သင်၏ ဈေးကွက်စီမံတွင် ဈေးကွက်ဆင့်ပြောင်းသောအခါ" },
    { key: "taskDue" as const, label: "လုပ်ဆောင်ချက်အချိန်သတိပေးချက်", desc: "လုပ်ဆောင်ချက်သတ်မှတ်ရက် တစ်ရက်မတိုင်ခင်" },
    { key: "weeklyReport" as const, label: "အပတ်စဉ်အရောင်းအစီရင်ခံစာ", desc: "တနင်္လာနေ့တိုင်း သင်၏ပတ်အနှစ်ချုပ်" },
    { key: "emailDigest" as const, label: "နေ့စဉ်အီးမေးလ်အကျဉ်းချုပ်", desc: "နေ့စဉ် သင်၏ လှုပ်ရှားမှုများ ခြုံငုံသုံးသပ်ချက်" },
  ];

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h3 className="font-medium mb-1">အကြောင်းကြားချက်ဆက်တင်</h3>
        <p className="text-sm text-muted-foreground">မည်သည့်အကြောင်းကြားချက် လိုချင်သည်ကို ရွေးချယ်ပါ။</p>
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
      <Button className="gap-2" onClick={() => toast({ title: "အကြောင်းကြားချက်ဆက်တင်သိမ်းပြီး" })}><Save className="h-4 w-4" />ဆက်တင်သိမ်းမည်</Button>
    </div>
  );
}

function CompanyTab() {
  const { toast } = useToast();
  return (
    <div className="space-y-5 max-w-lg">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>ကုမ္ပဏီအမည်</Label>
          <Input defaultValue="Sales Manager Pro Inc." />
        </div>
        <div className="space-y-1.5">
          <Label>ဝဘ်ဆိုက်</Label>
          <Input defaultValue="https://salesmanagerpro.com" />
        </div>
        <div className="space-y-1.5">
          <Label>လုပ်ငန်းနယ်ပယ်</Label>
          <Input defaultValue="Software & Technology" />
        </div>
        <div className="space-y-1.5">
          <Label>ကုမ္ပဏီအရွယ်အစား</Label>
          <Input defaultValue="၁၀–၅၀ ဝန်ထမ်း" />
        </div>
        <div className="space-y-1.5">
          <Label>ငွေကြေး</Label>
          <Input defaultValue="MMK (ကျပ်)" />
        </div>
        <div className="space-y-1.5">
          <Label>ဘဏ္ဍာရေးနှစ်စတင်</Label>
          <Input defaultValue="ဇန်နဝါရီ" />
        </div>
      </div>
      <Button className="gap-2" onClick={() => toast({ title: "ကုမ္ပဏီအချက်အလက်သိမ်းပြီး" })}><Save className="h-4 w-4" />ကုမ္ပဏီအချက်အလက်သိမ်းမည်</Button>
    </div>
  );
}

export default function Settings() {
  return (
    <div className="max-w-4xl">
      <Tabs defaultValue="branding">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="branding" className="gap-1.5"><Store className="h-4 w-4" />ဆိုင်ပုံစံ</TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5"><UserIcon className="h-4 w-4" />ကိုယ်ရေး</TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-1.5"><GitBranch className="h-4 w-4" />ဈေးကွက်ဆင့်</TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5"><Users className="h-4 w-4" />အဖွဲ့</TabsTrigger>
          <TabsTrigger value="company" className="gap-1.5"><Building2 className="h-4 w-4" />ကုမ္ပဏီ</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-4 w-4" />အကြောင်းကြားချက်</TabsTrigger>
        </TabsList>
        <TabsContent value="branding"><BrandingTab /></TabsContent>
        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="pipeline"><PipelineTab /></TabsContent>
        <TabsContent value="team"><TeamTab /></TabsContent>
        <TabsContent value="company"><CompanyTab /></TabsContent>
        <TabsContent value="notifications"><NotificationsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
