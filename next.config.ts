import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/psychrolib/:path*',
        destination: 'https://api.proexergy.com/psychrolib/:path*',
      },
      {
        source: '/api/unitconvert/:path*',
        destination: 'https://api.proexergy.com/unitconvert/:path*',
      },
    ];
  },
};

export default nextConfig;
