// PWA registration is production-only. Vite's stable dev module paths must not be cached.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              window.dispatchEvent(new Event('ridepicker:pwa-update-ready'));
            }
          });
        });
      })
      .catch((error) => {
        console.warn('RidePicker PWA service worker registration failed:', error);
      });
  });
}
