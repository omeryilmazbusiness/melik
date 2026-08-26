import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../db/pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Railway volume (optional): UPLOAD_DIR=/data/uploads
 * Local default: backend/src/uploads
 * Files are always mirrored to Postgres (uploaded_files) so redeploys keep images.
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

export function buildPublicUploadUrl(filename) {
  // Same-origin relative URL — survives domain changes; Next rewrites /uploads in local dev
  return `/uploads/${filename}`;
}

export async function saveUploadedFile({ filename, mimeType, buffer }) {
  const diskPath = path.join(getUploadDir(), filename);
  fs.writeFileSync(diskPath, buffer);

  await pool.query(
    `INSERT INTO uploaded_files (filename, mime_type, data, size_bytes)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (filename) DO UPDATE SET
       mime_type = EXCLUDED.mime_type,
       data = EXCLUDED.data,
       size_bytes = EXCLUDED.size_bytes`,
    [filename, mimeType, buffer, buffer.length]
  );

  return { filename, url: buildPublicUploadUrl(filename) };
}

export async function getUploadedFile(filename) {
  const safe = path.basename(filename);
  if (!safe || safe !== filename || safe.includes('..')) {
    return null;
  }

  const diskPath = path.join(getUploadDir(), safe);
  if (fs.existsSync(diskPath)) {
    return {
      mime_type: mimeFromExt(safe),
      data: fs.readFileSync(diskPath),
    };
  }

  const { rows } = await pool.query(
    'SELECT mime_type, data FROM uploaded_files WHERE filename = $1',
    [safe]
  );

  if (!rows.length) return null;

  // Restore to disk cache for subsequent hits
  try {
    fs.writeFileSync(diskPath, rows[0].data);
  } catch {
    /* ignore disk write failures (e.g. read-only) */
  }

  return {
    mime_type: rows[0].mime_type,
    data: rows[0].data,
  };
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
