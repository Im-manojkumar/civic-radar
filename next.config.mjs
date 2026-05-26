/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API calls to /api/v1/* are handled by Vercel Python serverless functions
  // No proxy rewrites needed in production
};

export default nextConfig;
