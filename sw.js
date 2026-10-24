// Offline-Cache: App-Dateien werden beim ersten Aufruf gespeichert.
const CACHE = 'todos-v2';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Nur eigene alte Caches löschen; der Wochenteller liegt auf derselben Domain.
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('todos-') && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Erst Netz, bei Fehler Cache – so kommen Updates an, offline geht's trotzdem.
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request))
  );
});
