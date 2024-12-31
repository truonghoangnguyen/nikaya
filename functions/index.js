const functions = require('firebase-functions');

exports.injectScript = functions.https.onRequest((req, res) => {
  // Get the original HTML
  const fs = require('fs');
  const path = require('path');
  
  // Only inject for HTML files in books directory that don't end with .se
  if (!req.path.startsWith('/books/') || !req.path.endsWith('.html') || req.path.endsWith('.html.se')) {
    // Serve the original file without modification
    const filePath = path.join(__dirname, '..', 'public', req.path);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.status(404).send('File not found');
        return;
      }
      res.set('Content-Type', 'text/html');
      res.send(data);
    });
    return;
  }
  
  // Remove the leading slash and add public prefix
  const filePath = path.join(__dirname, '..', 'public', req.path);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(404).send('File not found');
      return;
    }

    // Calculate relative path to inject.js from current file
    const currentDir = path.dirname(req.path);
    const relativePath = path.relative(currentDir, '/books/inject.js');

    // Inject script before closing head tag
    const modifiedHtml = data.replace(
      '</head>',
      `<script src="${relativePath}"></script></head>`
    );

    // Set headers
    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'public, max-age=300');
    res.set('Content-Security-Policy', "script-src 'self' 'unsafe-inline' https://ajax.googleapis.com https://*.googleapis.com");
    res.send(modifiedHtml);
  });
});
