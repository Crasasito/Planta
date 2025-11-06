// sw.js — PWA shell cache + auto-update (sin FCM)
const VERSION = 'hub-sw-v3.1.1';
const SHELL = ['/Planta/','/Planta/index.html','/Planta/manifest.webmanifest','/Planta/firebase-config.js','/Planta/sw.js','/Planta/icons/icon-192.png','/Planta/icons/icon-512.png'];

self.addEventListener('install', e=>e.waitUntil((async()=>{const c=await caches.open(VERSION); for(const u of SHELL){try{const r=await fetch(u,{cache:'no-cache'}); if(r.ok) await c.put(u,r.clone());}catch{}} await self.skipWaiting();})()));
self.addEventListener('activate', e=>e.waitUntil((async()=>{try{await self.registration.navigationPreload.enable();}catch{} const ks=await caches.keys(); await Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k))); await self.clients.claim();})()));
self.addEventListener('fetch', e=>{
  const req=e.request; if(req.method!=='GET') return; const url=new URL(req.url);
  if(/accounts\.google\.com|firebaseapp\.com|googleusercontent\.com/i.test(url.hostname)) return;
  if(req.mode==='navigate'){ e.respondWith((async()=>{try{const p=await e.preloadResponse; if(p){const c=await caches.open(VERSION); await c.put('/Planta/index.html',p.clone()); return p;} const n=await fetch(req); const c=await caches.open(VERSION); await c.put('/Planta/index.html',n.clone()); return n;}catch{const c=await caches.open(VERSION); return (await c.match('/Planta/index.html')) || new Response('<h1>Offline</h1>',{headers:{'Content-Type':'text/html'}});} })()); return; }
  if(/\.js$|\.css$|\.png$|\.json$|\.webmanifest$/i.test(url.pathname) || url.origin===location.origin){
    e.respondWith((async()=>{const c=await caches.open(VERSION); const hit=await c.match(req); const net=fetch(req).then(r=>{if(r&&r.ok) c.put(req,r.clone()); return r;}).catch(()=>hit); return hit||net;})());
  }
});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING') self.skipWaiting();});
