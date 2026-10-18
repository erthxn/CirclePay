/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Old /test/card page → new /studio route
      { source: '/test/card', destination: '/studio', permanent: false },
    ];
  },
};

module.exports = nextConfig;
