// sw.js — v4.1.1
const VERSION='v4.1.1';
const CACHE = `pwa-cache-${VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks
      .filter(k => k.startsWith('pwa-cache-') && k !== CACHE)
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const m = await c.match(req, { ignoreSearch: true });
    if (m) {
      e.waitUntil(fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); }).catch(()=>{}));
      return m;
    }
    try {
      const r = await fetch(req);
      if (r && r.ok && r.type === 'basic') c.put(req, r.clone());
      return r;
    } catch {
      if (req.mode === 'navigate') return c.match('./index.html');
      return new Response('Offline', { status: 503 });
    }
  })());
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
