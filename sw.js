const CACHE_NAME = 'epec-rat-cache-v1';

// Los recursos reales que usa tu index.html
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com' // 🔥 CLAVE: Registramos Tailwind para que funcione 100% offline
];

// 1. INSTALACIÓN: Guarda los archivos en el almacenamiento permanente del teléfono
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caché de Redes A.T. guardada con éxito');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVACIÓN: Limpia cachés viejas si modificás la app en el futuro
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. INTERCEPCIÓN: Estrategia Cache-First (Busca primero en el disco del celular)
self.addEventListener('fetch', (e) => {
  // Ignora las peticiones que van a Google Sheets (esas van por la cola interna del formulario)
  if (e.request.url.includes('script.google.com')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Si el recurso (incluido Tailwind) está guardado, lo entrega al instante sin mirar internet
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});
