const CACHE_NAME = 'chronex-cache-v3'; // Incrementing cache version is a good practice when changing files
const urlsToCache = [
  './index.html',
  './manifest.json',
  './Logo_2.png', // Rectified: Changed from 'Logo (2).png'
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

// ✅ Fetch requests - serve from cache first, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(() => {
        // Optional: offline fallback for navigation requests
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
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    )
  );
});
