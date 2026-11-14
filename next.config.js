/** @type {import('next').NextConfig} */
// The whole site is static HTML/CSS/JS in /public. This config only serves
// public/index.html at "/" so the Vercel project (framework: Next.js) keeps working.
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [{ source: '/', destination: '/index.html' }],
    };
  },
};
