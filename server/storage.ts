import type { User, Contact, Lead, Deal, PipelineStage, Task, Activity, Product, Sale, SaleItem } from "./types.js";

// ──────────────────────────────────────────────────────────
// Seed data
// ──────────────────────────────────────────────────────────

const users: User[] = [
  { id: 1, name: "Alex Johnson",  email: "alex@salesmanagerpro.com",  password: "demo123", role: "admin",     phone: "+1-555-0100" },
  { id: 2, name: "Sarah Chen",    email: "sarah@salesmanagerpro.com", password: "demo123", role: "manager",   phone: "+1-555-0101" },
  { id: 3, name: "Mike Davis",    email: "mike@salesmanagerpro.com",  password: "demo123", role: "sales_rep", phone: "+1-555-0102" },
  { id: 4, name: "Emma Wilson",   email: "emma@salesmanagerpro.com",  password: "demo123", role: "sales_rep", phone: "+1-555-0103" },
];

const pipelineStages: PipelineStage[] = [
  { id: 1, name: "Prospecting",  color: "#6366f1", order: 1, probability: 10  },
  { id: 2, name: "Qualification",color: "#8b5cf6", order: 2, probability: 25  },
  { id: 3, name: "Proposal",     color: "#3b82f6", order: 3, probability: 50  },
  { id: 4, name: "Negotiation",  color: "#f59e0b", order: 4, probability: 75  },
  { id: 5, name: "Closed Won",   color: "#10b981", order: 5, probability: 100 },
  { id: 6, name: "Closed Lost",  color: "#ef4444", order: 6, probability: 0   },
];

const contacts: Contact[] = [
  { id: 1, firstName: "David",    lastName: "Kim",       email: "david.kim@techcorp.com",         phone: "+1-555-0201", company: "TechCorp Inc",           position: "VP of Engineering",  status: "active",   source: "LinkedIn",     assignedTo: 3, createdAt: "2026-01-15T10:00:00Z", updatedAt: "2026-06-20T10:00:00Z" },
  { id: 2, firstName: "Lisa",     lastName: "Martinez",  email: "lisa@cloudbase.io",              phone: "+1-555-0202", company: "CloudBase",              position: "CTO",                status: "active",   source: "Referral",     assignedTo: 3, createdAt: "2026-02-01T10:00:00Z", updatedAt: "2026-06-21T10:00:00Z" },
  { id: 3, firstName: "James",    lastName: "Thompson",  email: "j.thompson@globalretail.com",    phone: "+1-555-0203", company: "Global Retail Co",       position: "Director of IT",     status: "prospect", source: "Cold Outreach", assignedTo: 4, createdAt: "2026-02-15T10:00:00Z", updatedAt: "2026-06-15T10:00:00Z" },
  { id: 4, firstName: "Priya",    lastName: "Patel",     email: "priya@financeplus.com",          phone: "+1-555-0204", company: "Finance Plus",           position: "CFO",                status: "active",   source: "Conference",   assignedTo: 4, createdAt: "2026-03-01T10:00:00Z", updatedAt: "2026-07-01T10:00:00Z" },
  { id: 5, firstName: "Robert",   lastName: "Anderson",  email: "r.anderson@mediagiant.com",      phone: "+1-555-0205", company: "Media Giant Corp",       position: "CEO",                status: "prospect", source: "Website",      assignedTo: 3, createdAt: "2026-03-20T10:00:00Z", updatedAt: "2026-06-25T10:00:00Z" },
  { id: 6, firstName: "Jennifer", lastName: "Lee",       email: "jennifer@startuphub.io",         phone: "+1-555-0206", company: "StartupHub",             position: "Founder",            status: "active",   source: "LinkedIn",     assignedTo: 4, createdAt: "2026-04-05T10:00:00Z", updatedAt: "2026-07-10T10:00:00Z" },
  { id: 7, firstName: "Carlos",   lastName: "Rodriguez", email: "carlos@manufactureplus.com",     phone: "+1-555-0207", company: "ManufacturePlus",        position: "COO",                status: "active",   source: "Trade Show",   assignedTo: 3, createdAt: "2026-04-15T10:00:00Z", updatedAt: "2026-07-05T10:00:00Z" },
  { id: 8, firstName: "Amanda",   lastName: "Foster",    email: "a.foster@healthtech.com",        phone: "+1-555-0208", company: "HealthTech Solutions",   position: "VP Product",         status: "prospect", source: "Referral",     assignedTo: 4, createdAt: "2026-05-01T10:00:00Z", updatedAt: "2026-07-15T10:00:00Z" },
];

const leads: Lead[] = [
  { id: 1, title: "TechCorp CRM Implementation",    contactId: 1, company: "TechCorp Inc",         email: "david.kim@techcorp.com",      phone: "+1-555-0201", source: "LinkedIn",     status: "qualified",   value: 45000,  notes: "Very interested in enterprise plan", assignedTo: 3, createdAt: "2026-06-01T10:00:00Z", updatedAt: "2026-07-15T10:00:00Z" },
  { id: 2, title: "CloudBase Expansion Deal",       contactId: 2, company: "CloudBase",             email: "lisa@cloudbase.io",           phone: "+1-555-0202", source: "Referral",     status: "contacted",   value: 28000,  assignedTo: 3, createdAt: "2026-06-10T10:00:00Z", updatedAt: "2026-07-20T10:00:00Z" },
  { id: 3, title: "Global Retail IT Upgrade",       contactId: 3, company: "Global Retail Co",      email: "j.thompson@globalretail.com", source: "Cold Outreach", status: "new",      value: 120000, assignedTo: 4, createdAt: "2026-06-20T10:00:00Z", updatedAt: "2026-07-22T10:00:00Z" },
  { id: 4, title: "Finance Plus Software License",  contactId: 4, company: "Finance Plus",          email: "priya@financeplus.com",       source: "Conference",   status: "converted",   value: 55000,  assignedTo: 4, createdAt: "2026-05-15T10:00:00Z", updatedAt: "2026-07-01T10:00:00Z" },
  { id: 5, title: "Media Giant Ad Platform",        contactId: 5, company: "Media Giant Corp",      email: "r.anderson@mediagiant.com",   source: "Website",      status: "qualified",   value: 85000,  notes: "Needs custom integration", assignedTo: 3, createdAt: "2026-07-01T10:00:00Z", updatedAt: "2026-07-25T10:00:00Z" },
  { id: 6, title: "StartupHub Team Plan",           contactId: 6, company: "StartupHub",            email: "jennifer@startuphub.io",      source: "LinkedIn",     status: "new",         value: 12000,  assignedTo: 4, createdAt: "2026-07-10T10:00:00Z", updatedAt: "2026-07-28T10:00:00Z" },
  { id: 7, title: "ManufacturePlus ERP Integration",contactId: 7, company: "ManufacturePlus",       email: "carlos@manufactureplus.com",  source: "Trade Show",   status: "contacted",   value: 95000,  assignedTo: 3, createdAt: "2026-07-15T10:00:00Z", updatedAt: "2026-07-30T10:00:00Z" },
  { id: 8, title: "HealthTech Analytics Module",    contactId: 8, company: "HealthTech Solutions",  email: "a.foster@healthtech.com",     source: "Referral",     status: "unqualified", value: 18000,  notes: "Budget constraints", assignedTo: 4, createdAt: "2026-07-18T10:00:00Z", updatedAt: "2026-07-31T10:00:00Z" },
];

const deals: Deal[] = [
  { id: 1, title: "TechCorp Enterprise Suite",     contactId: 1, company: "TechCorp Inc",         stage: "Negotiation",  value: 45000,  probability: 75,  expectedClose: "2026-08-15", assignedTo: 3, description: "Full enterprise suite with 3-year contract",   createdAt: "2026-06-15T10:00:00Z", updatedAt: "2026-07-28T10:00:00Z" },
  { id: 2, title: "Finance Plus Annual License",   contactId: 4, company: "Finance Plus",         stage: "Closed Won",   value: 55000,  probability: 100, expectedClose: "2026-07-01", assignedTo: 4, description: "Annual software license renewal plus upgrades", createdAt: "2026-05-20T10:00:00Z", updatedAt: "2026-07-01T10:00:00Z" },
  { id: 3, title: "Media Giant Ad Platform",       contactId: 5, company: "Media Giant Corp",     stage: "Proposal",     value: 85000,  probability: 50,  expectedClose: "2026-09-01", assignedTo: 3, description: "Custom ad management platform",                createdAt: "2026-07-01T10:00:00Z", updatedAt: "2026-07-25T10:00:00Z" },
  { id: 4, title: "StartupHub Growth Plan",        contactId: 6, company: "StartupHub",           stage: "Qualification",value: 12000,  probability: 25,  expectedClose: "2026-08-30", assignedTo: 4, createdAt: "2026-07-10T10:00:00Z", updatedAt: "2026-07-28T10:00:00Z" },
  { id: 5, title: "ManufacturePlus ERP Deal",      contactId: 7, company: "ManufacturePlus",      stage: "Prospecting",  value: 95000,  probability: 10,  expectedClose: "2026-10-15", assignedTo: 3, description: "Large-scale ERP integration project",         createdAt: "2026-07-15T10:00:00Z", updatedAt: "2026-07-30T10:00:00Z" },
  { id: 6, title: "CloudBase Infrastructure",      contactId: 2, company: "CloudBase",            stage: "Qualification",value: 32000,  probability: 25,  expectedClose: "2026-09-15", assignedTo: 3, createdAt: "2026-07-05T10:00:00Z", updatedAt: "2026-07-22T10:00:00Z" },
  { id: 7, title: "HealthTech Basic Package",      contactId: 8, company: "HealthTech Solutions", stage: "Closed Lost",  value: 18000,  probability: 0,   expectedClose: "2026-07-20", assignedTo: 4, description: "Lost due to budget constraints",              createdAt: "2026-07-08T10:00:00Z", updatedAt: "2026-07-20T10:00:00Z" },
];

const tasks: Task[] = [
  { id: 1, title: "Follow up on TechCorp proposal",  description: "Call David Kim to discuss contract terms",           dueDate: "2026-08-05", priority: "high",   status: "todo",        assignedTo: 3, relatedType: "deal",    relatedId: 1, createdAt: "2026-07-28T10:00:00Z" },
  { id: 2, title: "Prepare Media Giant demo",         description: "Customize ad platform demo for their use case",     dueDate: "2026-08-08", priority: "high",   status: "in_progress", assignedTo: 3, relatedType: "deal",    relatedId: 3, createdAt: "2026-07-25T10:00:00Z" },
  { id: 3, title: "Send contract to Finance Plus",    description: "Final contract with negotiated terms",              dueDate: "2026-08-02", priority: "medium", status: "done",        assignedTo: 4, relatedType: "deal",    relatedId: 2, createdAt: "2026-06-28T10:00:00Z" },
  { id: 4, title: "Initial call with ManufacturePlus",                                                                  dueDate: "2026-08-10", priority: "medium", status: "todo",        assignedTo: 3, relatedType: "lead",    relatedId: 7, createdAt: "2026-07-30T10:00:00Z" },
  { id: 5, title: "Qualify StartupHub requirements",  description: "Understand their team size and feature needs",     dueDate: "2026-08-07", priority: "low",    status: "todo",        assignedTo: 4, relatedType: "deal",    relatedId: 4, createdAt: "2026-07-29T10:00:00Z" },
  { id: 6, title: "Send product brochure to Global Retail",                                                             dueDate: "2026-08-04", priority: "medium", status: "todo",        assignedTo: 4, relatedType: "lead",    relatedId: 3, createdAt: "2026-08-01T10:00:00Z" },
  { id: 7, title: "Review CloudBase requirements doc",                                                                  dueDate: "2026-08-06", priority: "low",    status: "in_progress", assignedTo: 3, relatedType: "deal",    relatedId: 6, createdAt: "2026-07-31T10:00:00Z" },
];

const activities: Activity[] = [
  { id:  1, type: "deal_created",    description: "New deal created: TechCorp Enterprise Suite",               userId: 3, relatedType: "deal",    relatedId: 1, createdAt: "2026-06-15T10:00:00Z" },
  { id:  2, type: "call",            description: "Completed discovery call with David Kim at TechCorp",       userId: 3, relatedType: "contact", relatedId: 1, createdAt: "2026-07-20T14:30:00Z" },
  { id:  3, type: "deal_updated",    description: "Deal moved to Negotiation: TechCorp Enterprise Suite",      userId: 3, relatedType: "deal",    relatedId: 1, createdAt: "2026-07-28T09:00:00Z" },
  { id:  4, type: "deal_created",    description: "Deal closed: Finance Plus Annual License — $55,000",        userId: 4, relatedType: "deal",    relatedId: 2, createdAt: "2026-07-01T10:00:00Z" },
  { id:  5, type: "email",           description: "Sent proposal to Media Giant Corp",                          userId: 3, relatedType: "deal",    relatedId: 3, createdAt: "2026-07-25T11:00:00Z" },
  { id:  6, type: "lead_created",    description: "New lead: ManufacturePlus ERP Integration",                 userId: 3, relatedType: "lead",    relatedId: 7, createdAt: "2026-07-15T09:00:00Z" },
  { id:  7, type: "contact_created", description: "New contact added: Amanda Foster at HealthTech Solutions",  userId: 4, relatedType: "contact", relatedId: 8, createdAt: "2026-07-18T15:00:00Z" },
  { id:  8, type: "meeting",         description: "Product demo with StartupHub team (Jennifer Lee)",           userId: 4, relatedType: "deal",    relatedId: 4, createdAt: "2026-07-28T13:00:00Z" },
  { id:  9, type: "task_completed",  description: "Contract sent to Finance Plus",                              userId: 4, relatedType: "task",    relatedId: 3, createdAt: "2026-07-30T10:00:00Z" },
  { id: 10, type: "note",            description: "CloudBase interested in additional storage tier",            userId: 3, relatedType: "deal",    relatedId: 6, createdAt: "2026-07-31T16:00:00Z" },
];

const products: Product[] = [
  { id: 1, name: "Enterprise CRM License",     sku: "CRM-ENT-001",  category: "Software",     description: "Full-featured CRM for enterprise teams",           price: 4500,  cost: 500,  stock: undefined, unit: "license",  active: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: 2, name: "Professional CRM License",   sku: "CRM-PRO-001",  category: "Software",     description: "CRM for growing sales teams",                      price: 1800,  cost: 200,  stock: undefined, unit: "license",  active: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: 3, name: "Starter CRM License",        sku: "CRM-STR-001",  category: "Software",     description: "Entry-level CRM for small teams",                  price: 600,   cost: 80,   stock: undefined, unit: "license",  active: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: 4, name: "Implementation Service",     sku: "SVC-IMPL-001", category: "Service",      description: "Onboarding and system setup service",               price: 2500,  cost: 800,  stock: 20,        unit: "project",  active: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: 5, name: "Training Package (5 seats)", sku: "SVC-TRN-005",  category: "Consulting",   description: "5-seat virtual training package",                  price: 1200,  cost: 300,  stock: 50,        unit: "package",  active: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: 6, name: "Annual Support Plan",        sku: "SUP-ANN-001",  category: "Subscription", description: "Priority email & phone support for 12 months",     price: 1500,  cost: 200,  stock: undefined, unit: "year",     active: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: 7, name: "Data Migration Service",     sku: "SVC-MIG-001",  category: "Service",      description: "Migrate data from legacy CRM",                     price: 3000,  cost: 1000, stock: 15,        unit: "project",  active: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: 8, name: "API Add-on",                 sku: "ADD-API-001",  category: "Software",     description: "REST API access for custom integrations",           price: 800,   cost: 100,  stock: undefined, unit: "license",  active: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: 9, name: "Server Hardware Bundle",     sku: "HW-SRV-001",   category: "Hardware",     description: "Dedicated server for on-premise deployment",        price: 8500,  cost: 5000, stock: 7,         unit: "unit",     active: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: 10, name: "Monthly SaaS Subscription", sku: "SAAS-MO-001",  category: "Subscription", description: "Per-seat monthly subscription",                    price: 49,    cost: 5,    stock: undefined, unit: "seat",     active: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
];

const sales: Sale[] = [
  {
    id: 1, contactId: 4, assignedTo: 4, status: "delivered", date: "2026-07-01",
    items: [
      { productId: 1, productName: "Enterprise CRM License", quantity: 1, unitPrice: 4500 },
      { productId: 4, productName: "Implementation Service",  quantity: 1, unitPrice: 2500 },
      { productId: 6, productName: "Annual Support Plan",     quantity: 1, unitPrice: 1500 },
    ],
    total: 8500, notes: "Finance Plus initial deployment package", createdAt: "2026-07-01T10:00:00Z",
  },
  {
    id: 2, contactId: 1, assignedTo: 3, status: "confirmed", date: "2026-07-15",
    items: [
      { productId: 5, productName: "Training Package (5 seats)", quantity: 2, unitPrice: 1200 },
      { productId: 8, productName: "API Add-on",                 quantity: 1, unitPrice: 800 },
    ],
    total: 3200, createdAt: "2026-07-15T10:00:00Z",
  },
  {
    id: 3, contactId: 7, assignedTo: 3, status: "pending", date: "2026-07-28",
    items: [
      { productId: 2, productName: "Professional CRM License", quantity: 3, unitPrice: 1800 },
      { productId: 7, productName: "Data Migration Service",   quantity: 1, unitPrice: 3000 },
    ],
    total: 8400, notes: "ManufacturePlus pilot deployment", createdAt: "2026-07-28T10:00:00Z",
  },
  {
    id: 4, contactId: 6, assignedTo: 4, status: "confirmed", date: "2026-07-30",
    items: [
      { productId: 3, productName: "Starter CRM License", quantity: 1, unitPrice: 600 },
    ],
    total: 600, createdAt: "2026-07-30T10:00:00Z",
  },
];

// ──────────────────────────────────────────────────────────
// Branding settings
// ──────────────────────────────────────────────────────────
let branding = {
  shopName: "Sales Manager Pro",
  shopTagline: "Pro Edition",
  logoUrl: "", // base64 data URL or empty string
};

// ──────────────────────────────────────────────────────────
// Counters for auto-increment IDs
// ──────────────────────────────────────────────────────────
const nextId = { contacts: 9, leads: 9, deals: 8, tasks: 8, activities: 11, products: 11, sales: 5 };

// ──────────────────────────────────────────────────────────
// DB helpers
// ──────────────────────────────────────────────────────────
export const db = {
  // Users
  getUsers: () => users.map(({ password: _, ...u }) => u),
  getUserById:    (id: number) => users.find((u) => u.id === id),
  getUserByEmail: (email: string) => users.find((u) => u.email === email),

  // Pipeline stages
  getPipelineStages: () => [...pipelineStages].sort((a, b) => a.order - b.order),
  upsertPipelineStage: (stage: Partial<PipelineStage> & { id?: number }) => {
    if (stage.id) {
      const idx = pipelineStages.findIndex((s) => s.id === stage.id);
      if (idx >= 0) { pipelineStages[idx] = { ...pipelineStages[idx], ...stage } as PipelineStage; return pipelineStages[idx]; }
    }
    const n = { ...stage, id: pipelineStages.length + 1 } as PipelineStage;
    pipelineStages.push(n); return n;
  },

  // Contacts
  getContacts:    () => [...contacts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  getContactById: (id: number) => contacts.find((c) => c.id === id),
  createContact:  (data: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const c: Contact = { ...data, id: nextId.contacts++, createdAt: now, updatedAt: now };
    contacts.push(c);
    activities.push({ id: nextId.activities++, type: "contact_created", description: `New contact: ${data.firstName} ${data.lastName}${data.company ? ` at ${data.company}` : ""}`, relatedType: "contact", relatedId: c.id, createdAt: now });
    return c;
  },
  updateContact:  (id: number, data: Partial<Contact>) => {
    const idx = contacts.findIndex((c) => c.id === id);
    if (idx < 0) return null;
    contacts[idx] = { ...contacts[idx], ...data, updatedAt: new Date().toISOString() }; return contacts[idx];
  },
  deleteContact:  (id: number) => { const idx = contacts.findIndex((c) => c.id === id); if (idx < 0) return false; contacts.splice(idx, 1); return true; },

  // Leads
  getLeads:    () => [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  getLeadById: (id: number) => leads.find((l) => l.id === id),
  createLead:  (data: Omit<Lead, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const l: Lead = { ...data, id: nextId.leads++, createdAt: now, updatedAt: now };
    leads.push(l);
    activities.push({ id: nextId.activities++, type: "lead_created", description: `New lead: ${data.title}`, relatedType: "lead", relatedId: l.id, createdAt: now });
    return l;
  },
  updateLead:  (id: number, data: Partial<Lead>) => {
    const idx = leads.findIndex((l) => l.id === id);
    if (idx < 0) return null;
    leads[idx] = { ...leads[idx], ...data, updatedAt: new Date().toISOString() }; return leads[idx];
  },
  deleteLead:  (id: number) => { const idx = leads.findIndex((l) => l.id === id); if (idx < 0) return false; leads.splice(idx, 1); return true; },

  // Deals
  getDeals:    () => [...deals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  getDealById: (id: number) => deals.find((d) => d.id === id),
  createDeal:  (data: Omit<Deal, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const d: Deal = { ...data, id: nextId.deals++, createdAt: now, updatedAt: now };
    deals.push(d);
    activities.push({ id: nextId.activities++, type: "deal_created", description: `New deal created: ${data.title}`, relatedType: "deal", relatedId: d.id, createdAt: now });
    return d;
  },
  updateDeal:  (id: number, data: Partial<Deal>) => {
    const idx = deals.findIndex((d) => d.id === id);
    if (idx < 0) return null;
    const old = deals[idx];
    deals[idx] = { ...old, ...data, updatedAt: new Date().toISOString() };
    if (data.stage && data.stage !== old.stage) {
      activities.push({ id: nextId.activities++, type: "deal_updated", description: `Deal moved to ${data.stage}: ${old.title}`, relatedType: "deal", relatedId: id, createdAt: new Date().toISOString() });
    }
    return deals[idx];
  },
  deleteDeal:  (id: number) => { const idx = deals.findIndex((d) => d.id === id); if (idx < 0) return false; deals.splice(idx, 1); return true; },

  // Tasks
  getTasks:    () => [...tasks].sort((a, b) => new Date(a.dueDate || "9999").getTime() - new Date(b.dueDate || "9999").getTime()),
  getTaskById: (id: number) => tasks.find((t) => t.id === id),
  createTask:  (data: Omit<Task, "id" | "createdAt">) => {
    const t: Task = { ...data, id: nextId.tasks++, createdAt: new Date().toISOString() };
    tasks.push(t); return t;
  },
  updateTask:  (id: number, data: Partial<Task>) => {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx < 0) return null;
    const old = tasks[idx];
    tasks[idx] = { ...old, ...data };
    if (data.status === "done" && old.status !== "done") {
      activities.push({ id: nextId.activities++, type: "task_completed", description: `Task completed: ${old.title}`, relatedType: "task", relatedId: id, createdAt: new Date().toISOString() });
    }
    return tasks[idx];
  },
  deleteTask:  (id: number) => { const idx = tasks.findIndex((t) => t.id === id); if (idx < 0) return false; tasks.splice(idx, 1); return true; },

  // Activities
  getActivities: (limit = 20) =>
    [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit),

  // Products
  getProducts:    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
  getProductById: (id: number) => products.find((p) => p.id === id),
  createProduct:  (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const p: Product = { ...data, id: nextId.products++, createdAt: now, updatedAt: now };
    products.push(p); return p;
  },
  updateProduct:  (id: number, data: Partial<Product>) => {
    const idx = products.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() }; return products[idx];
  },
  deleteProduct:  (id: number) => { const idx = products.findIndex((p) => p.id === id); if (idx < 0) return false; products.splice(idx, 1); return true; },

  // Sales
  getSales:    () => [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  getSaleById: (id: number) => sales.find((s) => s.id === id),
  createSale:  (data: Omit<Sale, "id" | "createdAt">) => {
    const now = new Date().toISOString();
    const s: Sale = { ...data, id: nextId.sales++, createdAt: now };
    sales.push(s);
    activities.push({ id: nextId.activities++, type: "deal_created", description: `အရောင်းမှတ်တမ်းတင်ပြီး — ${data.total ? `${data.total.toLocaleString()} MMK` : ""}`, relatedType: "sale", relatedId: s.id, createdAt: now });
    return s;
  },
  updateSale:  (id: number, data: Partial<Sale>) => {
    const idx = sales.findIndex((s) => s.id === id);
    if (idx < 0) return null;
    sales[idx] = { ...sales[idx], ...data }; return sales[idx];
  },
  deleteSale:  (id: number) => { const idx = sales.findIndex((s) => s.id === id); if (idx < 0) return false; sales.splice(idx, 1); return true; },

  // Branding
  getBranding: () => ({ ...branding }),
  updateBranding: (data: Partial<typeof branding>) => {
    branding = { ...branding, ...data };
    return { ...branding };
  },

  // Dashboard
  getDashboardStats: () => {
    const closedWon = deals.filter((d) => d.stage === "Closed Won");
    const active    = deals.filter((d) => !["Closed Won", "Closed Lost"].includes(d.stage));
    const totalRevenue = closedWon.reduce((s, d) => s + d.value, 0);
    const pipelineValue = active.reduce((s, d) => s + d.value * (d.probability / 100), 0);
    const recent30 = leads.filter((l) => (Date.now() - new Date(l.createdAt).getTime()) / 864e5 <= 30);
    const converted = leads.filter((l) => l.status === "converted");
    const convRate  = leads.length > 0 ? Math.round((converted.length / leads.length) * 100) : 0;
    return { totalRevenue, revenueGrowth: 18.5, activeDeals: active.length, dealsGrowth: 12.3, newLeads: recent30.length, leadsGrowth: 7.8, conversionRate: convRate, conversionGrowth: 3.2, pipelineValue: Math.round(pipelineValue) };
  },

  getRevenueData: () => {
    const seed = [38, 45, 41, 55, 50, 62, 68, 59, 72, 65, 78, 85];
    return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((month, i) => ({
      month, revenue: seed[i] * 1000, target: (50 + i * 2) * 1000,
    }));
  },

  getPipelineFunnel: () =>
    pipelineStages
      .filter((s) => !["Closed Won", "Closed Lost"].includes(s.name))
      .map((stage) => {
        const sd = deals.filter((d) => d.stage === stage.name);
        return { stage: stage.name, value: sd.reduce((s, d) => s + d.value, 0), count: sd.length };
      }),
};
