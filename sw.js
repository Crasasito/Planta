// sw.js — Planta PWA (v4, fondo siempre blanco)
const CACHE_NAME = "planta-cache-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

// Precache de shell + activación inmediata
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Navegación: Network-First con fallback a caché (soporta offline)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Navegaciones (documentos)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(res => {
        // Actualiza copia en caché de index.html para futuros offline
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Otros recursos estáticos: Cache-First
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
