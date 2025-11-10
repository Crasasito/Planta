/* sw.js — Aurora PWA (v7) */
const VERSION = 'planta-v7';
const SCOPE   = self.registration.scope;

const PRECACHE_PATHS = [
  '', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png',
  'icons/maskable192.png', 'icons/maskable512.png'
];
const PRECACHE_URLS = PRECACHE_PATHS.map(p => new URL(p, SCOPE).toString());
const log = (...a) => console.log('[SW ' + VERSION + ']', ...a);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    for (const url of PRECACHE_URLS) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        await cache.put(url, res.clone());
        log('cached', url);
      } catch (e) {
        log('skip', url, String(e));
      }
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Navigation preload mejora TTFB en navegaciones
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === new URL(SCOPE).origin;
  const isHTML = req.destination === 'document' || req.headers.get('accept')?.includes('text/html');

  // Navegación: network-first con fallback a caché/offline
  if (isHTML && sameOrigin) {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        if (preload) return preload;
        const net = await fetch(req);
        const cache = await caches.open(VERSION);
        cache.put(req, net.clone());
        return net;
      } catch {
        const cache = await caches.open(VERSION);
        const hit = await cache.match(req);
        return hit || new Response('<!doctype html><h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
      }
    })());
    return;
  }

  // Estáticos: stale-while-revalidate
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req);
    if (hit) {
      event.waitUntil((async () => {
        try {
          const fresh = await fetch(req, { cache: 'no-cache' });
          if (fresh.ok) await cache.put(req, fresh.clone());
        } catch {}
      })());
      return hit;
    }
    try {
      const net = await fetch(req);
      if (sameOrigin && net.ok) await cache.put(req, net.clone());
      return net;
    } catch {
      return new Response('', { status: 504 });
    }
  })());
});

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
