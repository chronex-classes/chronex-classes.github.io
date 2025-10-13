// sw.js

const CACHE_NAME = 'chronex-classes-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/Courses.html',
  '/Resources.html',
  '/Contact.html',
  '/Study.html', // Added Study.html to the cache list
  // Note: ensure Logo%20(2).png is also cached if local
  'https://cdn.tailwindcss.com' // Caching the external library is highly recommended
];

// Install event: open a cache and add the core files to it
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activate worker immediately
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of open pages
  );
});

// Fetch event: serve assets from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's also a stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Only cache GET requests
                if(event.request.method === 'GET') {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
      .catch(() => {
        // You can serve an offline fallback page here if navigation fails
        if (event.request.mode === 'navigate') {
          // If the network fails for a page request, return an offline page (if you have one)
          return caches.match('/index.html'); // Fallback to index
        }
      })
  );
});
