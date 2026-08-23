import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Railway volume: UPLOAD_DIR=/data/uploads
 * Local default: backend/src/uploads
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
