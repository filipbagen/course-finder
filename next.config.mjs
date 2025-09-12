/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages configuration
  serverExternalPackages: ['@prisma/client', 'bcrypt'],

  // Optimize for production
  productionBrowserSourceMaps: false,

  // Configure Vercel specific optimizations
  poweredByHeader: false,
};

export default nextConfig;
