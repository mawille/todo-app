// Offline-Cache: App-Dateien werden beim ersten Aufruf gespeichert.
// Die Todo-App liegt auf derselben Domain, deshalb nur Caches mit "wochenteller-" anfassen.
const CACHE = 'wochenteller-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('wochenteller-') && k !== CACHE).map(k => caches.delete(k))
  )));
  self.clients.claim();
});

// Erst Netz, bei Fehler Cache – so kommen Updates an, offline geht's trotzdem.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request))
  );
});
