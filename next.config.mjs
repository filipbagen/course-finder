/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase serverless function timeout for Vercel
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },
  // Optimize for production
  productionBrowserSourceMaps: false,
  swcMinify: true,
  // Configure Vercel specific optimizations
  poweredByHeader: false,
  // Configure database connection reuse
  runtime: 'nodejs',
};

export default nextConfig;
