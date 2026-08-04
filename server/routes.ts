import { Router, type Request, type Response } from "express";
import { db } from "./storage.js";

const r = Router();

// ── Auth ──────────────────────────────────────────────────
r.post("/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = db.getUserByEmail(email);
  if (!user || user.password !== password)
    return res.status(401).json({ message: "Invalid email or password" });
  (req.session as any).userId = user.id;
  const { password: _, ...safe } = user;
  return res.json({ user: safe });
});

r.post("/auth/logout", (req: Request, res: Response) => {
  req.session.destroy(() => res.json({ success: true }));
});

r.get("/auth/me", (req: Request, res: Response) => {
  const userId = (req.session as any).userId;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  const user = db.getUserById(userId);
  if (!user) return res.status(401).json({ message: "User not found" });
  const { password: _, ...safe } = user;
  return res.json({ user: safe });
});

// ── Users ─────────────────────────────────────────────────
r.get("/users", (_req, res) => res.json(db.getUsers()));

// ── Branding ──────────────────────────────────────────────
r.get("/branding", (_, res) => res.json(db.getBranding()));
r.put("/branding", (req, res) => res.json(db.updateBranding(req.body)));

// ── Dashboard ─────────────────────────────────────────────
r.get("/dashboard/stats",          (_, res) => res.json(db.getDashboardStats()));
r.get("/dashboard/revenue",        (_, res) => res.json(db.getRevenueData()));
r.get("/dashboard/pipeline-funnel",(_, res) => res.json(db.getPipelineFunnel()));
r.get("/dashboard/activities",     (_, res) => {
  const raw      = db.getActivities(15);
  const users    = db.getUsers();
  const contacts = db.getContacts();
  const deals    = db.getDeals();
  const leads    = db.getLeads();
  const enriched = raw.map((a) => {
    const user = a.userId ? users.find((u) => u.id === a.userId) : null;
    let relatedName: string | undefined;
    if (a.relatedType === "contact" && a.relatedId) { const c = contacts.find((c) => c.id === a.relatedId); if (c) relatedName = `${c.firstName} ${c.lastName}`; }
    else if (a.relatedType === "deal" && a.relatedId) { const d = deals.find((d) => d.id === a.relatedId); if (d) relatedName = d.title; }
    else if (a.relatedType === "lead" && a.relatedId) { const l = leads.find((l) => l.id === a.relatedId); if (l) relatedName = l.title; }
    return { ...a, userName: user?.name, relatedName };
  });
  res.json(enriched);
});

// ── Pipeline Stages ───────────────────────────────────────
r.get("/pipeline-stages",     (_, res) => res.json(db.getPipelineStages()));
r.put("/pipeline-stages/:id", (req, res) => res.json(db.upsertPipelineStage({ ...req.body, id: +req.params.id })));

// ── Contacts ──────────────────────────────────────────────
r.get("/contacts", (_, res) => {
  const users = db.getUsers();
  res.json(db.getContacts().map((c) => ({ ...c, assignedToName: c.assignedTo ? users.find((u) => u.id === c.assignedTo)?.name : undefined })));
});
r.get("/contacts/:id", (req, res) => {
  const c = db.getContactById(+req.params.id);
  return c ? res.json(c) : res.status(404).json({ message: "Not found" });
});
r.post("/contacts",     (req, res) => res.status(201).json(db.createContact(req.body)));
r.put("/contacts/:id",  (req, res) => {
  const c = db.updateContact(+req.params.id, req.body);
  return c ? res.json(c) : res.status(404).json({ message: "Not found" });
});
r.delete("/contacts/:id", (req, res) => {
  return db.deleteContact(+req.params.id) ? res.json({ success: true }) : res.status(404).json({ message: "Not found" });
});

// ── Leads ─────────────────────────────────────────────────
r.get("/leads", (_, res) => {
  const users    = db.getUsers();
  const contacts = db.getContacts();
  res.json(db.getLeads().map((l) => ({
    ...l,
    assignedToName: l.assignedTo  ? users.find((u) => u.id === l.assignedTo)?.name : undefined,
    contactName:    l.contactId   ? (() => { const c = contacts.find((c) => c.id === l.contactId); return c ? `${c.firstName} ${c.lastName}` : undefined; })() : undefined,
  })));
});
r.get("/leads/:id", (req, res) => {
  const l = db.getLeadById(+req.params.id);
  return l ? res.json(l) : res.status(404).json({ message: "Not found" });
});
r.post("/leads",     (req, res) => res.status(201).json(db.createLead(req.body)));
r.put("/leads/:id",  (req, res) => {
  const l = db.updateLead(+req.params.id, req.body);
  return l ? res.json(l) : res.status(404).json({ message: "Not found" });
});
r.delete("/leads/:id", (req, res) =>
  db.deleteLead(+req.params.id) ? res.json({ success: true }) : res.status(404).json({ message: "Not found" })
);

// ── Deals ─────────────────────────────────────────────────
r.get("/deals", (_, res) => {
  const users    = db.getUsers();
  const contacts = db.getContacts();
  res.json(db.getDeals().map((d) => ({
    ...d,
    assignedToName: d.assignedTo ? users.find((u) => u.id === d.assignedTo)?.name : undefined,
    contactName:    d.contactId  ? (() => { const c = contacts.find((c) => c.id === d.contactId); return c ? `${c.firstName} ${c.lastName}` : undefined; })() : undefined,
  })));
});
r.get("/deals/:id", (req, res) => {
  const d = db.getDealById(+req.params.id);
  return d ? res.json(d) : res.status(404).json({ message: "Not found" });
});
r.post("/deals",     (req, res) => res.status(201).json(db.createDeal(req.body)));
r.put("/deals/:id",  (req, res) => {
  const d = db.updateDeal(+req.params.id, req.body);
  return d ? res.json(d) : res.status(404).json({ message: "Not found" });
});
r.delete("/deals/:id", (req, res) =>
  db.deleteDeal(+req.params.id) ? res.json({ success: true }) : res.status(404).json({ message: "Not found" })
);

// ── Tasks ─────────────────────────────────────────────────
r.get("/tasks", (_, res) => {
  const users    = db.getUsers();
  const deals    = db.getDeals();
  const contacts = db.getContacts();
  const leads    = db.getLeads();
  res.json(db.getTasks().map((t) => {
    let relatedName: string | undefined;
    if      (t.relatedType === "deal"    && t.relatedId) relatedName = deals.find((d) => d.id === t.relatedId)?.title;
    else if (t.relatedType === "contact" && t.relatedId) { const c = contacts.find((c) => c.id === t.relatedId); if (c) relatedName = `${c.firstName} ${c.lastName}`; }
    else if (t.relatedType === "lead"    && t.relatedId) relatedName = leads.find((l) => l.id === t.relatedId)?.title;
    return { ...t, assignedToName: t.assignedTo ? users.find((u) => u.id === t.assignedTo)?.name : undefined, relatedName };
  }));
});
r.post("/tasks",     (req, res) => res.status(201).json(db.createTask(req.body)));
r.put("/tasks/:id",  (req, res) => {
  const t = db.updateTask(+req.params.id, req.body);
  return t ? res.json(t) : res.status(404).json({ message: "Not found" });
});
r.delete("/tasks/:id", (req, res) =>
  db.deleteTask(+req.params.id) ? res.json({ success: true }) : res.status(404).json({ message: "Not found" })
);

// ── Products ──────────────────────────────────────────────
r.get("/products", (_, res) => res.json(db.getProducts()));
r.get("/products/:id", (req, res) => {
  const p = db.getProductById(+req.params.id);
  return p ? res.json(p) : res.status(404).json({ message: "Not found" });
});
r.post("/products",     (req, res) => res.status(201).json(db.createProduct(req.body)));
r.put("/products/:id",  (req, res) => {
  const p = db.updateProduct(+req.params.id, req.body);
  return p ? res.json(p) : res.status(404).json({ message: "Not found" });
});
r.delete("/products/:id", (req, res) =>
  db.deleteProduct(+req.params.id) ? res.json({ success: true }) : res.status(404).json({ message: "Not found" })
);

// ── Sales ─────────────────────────────────────────────────
r.get("/sales", (_, res) => {
  const users    = db.getUsers();
  const contacts = db.getContacts();
  res.json(db.getSales().map((s) => ({
    ...s,
    contactName:    s.contactId  ? (() => { const c = contacts.find((c) => c.id === s.contactId); return c ? `${c.firstName} ${c.lastName}` : undefined; })() : undefined,
    assignedToName: s.assignedTo ? users.find((u) => u.id === s.assignedTo)?.name : undefined,
  })));
});
r.get("/sales/:id", (req, res) => {
  const s = db.getSaleById(+req.params.id);
  if (!s) return res.status(404).json({ message: "Not found" });
  const users    = db.getUsers();
  const contacts = db.getContacts();
  const c = s.contactId ? contacts.find((c) => c.id === s.contactId) : null;
  return res.json({ ...s, contactName: c ? `${c.firstName} ${c.lastName}` : undefined, assignedToName: s.assignedTo ? users.find((u) => u.id === s.assignedTo)?.name : undefined });
});
r.post("/sales", (req, res) => res.status(201).json(db.createSale(req.body)));
r.put("/sales/:id", (req, res) => {
  const s = db.updateSale(+req.params.id, req.body);
  return s ? res.json(s) : res.status(404).json({ message: "Not found" });
});
r.delete("/sales/:id", (req, res) =>
  db.deleteSale(+req.params.id) ? res.json({ success: true }) : res.status(404).json({ message: "Not found" })
);

export default r;
