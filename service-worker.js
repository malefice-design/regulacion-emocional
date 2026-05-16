const CACHE_NAME = 'reg-emocional-v3';

const ASSETS = [
  '/regulacion-emocional/',
  '/regulacion-emocional/index.html',
  '/regulacion-emocional/manifest.json',
  '/regulacion-emocional/icon-192.png',
  '/regulacion-emocional/icon-512.png',
];

// Instalación: precachear todos los assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activación: borrar caches viejas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first (app funciona offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          // Cachear respuestas válidas dinámicamente
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('/regulacion-emocional/index.html'));
    })
  );
});
