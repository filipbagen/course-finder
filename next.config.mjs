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

  // Add retry behavior for network requests
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },

  // Configure server-side options
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Adding optimized options for production
    optimizePackageImports: ['@prisma/client'],
  },
};

export default nextConfig;
