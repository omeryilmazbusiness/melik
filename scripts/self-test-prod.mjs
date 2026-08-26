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
  await pool.query(`ALTER TABLE products ALTER COLUMN section DROP NOT NULL`);
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

  // Absolute legacy URL → normalized path; DB is source of truth
  const { normalizeUploadUrl } = await import(
    pathToFileURL(path.join(backendDir, 'src/utils/uploads.js')).href
  );
  assert(
    normalizeUploadUrl('https://x.up.railway.app/uploads/a.jpg') === '/uploads/a.jpg',
    'absolute upload URL normalize edilmeli'
  );
  assert(normalizeUploadUrl('/uploads/b.png') === '/uploads/b.png', 'relative path korunmalı');

  const fn2 = `selftest-dbfirst-${Date.now()}.png`;
  await saveUploadedFile({ filename: fn2, mimeType: 'image/png', buffer: png });
  fs.unlinkSync(path.join(getUploadDir(), fn2));
  const again = await getUploadedFile(fn2);
  assert(again && again.data.equals(png), 'DB-first: disk yokken Postgres’ten okumalı');
  const absFetch = await fetch(`${base}/uploads/${fn2}`);
  assert(absFetch.status === 200, 'normalized path Express üzerinden 200 dönmeli');
  fs.unlinkSync(path.join(getUploadDir(), fn2));
  await pool.query('DELETE FROM uploaded_files WHERE filename = $1', [fn2]);
  console.log('✓ Upload URL normalize + DB-first serve');

  // Optional campaign/section: empty → no campaign; selected → appears in that section
  const { parseOptionalSection } = await import(
    pathToFileURL(path.join(backendDir, 'src/utils/helpers.js')).href
  );
  assert(parseOptionalSection(null).value === null, 'null section → kampanya yok');
  assert(parseOptionalSection('').value === null, 'empty section → kampanya yok');
  assert(parseOptionalSection('yeni_sezon').value === 'yeni_sezon', 'yeni_sezon geçerli');
  assert(!parseOptionalSection('invalid').ok, 'geçersiz section reddedilmeli');

  const slug = `selftest-kampanya-${Date.now()}`;
  const { rows: catRows } = await pool.query(`SELECT id FROM categories ORDER BY id LIMIT 1`);
  assert(catRows.length > 0, 'Kategori gerekli');

  const { rows: inserted } = await pool.query(
    `INSERT INTO products (name, slug, price, section, category_id, image_url, is_active, in_stock)
     VALUES ($1, $2, 199, NULL, $3, 'https://picsum.photos/seed/selftest/100/100', TRUE, TRUE)
     RETURNING id`,
    [`Selftest Kampanyasız ${Date.now()}`, slug, catRows[0].id]
  );
  const noCampaignId = inserted[0].id;

  let sec = await json(`${base}/api/products/sections`);
  assert(
    !sec.body.data.flatMap((s) => s.products).some((p) => p.id === noCampaignId),
    'Kampanyasız ürün sections içinde olmamalı'
  );

  const detailOk = await json(`${base}/api/products/${slug}`);
  assert(detailOk.status === 200, 'Kampanyasız ürün detayda görünmeli');
  assert(detailOk.body.data.section === null, 'Detay section null olmalı');

  await pool.query(`UPDATE products SET section = 'firsat_urunler' WHERE id = $1`, [noCampaignId]);
  sec = await json(`${base}/api/products/sections`);
  const firsat = sec.body.data.find((s) => s.key === 'firsat_urunler');
  assert(
    firsat?.products.some((p) => p.id === noCampaignId),
    'Kampanya seçilince ilgili section’da görünmeli'
  );

  await pool.query(`UPDATE products SET section = NULL WHERE id = $1`, [noCampaignId]);
  sec = await json(`${base}/api/products/sections`);
  assert(
    !sec.body.data.flatMap((s) => s.products).some((p) => p.id === noCampaignId),
    'Kampanya temizlenince sections’tan çıkmalı'
  );

  // Admin API: create without section, then assign, then clear
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'SirinKids2026!';
  const loginRes = await fetch(`${base}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const loginBody = await loginRes.json();
  assert(loginRes.status === 200 && loginBody.data?.token, 'Admin login başarısız');
  const token = loginBody.data.token;

  const createRes = await fetch(`${base}/api/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: `Admin Kampanyasız ${Date.now()}`,
      price: 150,
      section: null,
      category_id: catRows[0].id,
      image_url: 'https://picsum.photos/seed/admin-selftest/100/100',
    }),
  });
  const created = await createRes.json();
  assert(createRes.status === 201, `Admin create status ${createRes.status}: ${JSON.stringify(created)}`);
  assert(created.data.section === null, 'Admin create section null olmalı');
  const adminProductId = created.data.id;

  const assignRes = await fetch(`${base}/api/admin/products/${adminProductId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ section: 'tek_fiyat' }),
  });
  const assigned = await assignRes.json();
  assert(assignRes.status === 200, `Admin assign status ${assignRes.status}`);
  assert(assigned.data.section === 'tek_fiyat', 'Kampanya atanmalı');

  const clearRes = await fetch(`${base}/api/admin/products/${adminProductId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ section: null }),
  });
  const cleared = await clearRes.json();
  assert(clearRes.status === 200, `Admin clear status ${clearRes.status}`);
  assert(cleared.data.section === null, 'Kampanya kaldırılabilmeli');

  await pool.query(`UPDATE products SET is_active = FALSE WHERE id IN ($1, $2)`, [
    noCampaignId,
    adminProductId,
  ]);
  console.log('✓ Optional campaign: boş = yok, seçilirse sections’ta');

  console.log('\nAll self-tests passed.');
} catch (err) {
  console.error('\nSelf-test FAILED:', err.message);
  process.exitCode = 1;
} finally {
  server.close();
  await pool.end();
}
