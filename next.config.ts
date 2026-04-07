import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  // Proxy /api/v1/* to the Railway backend when NEXT_PUBLIC_API_URL is a
  // relative path (i.e. in production). This makes cookies first-party
  // (chapbook.vercel.app), avoiding third-party cookie blocking in incognito
  // and strict browser privacy modes.
  // In local dev NEXT_PUBLIC_API_URL is an absolute localhost URL, so no
  // rewrite is needed.
  async rewrites() {
    const isProxied = process.env.NEXT_PUBLIC_API_URL?.startsWith("/");
    if (!isProxied) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://chapbook-api.up.railway.app/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
