// sw.js — PWA estable (v4.1.0)
// Estrategia: cache-first (assets) + actualización silenciosa + fallback offline para navegación
const VERSION = 'v4.1.0';
const CACHE = `pwa-cache-${VERSION}`;

const BASE = new URL('./', self.registration.scope).pathname;
const ASSETS = [
  BASE + 'index.html',
  BASE + 'manifest.webmanifest',
  BASE + 'sw.js',
  BASE + 'icons/icon-192-pc.png',
  BASE + 'icons/icon-512-pc.png',
  BASE + 'icons/icon-192-android-maskable.png',
  BASE + 'icons/icon-512-android-maskable.png',
  BASE + 'icons/icon-512-monochrome-v3.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('pwa-cache-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) {
      // Actualiza en segundo plano
      event.waitUntil(fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); }));
      return cached;
    }
    try {
      const res = await fetch(req);
      if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    } catch {
      if (req.mode === 'navigate') return cache.match(BASE + 'index.html');
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});