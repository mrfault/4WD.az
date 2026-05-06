import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/4x4-gallery/:path*',
        destination: '/gallery',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: true,
  },
};

export default nextConfig;
