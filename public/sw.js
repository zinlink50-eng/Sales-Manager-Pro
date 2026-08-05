const CACHE_NAME = "sales-manager-pro-v2";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];

// Install: precache critical shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // ── API calls: network-first, fall back to cached response ──────────────
  if (url.pathname.startsWith("/api")) {
    // Only cache GET requests (reads); mutations always go to network
    if (event.request.method !== "GET") {
      event.respondWith(fetch(event.request));
      return;
    }
    event.respondWith(
      fetch(event.request.clone())
        .then((response) => {
          if (response.ok) {
            // Cache the fresh response for offline use
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          // Offline: serve the last-cached API response if available
          const cached = await caches.match(event.request);
          if (cached) return cached;
          // Nothing cached — return a structured offline placeholder
          return new Response(JSON.stringify([]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        })
    );
    return;
  }

  // ── Navigation: network-first, fall back to app shell ───────────────────
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // ── Static assets: cache-first (JS/CSS/images served from Vite build) ───
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ??
        fetch(event.request).then((response) => {
          if (response && response.status === 200 && response.type !== "opaque") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
    )
  );
});

// ── Background Sync (Web Background Sync API) ────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "outbox-sync") {
    // Notify all open clients to trigger their outbox drain
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: "TRIGGER_SYNC" }));
      })
    );
  }
});
