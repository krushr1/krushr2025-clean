/**
 * Krushr Service Worker - Production Only
 * Provides offline functionality and performance optimizations for production builds
 */

const CACHE_NAME = 'krushr-v3-production'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg'
]

// Install event - cache essential static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing for production...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching essential assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error)
      })
  )
})

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement cache-first strategy for static assets, network-first for API
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }
  
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  const { url } = event.request

  // API requests: Network-first strategy
  if (url.includes('/api') || url.includes('/trpc')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache successful API responses if they're cacheable
          if (response.status === 200 && event.request.method === 'GET') {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback to cache for API requests when offline
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Return a meaningful offline response for API failures
            return new Response(
              JSON.stringify({ error: 'Offline - please try again when connected' }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            )
          })
        })
    )
    return
  }

  // Static assets: Cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            const responseToCache = response.clone()

            // Cache static assets
            if (
              url.includes('/static/') ||
              url.includes('/assets/') ||
              url.endsWith('.js') ||
              url.endsWith('.css') ||
              url.endsWith('.svg') ||
              url.endsWith('.png') ||
              url.endsWith('.jpg') ||
              url.endsWith('.ico') ||
              url.includes('/manifest.json')
            ) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache)
              })
            }

            return response
          })
          .catch(() => {
            // Fallback for navigation requests when offline
            if (event.request.destination === 'document') {
              return caches.match('/').then((cachedResponse) => {
                if (cachedResponse) {
                  return cachedResponse
                }
                return new Response(
                  '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your connection and try again.</p></body></html>',
                  {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'text/html' }
                  }
                )
              })
            }
            
            throw error
          })
      })
  )
})

// Background sync for offline actions (future feature)
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any queued offline actions here
      Promise.resolve().then(() => {
        console.log('🔄 Processing offline actions...')
      })
    )
  }
})

// Push notifications (future feature)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: data.tag || 'krushr-notification',
        data: data.data
      })
    )
  }
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    self.clients.openWindow('/')
  )
})

console.log('🚀 Krushr Service Worker loaded (production mode)')