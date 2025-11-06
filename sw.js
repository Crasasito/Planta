/* Service Worker — Planta PWA v4.4 (GitHub Pages)
 * Navegación: Network-first (fallback caché)
 * Estáticos/CDN (incl. Firebase): Stale-While-Revalidate
 * Ignora esquemas no http(s) y dominios de Auth (accounts/google/firebase)
 * Actualización inmediata (skipWaiting) y botón “Actualizar”
 */
const VERSION = 'planta-sw-v4.4-2025-11-06';
const APP_SHELL = [
  './',
  './index.html',
  // Usa el nombre real de tu manifest: .webmanifest o .json
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
    await self.skipWaiting(); // fuerza activación del SW nuevo
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

  // ❗ Ignorar todo lo que no sea http(s) (extensiones, devtools…)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // ❗ No interferir con autenticación Google/Firebase
  if (/accounts\.google\.com|firebaseapp\.com|googleusercontent\.com/i.test(url.hostname)) return;

  // Navegaciones: network-first con fallback a caché
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // aprovechar navigation preload si existe
        const preload = await event.preloadResponse;
        if (preload) {
          try { const c = await caches.open(VERSION); await c.put('./index.html', preload.clone()); } catch {}
          return preload;
        }
        const net = await fetch(req);
        try { const c = await caches.open(VERSION); await c.put('./index.html', net.clone()); } catch {}
        return net;
      } catch {
        const c = await caches.open(VERSION);
        const cached = await c.match('./index.html');
        return cached || new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
      }
    })());
    return;
  }

  // Estáticos/CDN: SWR
  const isStatic = url.origin.includes('gstatic.com') || url.origin.includes('googleapis.com') ||
                   /\.js$|\.css$|\.png$|\.json$|\.webmanifest$/i.test(url.pathname);

  if (isStatic) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then((res) => {
        if (res && res.status === 200) {
          try { cache.put(req, res.clone()); } catch {} // nunca cachear esquemas raros
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })());
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
