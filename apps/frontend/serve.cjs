/**
 * Production SPA Server for GAMILIT Frontend
 *
 * Serves the Vite build output (dist/) with SPA fallback.
 * All routes that don't match a static file return index.html,
 * allowing React Router to handle client-side routing.
 *
 * Usage: node serve.cjs [--port 4005] [--host 0.0.0.0]
 *
 * @author GAMILIT Team
 * @date 2026-02-23
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Parse CLI arguments
const args = process.argv.slice(2);
const getArg = (name, defaultVal) => {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
};

const PORT = parseInt(getArg('--port', process.env.PORT || '4005'), 10);
const HOST = getArg('--host', process.env.HOST || '0.0.0.0');
const DIST_DIR = path.join(__dirname, 'dist');

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};

// Cache index.html in memory for fast SPA fallback
let indexHtml;
try {
  indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'));
} catch {
  console.error(`[serve] ERROR: dist/index.html not found. Run "npm run build" first.`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = path.join(DIST_DIR, url.pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      fs.statSync(filePath); // throws if not found
    }
  } catch {
    // File doesn't exist -> SPA fallback: serve index.html
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(indexHtml);
    return;
  }

  // Serve static file
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Immutable cache for hashed assets (Vite adds content hash)
  const isHashedAsset = filePath.includes('/assets/') && ext !== '.html';
  const cacheControl = isHashedAsset
    ? 'public, max-age=31536000, immutable'
    : 'no-cache';

  const stream = fs.createReadStream(filePath);
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': cacheControl,
  });
  stream.pipe(res);
  stream.on('error', () => {
    // Fallback if read fails
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(indexHtml);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`
=====================================================================
  GAMILIT Frontend SPA Server
  URL: http://${HOST}:${PORT}
  Mode: production (SPA fallback enabled)
  Serving: ${DIST_DIR}
=====================================================================
  `);

  // Signal PM2 that the app is ready
  if (typeof process.send === 'function') {
    process.send('ready');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[serve] SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[serve] SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});
