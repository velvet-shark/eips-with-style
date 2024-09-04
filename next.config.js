/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/:proposalType/:slug",
        destination: "/:proposalType/:slug"
      },
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap"
      }
    ];
  }
};

module.exports = nextConfig;
