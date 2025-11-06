/* Service Worker — Planta PWA v4.3 (GitHub Pages)
 * Navegación: Network-first (fallback caché)
 * Estáticos/CDN (incl. Firebase): Stale-While-Revalidate
 * Ignora esquemas no http(s) y dominios de Auth (accounts/google/firebase)
 * Botón de actualización manejado desde index (SKIP_WAITING)
 */
const VERSION = 'planta-sw-v4.3-2025-11-06';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './firebase-config.js',
  './sw.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(APP_SHELL);
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
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // ❗Ignorar esquemas no http(s) (extensiones, devtools…)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // ❗No interferir con dominios de autenticación de Google/Firebase
  if (/accounts\.google\.com|firebaseapp\.com|googleusercontent\.com/i.test(url.hostname)) return;

  // Navegaciones: network-first
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(VERSION);
        cache.put('./index.html', net.clone());
        return net;
      } catch {
        const cache = await caches.open(VERSION);
        const cached = await cache.match('./index.html');
        return cached || new Response('<h1>Offline</h1>', { headers: {'Content-Type':'text/html'} });
      }
    })());
    return;
  }

  // Estáticos/CDN: SWR
  const isStatic = url.origin.includes('gstatic.com') || url.origin.includes('googleapis.com') ||
                   url.pathname.endsWith('.js') || url.pathname.endsWith('.css') ||
                   url.pathname.endsWith('.png') || url.pathname.endsWith('.json') ||
                   url.pathname.endsWith('.webmanifest');

  if (isStatic) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then((res)=>{
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      }).catch(()=>cached);
      return cached || fetchPromise;
    })());
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
