// Nyayakasha Service Worker - Passthrough / Uninstall
// This SW immediately unregisters itself so no stale cached requests block the API.

self.addEventListener('install', (event) => {
  // Skip waiting so this SW activates immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim all clients and unregister self to clean up any stale SW
  event.waitUntil(
    self.clients.claim().then(() => self.registration.unregister())
  );
});

// Do NOT intercept any fetch requests — let them pass through directly
