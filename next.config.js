/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "plantcare-production-52be.up.railway.app",
        pathname: "/uploads/**",
      },
    ],
  },
};

module.exports = nextConfig;
