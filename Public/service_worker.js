const CACHE_NAME = "liarsdice-cache-v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/liars_dice.js",
        "/style.css",
        "/manifest.json",
        "/Views/login.html",
        "/Views/signup.html",
        "/Views/dashboard.html",
        "/Views/edit.html",
        "/Views/game.html"
      ]);
    })
  );
});
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
