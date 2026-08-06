const CACHE_NAME = 'studyhub-pwa-cache-v1';

// Install event - don't cache anything upfront to keep it lightweight.
// We will cache on the fly.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Stale While Revalidate Strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and http/https (ignore chrome-extension, etc)
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // If response is valid, clone and cache it
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // If offline and not in cache, return a fallback if possible
          // In a true SPA, returning index.html for navigation requests is needed
          if (event.request.mode === 'navigate') {
            return cache.match('/index.html');
          }
        });
        
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// Handle Push Notifications
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2'
      }
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
