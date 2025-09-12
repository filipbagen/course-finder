/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages configuration
  serverExternalPackages: ['@prisma/client', 'bcrypt'],

  // Optimize for production
  productionBrowserSourceMaps: false,

  // Configure Vercel specific optimizations
  poweredByHeader: false,

  // Enable strict mode for better development
  reactStrictMode: true,

  // Configure server-side options
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
