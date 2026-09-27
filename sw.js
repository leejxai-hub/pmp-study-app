// Simple app-shell service worker for the PMP Study App.
// Caches the static shell so the app opens instantly and works offline.
// Never caches cross-origin requests (the Google Apps Script API calls) —
// those always go straight to the network so tracker data stays fresh.

const CACHE_NAME = "pmp-study-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./config.js",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET requests for our own origin's app-shell files.
  // Everything else (cross-origin Apps Script API calls, POSTs, etc.)
  // is left completely untouched so it always hits the real network.
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);

      // Cache-first for instant load; refresh cache in the background.
      return cached || networkFetch;
    })
  );
});
