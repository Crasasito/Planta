/* Service Worker — Planta PWA
 * Estrategia principal: Network-first con fallback a caché (navegaciones)
 * Estáticos/CDN (incl. Firebase): Stale-While-Revalidate (rápido + refresco en segundo plano)
 * Actualización: cuando hay nueva versión, mostramos banner en la página para "Actualizar"
 */
const VERSION = 'planta-sw-v2025-11-06-01';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './firebase-config.js',
  './sw.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(APP_SHELL);
    // No skipWaiting automático: dejamos que el usuario confirme actualización desde la UI
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;

  // Navegaciones HTML → network-first con fallback a caché
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(VERSION);
        cache.put('./index.html', net.clone());
        return net;
      } catch (err) {
        const cache = await caches.open(VERSION);
        const cached = await cache.match('./index.html');
        return cached || new Response('<h1>Offline</h1>', { headers: {'Content-Type':'text/html'} });
      }
    })());
    return;
  }

  // Estáticos/CDN → SWR
  const isStatic = url.origin.includes('gstatic.com') || url.origin.includes('googleapis.com') ||
                   url.pathname.endsWith('.js') || url.pathname.endsWith('.css') ||
                   url.pathname.endsWith('.png') || url.pathname.endsWith('.json');

  if (isStatic) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then((res) => {
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })());
  }
});

// Mensajería para saltar waiting (cuando el usuario pulsa "Actualizar")
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Opcional: avisar a clientes que hay nueva versión instalada y en waiting
self.addEventListener('install', () => {
  (async () => {
    const clis = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const c of clis) c.postMessage('NEW_VERSION');
  })();
});
