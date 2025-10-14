const CACHE_NAME = 'chronex-cache-v2';
const urlsToCache = [
  './index.html',
  './manifest.json',
  './Logo (2).png',
  './Study.html',
  './Resources.html',
  './Courses.html',
  './Contact.html' // match capitalization in your HTML link
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

// ✅ Fetch requests - serve from cache first, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(() => {
        // Optional: offline fallback
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});

// ✅ Activate new service worker and remove old caches
self.addEventListener('activate', (event) => {
  console.log('♻️ Activating new service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log(`🗑️ Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      )
    ).then(() => self.clients.claim())
  );
});
