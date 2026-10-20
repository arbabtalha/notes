#!/usr/bin/env node
// Zero-dependency static server for Notis.
// Usage: node server.mjs [port]   (or PORT=8080 node server.mjs)
// Binds 0.0.0.0 so it also works inside containers/preview sandboxes.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const PORT = Number(process.env.PORT || process.argv[2] || 8080);
const HOST = process.env.HOST || '0.0.0.0';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.webm': 'audio/webm'
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const p = join(ROOT, normalize(decoded).replace(/^(\.\.[/\\])+/, ''));
  return p === ROOT || p.startsWith(ROOT + sep) ? p : null;
}

async function resolveFile(urlPath) {
  let file = safePath(urlPath);
  if (!file) return null;
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, 'index.html');
    else return file;
  } catch {
    if (extname(file)) return null; // missing asset: real 404
    file = join(ROOT, 'index.html'); // app route fallback
  }
  try {
    const info = await stat(file);
    if (info.isFile()) return file;
  } catch {
    return null;
  }
  return null;
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end('Method Not Allowed');
    return;
  }

  const file = (await resolveFile(req.url || '/')) || join(ROOT, '404.html');
  let notFound = false;
  try {
    await stat(file);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }
  notFound = file.endsWith('404.html');

  res.writeHead(notFound ? 404 : 200, {
    'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(file).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Notis running at http://localhost:${PORT}/  (bound to ${HOST}:${PORT})`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => server.close(() => process.exit(0)));
}
