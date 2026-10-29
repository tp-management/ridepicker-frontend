// Network-first for same-origin app resources prevents stale UI after deploys.
// Runtime cache is strictly RidePicker-scoped. API requests are never cached.
const CACHE_NAME = "ridepicker-pwa-v2";
const APP_SHELL = ["/", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/maskable-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith("ridepicker-pwa-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.includes("/functions/")) return;

  event.respondWith(
    fetch(request)
      .then(async (response) => {
        if (response.ok && response.type === "basic") {
          const cache = await caches.open(CACHE_NAME);
          try {
            await cache.put(request, response.clone());
          } catch {
            // Uncacheable responses must not block the live UI.
          }
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          const shell = await caches.match("/");
          if (shell) return shell;
        }
        return Response.error();
      })
  );
});


// The push contains no job details; the existing authenticated dashboard reads
// pending BIG MONEY alerts from the API after opening.
self.addEventListener("push", (event) => {
  event.waitUntil(self.registration.showNotification("🔥 BIG MONEY JOB", {
    body: "A new high-value job is waiting. Open RidePicker to respond.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    requireInteraction: true,
    data: { url: "/home" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL("/home", self.location.origin).href;
  event.waitUntil((async () => {
    const openWindows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of openWindows) {
      if (new URL(client.url).origin !== self.location.origin) continue;
      try {
        if ("navigate" in client) await client.navigate(target);
        return await client.focus();
      } catch {
        // Browser disallows navigation: try the next window / open a new tab.
      }
    }
    return self.clients.openWindow(target);
  })());
});
