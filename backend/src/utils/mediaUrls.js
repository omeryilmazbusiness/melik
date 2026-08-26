/**
 * Normalize product/banner image fields so clients always get `/uploads/<file>`
 * for locally hosted assets (works after redeploy via Postgres).
 */
import { normalizeUploadUrl } from '../utils/uploads.js';

function mapJsonImages(value) {
  if (value == null) return value;
  let arr = value;
  if (typeof value === 'string') {
    try {
      arr = JSON.parse(value);
    } catch {
      return value;
    }
  }
  if (!Array.isArray(arr)) return value;
  return arr.map((item) => (typeof item === 'string' ? normalizeUploadUrl(item) : item));
}

function mapColorVariants(value) {
  if (value == null) return value;
  let arr = value;
  if (typeof value === 'string') {
    try {
      arr = JSON.parse(value);
    } catch {
      return value;
    }
  }
  if (!Array.isArray(arr)) return value;
  return arr.map((v) =>
    v && typeof v === 'object'
      ? { ...v, image_url: normalizeUploadUrl(v.image_url) }
      : v
  );
}

export function normalizeProductRow(row) {
  if (!row) return row;
  return {
    ...row,
    image_url: normalizeUploadUrl(row.image_url),
    images: mapJsonImages(row.images),
    color_variants: mapColorVariants(row.color_variants),
  };
}

export function normalizeBannerRow(row) {
  if (!row) return row;
  return {
    ...row,
    image_url: normalizeUploadUrl(row.image_url),
  };
}

export function normalizePromoRow(row) {
  if (!row) return row;
  return {
    ...row,
    image_url: normalizeUploadUrl(row.image_url),
  };
}
