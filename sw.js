/* Infecciosas PWA — Service Worker (Aurora Premium)
   Estrategias:
   - App Shell precache (instalación).
   - HTML: network-first + fallback a cache (offline).
   - Estáticos: cache-first.
   - Otros GET same-origin: stale-while-revalidate.
   - Bypass: domains Firebase/Google.
*/

const VERSION = 'infecciosas-sw-v5';                 // ← súbelo cuando despliegues cambios
const STATIC_CACHE  = VERSION + '-static';
const DYNAMIC_CACHE = VERSION + '-dynamic';

// Assets base (resuelve bien en / o /Planta/)
const SCOPE = self.registration.scope;               // p.ej. https://usuario.github.io/Planta/
const toScopeURL = (p) => new URL(p, SCOPE).toString();

const APP_SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/maskable192.png', './icons/maskable512.png'
].map(toScopeURL);

// dominios que NO interceptamos (Firebase, Google, gstatic, etc.)
const BYPASS_HOST_RE = /(firebase|gstatic|googleapis|googleusercontent|google-analytics|googletag)/i;

// Utilidades de caché
async function putSafe(cacheName, req, res) {
  if (!res || res.status !== 200 || res.type === 'opaque') return; // evita 3rd-party opaques
  const cache = await caches.open(cacheName);
  try { await cache.put(req, res.clone()); } catch {}
}

async function cacheFirst(req) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(req, { ignoreSearch: true });
  if (cached) return cached;
  const res = await fetch(req);
  putSafe(STATIC_CACHE, req, res.clone());
  return res;
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    putSafe(DYNAMIC_CACHE, req, res.clone());
    return res;
  } catch {
    // Fallback a index.html para SPA
    const cache = await caches.open(STATIC_CACHE);
    const html = await cache.match(toScopeURL('./index.html'));
    if (html) return html;
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(req, { ignoreSearch: true });
  const net = fetch(req).then(res => { putSafe(DYNAMIC_CACHE, req, res.clone()); return res; }).catch(() => null);
  return cached || net || fetch(req);
}

// Install: precache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

// Activate: limpia versiones antiguas y toma control
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k.startsWith('infecciosas-') && k !== STATIC_CACHE && k !== DYNAMIC_CACHE) ? caches.delete(k) : null));
    await self.clients.claim();
  })());
});

// Mensaje desde la app para actualizar al instante
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Fetch: router
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                             // solo GET

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) return;                                    // terceros fuera (evita problemas CORS)

  if (BYPASS_HOST_RE.test(url.hostname)) return;                // no interceptar Firebase/Google

  // Navegaciones (HTML)
  const accept = req.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Estáticos "pesados"
  if (/\.(?:png|jpe?g|webp|gif|svg|ico|json|css|js|woff2?)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Resto same-origin
  event.respondWith(staleWhileRevalidate(req));
});
