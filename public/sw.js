self.addEventListener('fetch', event => {
  if (event.request.url.includes('/books/') && event.request.url.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(html => {
          // Calculate relative paths
          const currentPath = new URL(event.request.url).pathname;
          const pathSegments = currentPath.split('/').length - 2;
          const relativePath = '../'.repeat(pathSegments);
          
          // Add both scripts
          const swRegisterScript = `<script src="${relativePath}books/sw-register.js"></script>`;
          const injectScript = `<script src="${relativePath}books/inject.js"></script>`;
          
          // Insert both scripts before closing head tag
          const modifiedHtml = html.replace('</head>', `${swRegisterScript}${injectScript}</head>`);
          
          return new Response(modifiedHtml, {
            headers: {
              'Content-Type': 'text/html',
              'Content-Security-Policy': "script-src 'self' 'unsafe-inline'"
            }
          });
        })
        .catch(error => {
          console.error('Service Worker error:', error);
          return fetch(event.request);
        })
    );
  }
});
