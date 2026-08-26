import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../db/pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Source of truth: Postgres `uploaded_files`.
 * Disk is only a cache (optional Railway volume speeds repeats).
 */
export function getUploadDir() {
  const dir =
    process.env.UPLOAD_DIR ||
    path.join(__dirname, '../uploads');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return dir;
}

/** Always same-origin path — browser hits Express → Postgres. */
export function buildPublicUploadUrl(filename) {
  return `/uploads/${filename}`;
}

/** Collapse absolute/old URLs to `/uploads/<file>` so domain/redeploy changes do not break src. */
export function normalizeUploadUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('data:')) return url;
  const match = url.match(/\/uploads\/([^/?#]+)/i);
  if (match) return `/uploads/${match[1]}`;
  return url;
}

export function isUploadPath(url) {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('/uploads/') || /\/uploads\/[^/?#]+/i.test(url) || url.startsWith('data:');
}

export async function saveUploadedFile({ filename, mimeType, buffer }) {
  const payload = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  await pool.query(
    `INSERT INTO uploaded_files (filename, mime_type, data, size_bytes)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (filename) DO UPDATE SET
       mime_type = EXCLUDED.mime_type,
       data = EXCLUDED.data,
       size_bytes = EXCLUDED.size_bytes`,
    [filename, mimeType, payload, payload.length]
  );

  // Best-effort disk cache (may be ephemeral on Railway without a volume)
  try {
    fs.writeFileSync(path.join(getUploadDir(), filename), payload);
  } catch (err) {
    console.warn('Upload disk cache write failed (DB copy is authoritative):', err.message);
  }

  return { filename, url: buildPublicUploadUrl(filename) };
}

export async function getUploadedFile(filename) {
  const safe = path.basename(filename || '');
  if (!safe || safe !== filename || safe.includes('..')) {
    return null;
  }

  // DB first — survives container redeploy
  const { rows } = await pool.query(
    'SELECT mime_type, data FROM uploaded_files WHERE filename = $1',
    [safe]
  );

  if (rows.length) {
    const data = Buffer.isBuffer(rows[0].data)
      ? rows[0].data
      : Buffer.from(rows[0].data);

    try {
      fs.writeFileSync(path.join(getUploadDir(), safe), data);
    } catch {
      /* ignore */
    }

    return { mime_type: rows[0].mime_type, data };
  }

  // Legacy: file only on disk (pre-persistence uploads) — works until next redeploy
  const diskPath = path.join(getUploadDir(), safe);
  if (fs.existsSync(diskPath)) {
    const data = fs.readFileSync(diskPath);
    // Opportunistically mirror into DB so the next redeploy keeps it
    try {
      await pool.query(
        `INSERT INTO uploaded_files (filename, mime_type, data, size_bytes)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (filename) DO NOTHING`,
        [safe, mimeFromExt(safe), data, data.length]
      );
    } catch {
      /* ignore */
    }
    return { mime_type: mimeFromExt(safe), data };
  }

  return null;
}

function mimeFromExt(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.heic': 'image/heic',
  };
  return map[ext] || 'application/octet-stream';
}
