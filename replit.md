# Sales Manager Pro

A full-stack CRM and sales management application built with React, Express, and TypeScript.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui (Radix UI)
- **Backend**: Express.js + TypeScript (tsx)
- **State Management**: TanStack Query (React Query)
- **Offline / Local DB**: Dexie (IndexedDB wrapper)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## Project Structure

```
/
├── src/                   # React frontend
│   ├── components/        # Shared UI components + shadcn primitives
│   │   ├── BottomNav.tsx  # Mobile bottom navigation (hidden lg+)
│   │   ├── Header.tsx     # Top app bar
│   │   ├── Layout.tsx     # Shell: Sidebar + Header + BottomNav + OfflineBanner
│   │   ├── OfflineBanner.tsx # Sync / offline status strip
│   │   └── Sidebar.tsx    # Desktop left sidebar (lg+)
│   ├── contexts/          # Auth, Branding, Sync contexts
│   │   └── SyncContext.tsx # Background sync — drain outbox + pull server
│   ├── hooks/             # use-online-status, use-toast
│   ├── lib/
│   │   ├── db.ts          # Dexie (IndexedDB) schema + genTempId
│   │   ├── offline-api.ts # Offline-aware CRUD (reads IndexedDB; writes outbox when offline)
│   │   ├── sync.ts        # pullFromServer + drainOutbox
│   │   ├── api.ts         # Raw fetch wrapper (used by sync.ts)
│   │   ├── rbac.ts        # Role-based access control
│   │   └── queryClient.ts # TanStack Query client
│   ├── pages/             # Route-level page components
│   └── types.ts           # Shared TypeScript types
├── server/                # Express backend
│   ├── index.ts           # Server entry point (port 3001)
│   ├── routes.ts          # All API route handlers
│   ├── storage.ts         # In-memory data store with sample data
│   └── types.ts           # Server-side types
├── public/
│   ├── manifest.json      # PWA manifest (standalone, shortcuts, categories)
│   ├── sw.js              # Service worker (cache API GETs for offline, cache-first assets)
│   ├── icon-192.svg       # App icon
│   └── icon-512.svg       # App icon
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
- **Branding** — Admin can set shop name, tagline, and logo

## Offline-First Architecture

All reads go through IndexedDB (Dexie) via `src/lib/offline-api.ts`:
- `productsOffline`, `contactsOffline`, `salesOffline`, `usersOffline`
- On **online**: writes go directly to the server AND update IndexedDB
- On **offline**: writes go to `localDb.outbox` and are drained automatically when connectivity returns
- `SyncContext` runs `syncAll()` on login and on reconnect (drain outbox + pull from server)
- Service worker (`public/sw.js`) caches API GET responses so they're available offline

## PWA / Mobile App

- `public/manifest.json` — Standalone display mode, app shortcuts, categories
- `public/sw.js` — Network-first for API (falls back to cached), cache-first for static assets
- `public/icon-192.svg` / `public/icon-512.svg` — App icons
- Install prompt available on Android Chrome / iOS Safari "Add to Home Screen"

## Mobile UI

- Desktop (≥ 1024px): Left sidebar navigation
- Mobile / tablet (< 1024px): Bottom navigation bar (68px, pill active indicator, role-filtered)
- No sidebar on mobile — bottom nav adapts per role (Admin sees up to 5 tabs + Settings/Tasks; Sales Rep sees Sales + Customers)
- All modals / forms are full-screen on mobile (no tiny popups)

## POS Screen (Mobile)

- Mobile (< 640px): **Single-column horizontal product cards** — large 72×72 thumbnail, big product name (text-[15px]), large price (text-lg bold), 48×48 +/- buttons
- Tablet/Desktop: 2-col or 3-col vertical card grid with square images
- Image lightbox on tap for any product photo
- Add new customer inline from the sales form (full-screen on mobile)
- Cart shows +/- (44×44px) for each line item

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
- All page reads go through IndexedDB (offline-api.ts), not directly to the server
- Writes use offline-api.ts (online → server + localDb; offline → outbox)
