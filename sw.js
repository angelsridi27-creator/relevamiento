const CACHE_NAME = 'epec-rat-cache-v1';

// Los archivos locales de tu app que necesitás que abran SÍ O SÍ sin internet
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icono.png' // Cambialo por el nombre real de tu ícono si tenés uno
];

// 1. INSTALACIÓN: Guarda los archivos en el almacenamiento permanente del teléfono
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caché permanente guardada con éxito');
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

// 3. INTERCEPCIÓN (La clave del éxito): Estrategia Cache-First para la App
self.addEventListener('fetch', (e) => {
  // Ignora las peticiones que van a Google Sheets (porque esas sí o sí necesitan internet o van por la cola offline)
  if (e.request.url.includes('script.google.com')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Si el archivo está en el teléfono (HTML, CSS, JS), lo devuelve al instante sin mirar internet
      if (cachedResponse) {
        return cachedResponse;
      }
      // Si es algo nuevo (como una foto de afuera), lo busca en la red
      return fetch(e.request);
    })
  );
});
