// sw.js — v4.2.0 (PWA Premium)
const VERSION = 'v4.2.0';
const CACHE = `pwa-cache-${VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable192.png',
  './icons/maskable512.png'
];

// INSTALL: precache básico
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })));
    // Deja el SW listo para tomar control tras SKIP_WAITING
  })());
});

// ACTIVATE: limpia caches antiguos y reclama clientes
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Navigation Preload mejora el TTFB cuando hay red
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE) && caches.delete(k)));
    await self.clients.claim();
  })());
});

// FETCH: network-first con fallback a cache y offline a index
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Solo GET
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);

    // Intenta Navigation Preload si está disponible
    const preload = event.preloadResponse ? await event.preloadResponse : null;
    if (preload) {
      // Actualiza cache en segundo plano
      cache.put(req, preload.clone()).catch(()=>{});
      return preload;
    }

    try {
      const net = await fetch(req);
      // Cachea respuestas básicas 200 OK
      if (net && net.ok && net.type === 'basic') cache.put(req, net.clone());
      return net;
    } catch {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      // Fallback de navegación a la shell
      if (req.mode === 'navigate') {
        const shell = await cache.match('./index.html', { ignoreSearch: true });
        if (shell) return shell;
      }
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});

// Mensajes desde la página para activar la nueva versión
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
