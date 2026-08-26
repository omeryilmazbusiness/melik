import type { NextConfig } from 'next';
import path from 'path';

const uploadProxyTarget = process.env.API_BASE_URL || 'http://localhost:4000';

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
  // Local next:3000 → proxy /uploads to Express so relative image URLs work
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${uploadProxyTarget.replace(/\/$/, '')}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
