import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('build/client');
const port = Number(process.env.PORT ?? 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.data': 'text/x-script', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.txt': 'text/plain' };
http.createServer(async (req, res) => {
  try {
    const path = resolve(root, `.${decodeURIComponent(new URL(req.url, 'http://localhost').pathname)}`);
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    let file = path;
    try { if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html'); }
    catch { file = extname(path) ? path : resolve(path, 'index.html'); }
    const bytes = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(bytes);
  } catch { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); res.end('<title>Not found — NOT YET LAND</title><h1>Uncharted ground.</h1><a href="/atlas">Return to the atlas</a>'); }
}).listen(port, '0.0.0.0', () => console.log(`NOT YET LAND preview: http://localhost:${port}`));
