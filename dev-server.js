// dev-server.js - Servidor de desarrollo local para Insightología
// Sirve archivos estáticos y la función serverless /api/oracle.js sin dependencias externas

const http = require('http');
const fs = require('fs');
const path = require('path');
const oracleHandler = require('./api/oracle.js');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Endpoint de API /api/oracle
  if (pathname === '/api/oracle' || pathname === '/api/oracle.js') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', async () => {
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch (e) {
        req.body = {};
      }

      // Mock de res.status().json() para compatibilidad Vercel
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(data));
      };

      try {
        await oracleHandler(req, res);
      } catch (err) {
        console.error('Error en handler:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Archivos estáticos
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Seguridad: evitar directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n🔮 Servidor de Insightología corriendo en: http://localhost:${PORT}`);
  console.log(`📡 Endpoint de API disponible en: http://localhost:${PORT}/api/oracle\n`);
});
