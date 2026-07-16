const CACHE_NAME = 'supabase-images-cache-v1';
const SUPABASE_STORAGE_URL = 'supabase.co/storage/v1/object/public';

// Install event: skip waiting to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event: clean up old caches if any
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: intercept requests
self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  // Only intercept GET requests for Supabase Storage public objects
  if (event.request.method === 'GET' && requestUrl.includes(SUPABASE_STORAGE_URL)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request).then((networkResponse) => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
            return networkResponse;
          }

          // Clone the response because it's a stream and can only be consumed once
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch(() => {
          // Fallback if network fails and it's not in cache
          // (In a real scenario we might return a default placeholder image here)
          console.warn('Network request failed for', requestUrl);
        });
      })
    );
  }
});
