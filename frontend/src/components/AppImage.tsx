'use client';

import Image, { type ImageProps } from 'next/image';

/**
 * Next/Image treats `/uploads/...` as files under `public/` — they are not.
 * Uploads are served by Express from Postgres. Use unoptimized so the browser
 * requests `/uploads/...` directly (survives redeploy).
 */
function toSrc(src: ImageProps['src']): ImageProps['src'] {
  if (typeof src !== 'string') return src;
  if (src.startsWith('data:')) return src;
  const match = src.match(/\/uploads\/([^/?#]+)/i);
  if (match) return `/uploads/${match[1]}`;
  return src;
}

function needsUnoptimized(src: ImageProps['src']): boolean {
  if (typeof src !== 'string') return false;
  return src.startsWith('/uploads/') || src.includes('/uploads/') || src.startsWith('data:');
}

export default function AppImage({ src, alt, ...props }: ImageProps) {
  const resolved = toSrc(src);
  return (
    <Image
      {...props}
      src={resolved}
      alt={alt}
      unoptimized={needsUnoptimized(resolved) || props.unoptimized}
    />
  );
}
