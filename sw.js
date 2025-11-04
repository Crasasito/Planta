const CACHE = "planta-v1";
const ASSETS = [
  "./planta.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(ASSETS);
  })());
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
  })());
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith((async () => {
    const r = await caches.match(e.request);
    if (r) return r;
    try {
      const net = await fetch(e.request);
      if (e.request.method === "GET" && new URL(e.request.url).origin === location.origin) {
        const c = await caches.open(CACHE);
        c.put(e.request, net.clone());
      }
      return net;
    } catch {
      return r || Response.error();
    }
  })());
});
