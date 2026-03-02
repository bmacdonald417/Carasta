/** @type {import('next').NextConfig} */
const nextConfig = {
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
