// Service Worker minimalista para cumplir con los requisitos de instalabilidad PWA
const CACHE_NAME = 'enruta-v1';

self.addEventListener('install', (event) => {
  // Salta el tiempo de espera para que el SW se active inmediatamente
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Toma el control de las pestañas abiertas inmediatamente
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Estrategia: Solo red (no caché real en el prototipo para evitar bugs de desarrollo)
  // Pero el evento 'fetch' debe estar presente para que Chrome considere la web instalable.
  return;
});
