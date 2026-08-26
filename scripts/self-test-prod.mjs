/**
 * Prod-ready self-test: soft-delete visibility + upload persistence across "redeploy"
 * Usage: node scripts/self-test-prod.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');

process.chdir(backendDir);

const { default: pool } = await import(pathToFileURL(path.join(backendDir, 'src/db/pool.js')).href);
const { createApp } = await import(pathToFileURL(path.join(backendDir, 'src/app.js')).href);
const { getUploadDir, saveUploadedFile, getUploadedFile } = await import(
  pathToFileURL(path.join(backendDir, 'src/utils/uploads.js')).href
);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const app = createApp();
const server = await new Promise((resolve) => {
  const s = app.listen(0, '127.0.0.1', () => resolve(s));
});
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;

async function json(url) {
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

try {
  // Ensure schema columns/tables exist
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS uploaded_files (
      filename VARCHAR(255) PRIMARY KEY,
      mime_type VARCHAR(100) NOT NULL,
      data BYTEA NOT NULL,
      size_bytes INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const { rows: products } = await pool.query(
    `SELECT id, slug, name FROM products WHERE is_active = TRUE ORDER BY id LIMIT 1`
  );
  assert(products.length > 0, 'Test için en az 1 aktif ürün gerekli (npm run db:seed)');

  const target = products[0];
  console.log(`→ Soft-delete test product: #${target.id} ${target.slug}`);

  // Soft delete
  await pool.query(`UPDATE products SET is_active = FALSE, updated_at = NOW() WHERE id = $1`, [target.id]);

  const list = await json(`${base}/api/products?limit=100`);
  assert(list.status === 200, `products list status ${list.status}`);
  assert(
    !list.body.data.some((p) => p.id === target.id),
    'Silinen ürün /api/products listesinde görünmemeli'
  );

  const sections = await json(`${base}/api/products/sections`);
  assert(sections.status === 200, `sections status ${sections.status}`);
  const sectionProducts = sections.body.data.flatMap((s) => s.products);
  assert(
    !sectionProducts.some((p) => p.id === target.id),
    'Silinen ürün ana sayfa sections içinde görünmemeli'
  );

  const detail = await json(`${base}/api/products/${target.slug}`);
  assert(detail.status === 404, `Silinen ürün detay 404 olmalı, got ${detail.status}`);

  const search = await json(`${base}/api/search?q=${encodeURIComponent(target.name.split(' ')[0])}`);
  assert(search.status === 200, `search status ${search.status}`);
  assert(
    !search.body.data.some((p) => p.id === target.id),
    'Silinen ürün aramada görünmemeli'
  );

  // Restore product for later use
  await pool.query(`UPDATE products SET is_active = TRUE, updated_at = NOW() WHERE id = $1`, [target.id]);
  console.log('✓ Soft-delete: storefront hides deleted product');

  // Upload persistence (simulate redeploy: delete disk file, serve from DB)
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  const filename = `selftest-${Date.now()}.png`;
  const saved = await saveUploadedFile({
    filename,
    mimeType: 'image/png',
    buffer: png,
  });
  assert(saved.url === `/uploads/${filename}`, `relative url expected, got ${saved.url}`);

  const diskPath = path.join(getUploadDir(), filename);
  assert(fs.existsSync(diskPath), 'Dosya diske yazılmalı');

  // "Redeploy": wipe disk file
  fs.unlinkSync(diskPath);
  assert(!fs.existsSync(diskPath), 'Disk dosyası silinmiş olmalı');

  const fromDb = await getUploadedFile(filename);
  assert(fromDb, 'Postgres fallback dosyayı döndürmeli');
  assert(fromDb.data.equals(png), 'DB içeriği orijinal PNG ile eşleşmeli');

  const imgRes = await fetch(`${base}/uploads/${filename}`);
  assert(imgRes.status === 200, `/uploads serve status ${imgRes.status}`);
  const served = Buffer.from(await imgRes.arrayBuffer());
  assert(served.equals(png), 'HTTP response disk yokken DB’den servis etmeli');
  assert(fs.existsSync(diskPath), 'Serve sonrası disk cache restore edilmeli');

  // Cleanup test upload
  fs.unlinkSync(diskPath);
  await pool.query('DELETE FROM uploaded_files WHERE filename = $1', [filename]);
  console.log('✓ Upload persistence: survives disk wipe (redeploy simulation)');

  console.log('\nAll self-tests passed.');
} catch (err) {
  console.error('\nSelf-test FAILED:', err.message);
  process.exitCode = 1;
} finally {
  server.close();
  await pool.end();
}
