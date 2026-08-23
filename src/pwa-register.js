if ('serviceWorker' in navigator) {
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
