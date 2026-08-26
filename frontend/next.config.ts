import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost', port: '4000' },
      { protocol: 'http', hostname: '127.0.0.1', port: '4000' },
      { protocol: 'https', hostname: '**.up.railway.app' },
      { protocol: 'https', hostname: '**.railway.app' },
    ],
  },
  // Local `next dev` only — production unified server serves /uploads via Express
  async rewrites() {
    if (process.env.NODE_ENV === 'production') return [];
    const target = (process.env.API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
    return [
      {
        source: '/uploads/:path*',
        destination: `${target}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
