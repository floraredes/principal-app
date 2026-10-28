import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    // Si estás usando Next.js 15 con PPR o Instant Navigation
    ppr: false,
  },
};

export default nextConfig;