const CACHE_NAME = "epec-rat-cache-v1";
const ASSETS = [
  "index.html",
  "manifest.json"
];

// Instalar el Service Worker y guardar los archivos en el caché del celular
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activar y limpiar cachés antiguos
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Interceptar solicitudes: Si estás offline, sirve el archivo local guardado
self.addEventListener("fetch", (e) => {
  // Solo cacheamos solicitudes locales del esqueleto de la app, no los envíos a Google
  if (e.request.url.includes("script.google.com")) {
    return; 
  }
  
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
