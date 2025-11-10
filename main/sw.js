/* Aurora SW — scope './' */
const CACHE = 'planta-aurora-v1';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  // Iconos (si no están, se ignoran abajo)
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable192.png',
  './icons/maskable512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // addAll puede fallar si falta algún recurso; intentamos individualmente
    await Promise.allSettled(PRECACHE.map(url => cache.add(url)));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Navigation: network-first -> cache
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try { return await fetch(req); }
      catch (err) {
        const cache = await caches.open(CACHE);
        const res = await cache.match('./index.html');
        return res || Response.error();
      }
    })());
    return;
  }
  // Others: cache-first -> network
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && res.ok && req.method === 'GET' && new URL(req.url).origin === location.origin) {
        cache.put(req, res.clone());
      }
      return res;
    } catch (err) {
      return cached || Response.error();
    }
  })());
});