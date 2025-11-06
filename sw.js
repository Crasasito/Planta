/* Service Worker — Planta PWA v5.0 (GitHub Pages)
 * Estrategia:
 *   - Navigate: Network-first (fallback caché)
 *   - Estáticos/CDN: SWR
 * Robustez:
 *   - Ignora esquemas no http(s) y dominios de Auth (Google/Firebase)
 *   - Instalación tolerante (no falla si un recurso 404)
 *   - navigationPreload + botón “Actualizar” vía postMessage(SKIP_WAITING)
 */
const VERSION = 'planta-sw-v5.0-2025-11-06';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',   // 👈 debe existir con este nombre en /Planta/
  './firebase-config.js',
  './sw.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // addAll falla si 1 recurso 404 → iteramos y ponemos solo los OK
    for (const url of SHELL) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res && res.ok) await cache.put(url, res.clone());
      } catch { /* tolerante */ }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try { await self.registration.navigationPreload.enable(); } catch {}
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // ❗ Ignorar esquemas no http(s) (extensiones, devtools…)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // ❗ No interferir con autenticación Google/Firebase
  if (/accounts\.google\.com|firebaseapp\.com|googleusercontent\.com/i.test(url.hostname)) return;

  // Navegaciones: Network-first con preload
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
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

  // Estáticos/CDN: SWR (tolerante)
  const isStatic = url.origin.includes('gstatic.com') || url.origin.includes('googleapis.com') ||
                   /\.js$|\.css$|\.png$|\.json$|\.webmanifest$/i.test(url.pathname);

  if (isStatic) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then((res) => {
        if (res && res.status === 200 && (url.protocol === 'http:' || url.protocol === 'https:')) {
          try { cache.put(req, res.clone()); } catch {}
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
