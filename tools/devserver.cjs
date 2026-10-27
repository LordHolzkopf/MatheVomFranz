// Entwicklungsserver: liefert src/ aus und greift für fehlende Dateien auf
// public/ zurück – so wie beim Deployment, wo beide Ordner zusammengeführt
// werden. Aufruf: node tools/devserver.cjs [port]
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dirs = [path.join(root, "src"), path.join(root, "public"), root];
const port = Number(process.argv[2]) || 8800;
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".yml": "text/yaml; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".gif": "image/gif", ".ico": "image/x-icon", ".mp3": "audio/mpeg",
  ".wav": "audio/wav", ".ogg": "audio/ogg", ".woff": "font/woff",
  ".woff2": "font/woff2", ".ttf": "font/ttf", ".pdf": "application/pdf",
};

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  for (const d of dirs) {
    const f = path.join(d, p);
    if (!f.startsWith(d)) break;
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      res.writeHead(200, { "Content-Type": types[path.extname(f).toLowerCase()] || "application/octet-stream" });
      fs.createReadStream(f).pipe(res);
      return;
    }
  }
  res.writeHead(404);
  res.end("not found");
}).listen(port, () => console.log("http://localhost:" + port));
