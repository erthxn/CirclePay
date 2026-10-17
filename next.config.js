/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // The old /test/card page is replaced by the new premium /studio route.
      { source: '/test/card', destination: '/studio/libraries', permanent: false },
      // /studio itself redirects to /studio/libraries (the default tab)
      { source: '/studio', destination: '/studio/libraries', permanent: false },
    ];
  },
};

module.exports = nextConfig;
