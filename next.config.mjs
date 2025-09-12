/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages configuration - properly configured for Next.js 15+
  serverExternalPackages: ['@prisma/client', 'bcrypt'],

  // Optimize for production
  productionBrowserSourceMaps: false,

  // Configure Vercel specific optimizations
  poweredByHeader: false,

  // Enable strict mode for better development
  reactStrictMode: true,

  // Configure server-side options
  experimental: {
    // Remove deprecated serverComponentsExternalPackages
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
