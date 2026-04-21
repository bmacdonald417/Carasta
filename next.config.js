/** @type {import('next').NextConfig} */
const nextConfig = {
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
