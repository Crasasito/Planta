// Aurora SW — precache + network-first para HTML, cache-first para assets
const CACHE = 'planta-aurora-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', evt => {
  evt.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', evt => {
  evt.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('message', evt => {
  if (evt.data && evt.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', evt => {
  const req = evt.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Network-first para HTML / navigations
  if (url.origin === location.origin && (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html'))) {
    evt.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, net.clone());
        return net;
      } catch (e) {
        const cache = await caches.open(CACHE);
        return (await cache.match(req)) || (await cache.match('./index.html'));
      }
    })());
    return;
  }

  // Cache-first para el resto
  evt.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const net = await fetch(req);
      cache.put(req, net.clone());
      return net;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});
