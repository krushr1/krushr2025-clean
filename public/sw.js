// Krushr PWA Service Worker
const CACHE_NAME = 'krushr-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/main.js',
  '/main.css',
  '/favicon.svg',
  '/apple-touch-icon.svg',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.log('SW: Cache failed', error);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim all clients immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fallback to network
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache successful responses
            if (networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.log('SW: Fetch failed', error);
            // Return offline page or default response
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            return new Response('Service Unavailable', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background sync event (future feature)
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync', event.tag);
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync offline data when connection is restored
      Promise.resolve()
    );
  }
});

// Push notification event (future feature)
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  const options = {
    body: event.data ? event.data.text() : 'New notification from Krushr',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'krushr-notification'
  };

  event.waitUntil(
    self.registration.showNotification('Krushr', options)
  );
});