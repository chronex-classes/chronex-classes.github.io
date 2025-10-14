// ✅ Versioned cache name
const CACHE_NAME = 'chronex-cache-v5'; // bump this when making major changes

// ✅ Core files to pre-cache (app shell)
const urlsToCache = [
  './index.html',
  './manifest.json',
  './Logo_2.png',
  './Study.html',
  './Resources.html',
  './Courses.html',
  './Contact.html'
];

// ✅ Install Service Worker and cache essential files
self.addEventListener('install', (event) => {
  console.log('📦 Installing service worker and caching app shell...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// ✅ Fetch requests
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Network-first for HTML pages
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          // Update cache with fresh HTML
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(req).then((cachedRes) => {
            return cachedRes || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      return cachedRes || fetch(req).then((networkRes) => {
        // Cache new static assets
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, networkRes.clone());
          return networkRes;
        });
      });
    })
  );
});

// ✅ Activate new service worker and remove old caches
self.addEventListener('activate', (event) => {
  console.log('♻️ Activating new service worker...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
