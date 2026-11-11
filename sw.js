const CACHE_NAME = 'billetera-lite-v1';

const APP_SHELL_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/favicon.ico'
];

// 1. Fase de install: Cachear los archivos estáticos (App Shell)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando App Shell...');
        return cache.addAll(APP_SHELL_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] App Shell cacheado exitosamente.');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Error durante la fase de install:', error);
      })
  );
});

// 2. Fase de activate: Limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Eliminando caché antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activado y reclamando clientes.');
        return self.clients.claim();
      })
  );
});

// 3. Fase de fetch: Estrategia Cache First, Network Fallback
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones no GET o esquemas no soportados (ej. chrome-extension://)
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://')) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Cache First: Si el recurso está en la caché, servirlo de inmediato
        if (cachedResponse) {
          return cachedResponse;
        }

        // Network Fallback: Si no está en caché, solicitarlo a la red
        return fetch(event.request)
          .then((networkResponse) => {
            // Verificar respuesta válida antes de cachear
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type === 'opaque'
            ) {
              return networkResponse;
            }

            // Clonar respuesta y guardar en caché para futuras peticiones offline
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          })
          .catch((error) => {
            console.warn('[Service Worker] Petición fallida a la red (Modo offline):', event.request.url);

            // Fallback para navegación de páginas: devolver index.html
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }

            // Si es otro recurso y no hay red, propagar error
            throw error;
          });
      })
  );
});
