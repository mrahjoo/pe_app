import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/psychrolib/:path*',
        destination: 'https://api.proexergy.com/psychrolib/:path*',
      },
    ];
  },
};

export default nextConfig;
