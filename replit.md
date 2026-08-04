# Sales Manager Pro

A full-stack CRM and sales management application built with React, Express, and TypeScript.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui (Radix UI)
- **Backend**: Express.js + TypeScript (tsx)
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## Project Structure

```
/
├── src/                   # React frontend
│   ├── components/        # Shared UI components + shadcn primitives
│   ├── contexts/          # Auth context
│   ├── hooks/             # Custom hooks (use-toast)
│   ├── lib/               # Utilities, API client, query client
│   ├── pages/             # Route-level page components
│   └── types.ts           # Shared TypeScript types
├── server/                # Express backend
│   ├── index.ts           # Server entry point (port 3001)
│   ├── routes.ts          # All API route handlers
│   ├── storage.ts         # In-memory data store with sample data
│   └── types.ts           # Server-side types
├── index.html             # Vite HTML entry
└── vite.config.ts         # Vite config (proxies /api → port 3001)
```

## Running the App

```bash
npm run dev
```

This starts both the Vite dev server (port 5000) and the Express API server (port 3001) concurrently.

## Features

- **Dashboard** — KPI cards, revenue charts, pipeline funnel, activity feed
- **Leads** — Lead management with status tracking and filtering
- **Contacts** — Contact database with card view
- **Pipeline (Deals)** — Kanban board + list view with stage management
- **Customers** — Derived from Closed Won deals
- **Products** — Product catalog with inventory tracking, margins
- **Sales Orders** — Record sales with line items, totals, status tracking
- **Tasks** — Task management with priorities, due dates, and related records
- **Reports** — Revenue, pipeline, lead, and team performance analytics
- **Settings** — Profile, pipeline stages, team, company, notifications
- **Branding** — Admin can set shop name, tagline, and logo; syncs globally across sidebar and all views in real-time (`GET/PUT /api/branding`)

## PWA Support

- `public/manifest.json` — Web app manifest for install prompts on mobile & desktop
- `public/sw.js` — Service worker (cache-first for assets, network-first for API)
- `public/icon-192.svg` / `public/icon-512.svg` — App icons
- Service worker registered in `index.html` on page load

## Currency & Locale

- All currency values use `formatCurrency()` from `src/lib/utils.ts` → outputs `150,000 MMK`
- All UI text is in Burmese POS terminology

## Demo Login

- Email: `alex@salesmanagerpro.com`
- Password: `demo123`

Other demo accounts: sarah, mike, emma @salesmanagerpro.com (same password)

## User Preferences

- Keep the existing project structure (src/ for frontend, server/ for backend)
- Use in-memory storage for data (no external DB required)
- Port 5000 for frontend (Vite), port 3001 for Express API
