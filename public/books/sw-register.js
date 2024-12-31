if ('serviceWorker' in navigator) {
  // Calculate path to sw.js relative to current page
  const currentPath = window.location.pathname;
  const pathSegments = currentPath.split('/').length - 2; // -2 for leading and trailing slashes
  const swPath = '/sw.js';  // Always use root path for service worker
  
  navigator.serviceWorker.register(swPath, { scope: '/' })
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(function(error) {
      console.log('Service Worker registration failed:', error);
    });
}
