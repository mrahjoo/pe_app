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
        destination: 'https://api.proexergy.com/unitconvert/:path*/',
      },
      {
        source: '/api/refprop/:path*',
        destination: 'https://api.proexergy.com/refprop/:path*/',
      },
      {
        source: '/api/comfort/:path*',
        destination: 'https://api.proexergy.com/comfort/:path*',
      },
    ];
  },
};

export default nextConfig;
