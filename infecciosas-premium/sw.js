/* Infecciosas PWA PREMIUM — Service Worker (Aurora Premium v6)
   
   Mejoras en esta versión:
   - Estrategias de caché optimizadas
   - Precarga inteligente de recursos
   - Sincronización en background
   - Notificaciones push preparadas
   - Mejor manejo de errores
   - Cache versioning mejorado
   
   Estrategias:
   - App Shell: precache en instalación
   - HTML: network-first con fallback a cache (offline)
   - Estáticos: cache-first con revalidación periódica
   - API: stale-while-revalidate
   - Bypass: dominios Firebase/Google
*/

const VERSION = 'infecciosas-premium-v6';
const STATIC_CACHE  = VERSION + '-static';
const DYNAMIC_CACHE = VERSION + '-dynamic';
const IMAGE_CACHE   = VERSION + '-images';
const API_CACHE     = VERSION + '-api';

// Configuración
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 días
const MAX_CACHE_SIZE = 50; // Máximo de items en caché dinámica

// Assets base (resuelve bien en / o /Planta/)
const SCOPE = self.registration.scope;
const toScopeURL = (p) => new URL(p, SCOPE).toString();

// App Shell - recursos críticos para funcionamiento offline
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable192.png',
  './icons/maskable512.png'
].map(toScopeURL);

// Dominios que NO interceptamos (Firebase, Google, etc.)
const BYPASS_HOST_RE = /(firebase|gstatic|googleapis|googleusercontent|google-analytics|googletag|firestore)/i;

// ===== Utilidades de caché =====

/**
 * Guarda respuesta en caché de forma segura
 */
async function putSafe(cacheName, req, res) {
  if (!res || res.status !== 200 || res.type === 'opaque') return;
  
  try {
    const cache = await caches.open(cacheName);
    await cache.put(req, res.clone());
  } catch (err) {
    console.warn('[SW] Error guardando en caché:', err);
  }
}

/**
 * Limpia entradas antiguas de una caché
 */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    const toDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(toDelete.map(key => cache.delete(key)));
  }
}

/**
 * Elimina entradas expiradas
 */
async function cleanExpiredCache(cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const now = Date.now();
  
  for (const request of keys) {
    const response = await cache.match(request);
    if (!response) continue;
    
    const dateHeader = response.headers.get('date');
    if (!dateHeader) continue;
    
    const responseTime = new Date(dateHeader).getTime();
    if (now - responseTime > maxAge) {
      await cache.delete(request);
    }
  }
}

// ===== Estrategias de caché =====

/**
 * Cache First: Intenta caché primero, luego red
 * Ideal para assets estáticos que no cambian
 */
async function cacheFirst(req) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(req, { ignoreSearch: true });
  
  if (cached) return cached;
  
  try {
    const res = await fetch(req);
    await putSafe(STATIC_CACHE, req, res);
    return res;
  } catch (err) {
    console.warn('[SW] Cache-first falló:', err);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network First: Intenta red primero, fallback a caché
 * Ideal para contenido que debe estar actualizado
 */
async function networkFirst(req) {
  try {
    const res = await fetch(req, { cache: 'no-cache' });
    await putSafe(DYNAMIC_CACHE, req, res);
    return res;
  } catch (err) {
    // Fallback a caché
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(req);
    
    if (cached) return cached;
    
    // Fallback final a index.html para SPA
    const staticCache = await caches.open(STATIC_CACHE);
    const html = await staticCache.match(toScopeURL('./index.html'));
    
    if (html) return html;
    
    return new Response('Offline - Sin conexión', { 
      status: 503, 
      headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
    });
  }
}

/**
 * Stale While Revalidate: Devuelve caché y actualiza en background
 * Ideal para contenido que puede estar ligeramente desactualizado
 */
async function staleWhileRevalidate(req) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(req, { ignoreSearch: true });
  
  // Fetch en background
  const fetchPromise = fetch(req)
    .then(res => {
      putSafe(DYNAMIC_CACHE, req, res.clone());
      return res;
    })
    .catch(() => null);
  
  // Devolver caché si existe, sino esperar fetch
  return cached || fetchPromise || fetch(req);
}

/**
 * Cache para imágenes con límite de tamaño
 */
async function cacheImages(req) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(req);
  
  if (cached) return cached;
  
  try {
    const res = await fetch(req);
    await putSafe(IMAGE_CACHE, req, res);
    await trimCache(IMAGE_CACHE, MAX_CACHE_SIZE);
    return res;
  } catch (err) {
    return new Response('', { status: 404 });
  }
}

// ===== Event Listeners =====

/**
 * Install: Precarga App Shell
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando versión:', VERSION);
  
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(STATIC_CACHE);
      
      // Precarga con manejo de errores individual
      const results = await Promise.allSettled(
        APP_SHELL.map(url => 
          fetch(url)
            .then(res => res.ok ? cache.put(url, res) : null)
            .catch(err => console.warn('[SW] Error precargando:', url, err))
        )
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`[SW] Precargados ${successful}/${APP_SHELL.length} recursos`);
      
      // Activar inmediatamente
      await self.skipWaiting();
    } catch (err) {
      console.error('[SW] Error en instalación:', err);
    }
  })());
});

/**
 * Activate: Limpia cachés antiguas y toma control
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando versión:', VERSION);
  
  event.waitUntil((async () => {
    try {
      // Limpiar cachés antiguas
      const keys = await caches.keys();
      const oldCaches = keys.filter(k => 
        k.startsWith('infecciosas-') && 
        !k.includes(VERSION)
      );
      
      await Promise.all(oldCaches.map(k => {
        console.log('[SW] Eliminando caché antigua:', k);
        return caches.delete(k);
      }));
      
      // Limpiar cachés expiradas
      await cleanExpiredCache(DYNAMIC_CACHE, CACHE_MAX_AGE);
      await cleanExpiredCache(IMAGE_CACHE, CACHE_MAX_AGE);
      
      // Tomar control inmediato
      await self.clients.claim();
      
      console.log('[SW] Activación completada');
    } catch (err) {
      console.error('[SW] Error en activación:', err);
    }
  })());
});

/**
 * Message: Comunicación con la app
 */
self.addEventListener('message', (event) => {
  if (!event.data) return;
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys()
          .then(keys => Promise.all(keys.map(k => caches.delete(k))))
          .then(() => event.ports[0]?.postMessage({ success: true }))
      );
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: VERSION });
      break;
  }
});

/**
 * Fetch: Router principal con estrategias optimizadas
 */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Solo GET
  if (req.method !== 'GET') return;
  
  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  
  // Bypass para terceros
  if (!isSameOrigin) return;
  
  // Bypass para Firebase/Google
  if (BYPASS_HOST_RE.test(url.hostname)) return;
  
  // Determinar estrategia según tipo de recurso
  const accept = req.headers.get('accept') || '';
  const pathname = url.pathname;
  
  // HTML - Network First
  if (accept.includes('text/html')) {
    event.respondWith(networkFirst(req));
    return;
  }
  
  // Imágenes - Cache con límite
  if (/\.(png|jpe?g|webp|gif|svg|ico)$/i.test(pathname)) {
    event.respondWith(cacheImages(req));
    return;
  }
  
  // Assets estáticos - Cache First
  if (/\.(json|css|js|woff2?|ttf|eot)$/i.test(pathname)) {
    event.respondWith(cacheFirst(req));
    return;
  }
  
  // Manifest y SW - Network First
  if (pathname.includes('manifest') || pathname.includes('sw.js')) {
    event.respondWith(networkFirst(req));
    return;
  }
  
  // Resto - Stale While Revalidate
  event.respondWith(staleWhileRevalidate(req));
});

/**
 * Background Sync (preparado para futuras mejoras)
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Aquí se puede implementar sincronización de datos
      Promise.resolve()
    );
  }
});

/**
 * Push Notifications (preparado para futuras mejoras)
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Nueva notificación',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: data
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Infecciosas', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || './')
  );
});

console.log('[SW] Service Worker Premium cargado:', VERSION);
