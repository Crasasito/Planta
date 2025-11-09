/* sw.js — Aurora PWA (diagnóstico) */
const VERSION = 'planta-v6'; // cambia en cada deploy para forzar update
const SCOPE   = self.registration.scope; // e.g. https://usuario.github.io/Planta/

// Rutas a precachear (Asegúrate de que EXISTEN)
const PRECACHE_PATHS = [
  '', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png',
  'icons/maskable192.png', 'icons/maskable512.png'
];

// Normaliza a URLs absolutas bajo el scope
const PRECACHE_URLS = PRECACHE_PATHS.map(p => new URL(p, SCOPE).toString());

// Utilidad de log (silenciable)
const log = (...a) => console.log('[SW v' + VERSION + ']', ...a);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    log('install: precache start');
    const cache = await caches.open(VERSION);
    for (const url of PRECACHE_URLS) {
      try {
        // Usa no-cache para evitar versiones viejas en proxy
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        await cache.put(url, res.clone());
        log('cached:', url);
      } catch (e) {
        // Importante: no abortar la instalación por un 404
        log('WARN precache failed:', url, String(e));
      }
    }
    await self.skipWaiting();
    log('install: precache done');
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    log('activate: clear old caches');
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => {
      log('delete cache:', k);
      return caches.delete(k);
    }));
    await self.clients.claim();
    log('activate: ready');
  })());
});

// Estrategia:
// - HTML: network-first (para pillar nuevas versiones)
// - Estáticos/PNG/JSON/etc: cache-first con actualización en background
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Solo gestionamos nuestro mismo origen
  const sameOrigin = url.origin === new URL(SCOPE).origin;

  // Heurística simple para HTML
  const isHTML = req.destination === 'document' || req.headers.get('accept')?.includes('text/html');

  if (isHTML && sameOrigin) {
    event.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(VERSION);
        cache.put(req, net.clone());
        return net;
      } catch {
        const cache = await caches.open(VERSION);
        const hit = await cache.match(req);
        return hit || new Response('<!doctype html><title>Offline</title><h1>Sin conexión</h1>', { headers: { 'Content-Type': 'text/html' } });
      }
    })());
    return;
  }

  // Resto: cache-first
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req);
    if (hit) {
      // Actualiza en background
      event.waitUntil((async () => {
        try {
          const fresh = await fetch(req, { cache: 'no-cache' });
          if (fresh.ok) await cache.put(req, fresh.clone());
        } catch {}
      })());
      return hit;
    }
    // Si no hay en cache, intenta red
    try {
      const net = await fetch(req);
      if (sameOrigin && net.ok) await cache.put(req, net.clone());
      return net;
    } catch {
      return new Response('', { status: 504, statusText: 'Gateway Timeout' });
    }
  })());
});

// Soporte para skip waiting desde la app
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    log('skipWaiting by message');
    self.skipWaiting();
  }
});
