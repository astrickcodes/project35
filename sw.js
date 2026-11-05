// Offline-first: precache the app shell, network-first with offline cache fallback.
const CACHE = 'p35-v5';
const SHELL = ['./', 'index.html', 'styles.css', 'manifest.webmanifest', 'js/app.js', 'js/engine.js', 'js/data.js', 'js/lib.js', 'js/player.js', 'icons/icon-maskable-512.png', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Network-first (so updates arrive immediately), falling back to the cache when offline or slow.
  e.respondWith(new Promise(resolve => {
    const fallback = () => caches.match(req).then(hit => hit || caches.match('index.html')).then(resolve);
    const t = setTimeout(fallback, 4000);
    fetch(req).then(res => { clearTimeout(t); if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } resolve(res); }).catch(() => { clearTimeout(t); fallback(); });
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('./')));
});
