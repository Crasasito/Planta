// sw.js — PWA cache estable con aviso de actualización
const VERSION = 'v3.2.0';
const BC = new BroadcastChannel('pwa-updates');

const BASE = new URL('./', self.registration.scope).pathname;
const TO_CACHE = [
  BASE + 'index.html',
  BASE + 'manifest.webmanifest',
  BASE + 'sw.js',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open('cache-' + VERSION);
    await cache.addAll(TO_CACHE.map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('cache-') && k !== 'cache-' + VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
    BC.postMessage({ type: 'READY', version: VERSION });
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open('cache-' + VERSION);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    } catch {
      if (req.mode === 'navigate') return cache.match(BASE + 'index.html');
      throw new Error('Offline sin recurso en caché');
    }
  })());
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
