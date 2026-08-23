/**
 * Railway / production: tek process — Express API + Next.js frontend
 */
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend');

if (!process.env.API_BASE_URL && process.env.RAILWAY_PUBLIC_DOMAIN) {
  process.env.API_BASE_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
}

process.chdir(backendDir);

const { createApp } = await import(pathToFileURL(path.join(backendDir, 'src/app.js')).href);
const { getUploadDir } = await import(pathToFileURL(path.join(backendDir, 'src/utils/uploads.js')).href);

const require = createRequire(path.join(frontendDir, 'package.json'));
const next = require('next');

const PORT = Number(process.env.PORT) || 3000;
const app = createApp();

const nextApp = next({
  dev: false,
  dir: frontendDir,
});
const handle = nextApp.getRequestHandler();

await nextApp.prepare();

// API + /uploads already mounted — remaining traffic → Next.js
app.use((req, res) => handle(req, res));

app.use((err, _req, res, _next) => {
  console.error('Server Error:', err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Şirin Kids (API + Web) running on 0.0.0.0:${PORT}`);
  console.log(`Uploads dir: ${getUploadDir()}`);
  console.log(`API_BASE_URL: ${process.env.API_BASE_URL || '(unset)'}`);
});
