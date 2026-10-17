/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // The old /test/card page is replaced by the new premium /studio route.
      { source: '/test/card', destination: '/studio', permanent: false },
    ];
  },
};

module.exports = nextConfig;
