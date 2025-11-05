const VERSION = 'planta-sw-v1.2.0';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './firebase.config.js',
  './sw.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        if (preload) return preload;
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

  const isStatic = url.origin.includes('gstatic.com') || url.origin.includes('googleapis.com') ||
    url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.png') || url.pathname.endsWith('.webmanifest');

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
};
