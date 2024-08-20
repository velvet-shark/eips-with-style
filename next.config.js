/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/:proposalType/:slug",
        destination: "/:proposalType/:slug"
      }
    ];
  }
};

module.exports = nextConfig;
