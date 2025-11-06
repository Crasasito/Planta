/* Service Worker — Planta PWA v4.1 (GitHub Pages friendly)
 * Navegación HTML: Network-first (fallback caché)
 * Estáticos/CDN (incl. Firebase): Stale-While-Revalidate
 * Ignora rutas externas (accounts.google.com / firebaseapp.com) para no interferir con Auth
 * Banner de actualización (“Nueva versión disponible”)
 */
const VERSION = 'planta-sw-v4.1-2025-11-06';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
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

  // No interferir con dominios de autenticación de Google/Firebase
  const externalAuth = /accounts\.google\.com|firebaseapp\.com|googleusercontent\.com/i.test(url.hostname);
  if (externalAuth) return; // deja pasar a la red

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
                   url.pathname.endsWith('.png') || url.pathname.endsWith('.json');

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

// Mensajería: saltar waiting cuando el usuario pulsa “Actualizar”
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Aviso a los clientes cuando se instala (posible nueva versión)
self.addEventListener('install', () => {
  (async () => {
    const clientsList = await self.clients.matchAll({ includeUncontrolled:true, type:'window' });
    for (const c of clientsList) c.postMessage({type:'NEW_VERSION'});
  })();
});
