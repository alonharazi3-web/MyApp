const CACHE_NAME = 'feedback-app-v5.6.3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/FileSaver.min.js',
  '/js/app.js',
  '/js/storage.js',
  '/js/export.js',
  '/js/router.js',
  '/js/permissions.js',
  '/js/version-display.js',
  '/js/doc-scanner.js',
  '/js/pdf-generator.js',
  '/js/excel-generator.js',
  '/js/pages/landing.js',
  '/js/pages/admin.js',
  '/js/pages/evaluator.js',
  '/js/pages/assessment.js',
  '/js/pages/summary.js',
  '/js/pages/preview.js',
  '/js/exercises/balloon.js',
  '/js/exercises/tiach.js',
  '/js/exercises/dolira.js',
  '/js/exercises/david.js',
  '/js/exercises/laila.js',
  '/js/exercises/michtav.js',
  '/js/exercises/yominet.js',
  '/logo.png',
  '/letter.jpg',
  '/letter.pdf',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Offline fallback
          return caches.match('/index.html');
        });
      })
  );
});

// Background sync (optional - for future features)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

function syncData() {
  // Implement data sync logic here
  return Promise.resolve();
}
