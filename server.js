/**
 * CARDANGO Backend — Entry Point
 *
 * Thin dispatcher that delegates to route modules:
 *   routes/auth.js   → /api/health, /api/auth/*, /api/user/sync
 *   routes/cards.js  → /api/cards, /api/upload-image, /api/upload-image-url
 *   routes/trades.js → /api/trades/*
 *   routes/export.js → /api/export-sql
 *
 * Static files are served from the project root directory.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const http = require('http');
const fs   = require('fs');

const { setCors } = require('./lib/middleware');

const PUBLIC_DIR = path.join(__dirname, 'public');

// Route modules
const authRoutes   = require('./routes/auth');
const cardsRoutes  = require('./routes/cards');
const tradesRoutes = require('./routes/trades');
const exportRoutes = require('./routes/export');

// ── MIME types for static file serving ──────────────────────────────────────
const MIME_TYPES = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.sql':  'text/plain'
};

const PORT = process.env.PORT || 3000;

// ── HTTP server ──────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const reqUrl   = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const pathname = reqUrl.pathname;

  // CORS preflight
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── API routing ────────────────────────────────────────────────────────────
  try {
    if (await authRoutes.handle(req, res, pathname))             return;
    if (await cardsRoutes.handle(req, res, pathname, reqUrl))    return;
    if (await tradesRoutes.handle(req, res, pathname, reqUrl))   return;
    if (await exportRoutes.handle(req, res, pathname))           return;
  } catch (err) {
    console.error('Unhandled route error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
    return;
  }

  // ── Static file serving ────────────────────────────────────────────────────
  if (pathname.startsWith('/.well-known/') || pathname === '/favicon.ico') {
    const checkPath = path.join(PUBLIC_DIR, pathname);
    if (!fs.existsSync(checkPath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
  }

  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext         = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`  CARDANGO Server running on port ${PORT}`);
  console.log(`  Local URL:   http://localhost:${PORT}`);
});

process.on('uncaughtException',   err => console.error('Uncaught Exception:', err.message));
process.on('unhandledRejection',  reason => console.error('Unhandled Rejection:', reason));
