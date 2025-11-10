/* Aurora UI — Service Worker (vFinal.5) */
const CACHE_VERSION = 'vFinal.5';
const CACHE_NAME = `aurora-${CACHE_VERSION}`;
const APP_SHELL = [
'./',
'./index.html',
'./manifest.json',
'./assets/icons/icon-192.png',
'./assets/icons/icon-512.png'
];


self.addEventListener('install', (event) => {
self.skipWaiting();
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
);
});


self.addEventListener('activate', (event) => {
event.waitUntil((async () => {
const keys = await caches.keys();
await Promise.all(
keys.filter(k => k.startsWith('aurora-') && k !== CACHE_NAME)
.map(k => caches.delete(k))
);
await self.clients.claim();
})());
});


self.addEventListener('fetch', (event) => {
const req = event.request;
const url = new URL(req.url);


// 1) Navegaciones → network-first con fallback a app shell
if (req.mode === 'navigate') {
event.respondWith((async () => {
try { return await fetch(req); }
catch { return await caches.match('./index.html'); }
})());
return;
}


// 2) Misma-origen y estáticos → stale-while-revalidate
const isSameOrigin = url.origin === self.location.origin;
const isGET = req.method === 'GET';
const isStatic = /\.(?:css|js|png|jpg|jpeg|webp|avif|svg|ico|json)$/i.test(url.pathname);


if (isSameOrigin && isGET && isStatic) {
event.respondWith((async () => {
const cache = await caches.open(CACHE_NAME);
const cached = await cache.match(req);
const networkPromise = fetch(req).then((res) => {
if (res && res.status === 200) cache.put(req, res.clone());
return res;
}).catch(() => undefined);
return cached || networkPromise || new Response('', { status: 504 });
})());
return;
}


// 3) Resto (incluye llamadas a Firebase/Firestore/CDN) → red directa
event.respondWith(fetch(req).catch(() => caches.match(req)));
});
