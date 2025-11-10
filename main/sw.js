/* sw.js — Aurora PWA (v8) */
const VERSION = 'planta-v8';
const SCOPE   = self.registration.scope;

const PRECACHE_PATHS = [
  '', 'index.html', 'manifest.webmanifest',
  'firebase-config.js',
  'icons/icon-192.png', 'icons/icon-512.png',
  'icons/maskable192.png', 'icons/maskable512.png'
];
const PRECACHE_URLS = PRECACHE_PATHS.map(p => new URL(p, SCOPE).toString());
const log = (...a) => console.log('[SW ' + VERSION + ']', ...a);

const OFFLINE_HTML = `<!doctype html>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline · Infecciosas</title>
<style>body{font-family:system-ui,Segoe UI,Roboto,Arial;margin:0;padding:24px;background:#fff;color:#0b1220}
.card{max-width:640px;margin:auto;border:1px solid #e7ecf3;border-radius:14px;padding:18px;box-shadow:0 6px 26px rgba(5,18,35,.06)}
h1{margin:0 0 6px 0;font-size:24px}p{margin:8px 0}</style>
<body><div class="card"><h1>Sin conexión</h1><p>Vuelve a intentarlo cuando tengas red. El contenido ya visitado seguirá disponible.</p></div>`;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    for (const url of PRECACHE_URLS) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        await cache.put(url, res.clone());
        log('cached', url);
      } catch (e) { log('skip', url, String(e)); }
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    if (self.registration.navigationPreload) { try { await self.registration.navigationPreload.enable(); } catch {} }
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
        return hit || new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
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
