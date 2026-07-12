const CACHE = 'osk-v1';
const STATIC = ['/offline'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/_next/static') || url.pathname.match(/\.(js|css|woff2?|webp|png|jpg|svg)$/)) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => { const c = caches.open(CACHE); c.then((cache) => cache.put(e.request, res.clone())); return res; })));
  }
});
