/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reduces parallel static-generation workers so `next build` opens fewer concurrent
  // Prisma pools against Railway Postgres (mitigates FATAL: too many clients already).
  experimental: {
    staticGenerationMaxConcurrency: 2,
    staticGenerationMinPagesPerWorker: 999,
  },
  async redirects() {
    return [
      { source: "/forums", destination: "/discussions", permanent: true },
      {
        source: "/forums/:path*",
        destination: "/discussions/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "tools.applemediaservices.com", pathname: "/**" },
      { protocol: "https", hostname: "play.google.com", pathname: "/**" },
    ],
  },
};

module.exports = nextConfig;
