/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    typedRoutes: true,
  },
  // Enable standalone output for Docker production builds
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
    ],
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001/api/v1',
  },
  webpack: (config, { isServer }) => {
    // Fix for Konva.js in Next.js SSR
    if (isServer) {
      // On server side, mock Konva to avoid Node.js canvas dependency
      config.resolve.alias = {
        ...config.resolve.alias,
        'konva': false,
        'react-konva': false,
      };
    } else {
      // On client side, use browser version of Konva
      config.resolve.alias = {
        ...config.resolve.alias,
        'konva/lib/index-node.js': 'konva/lib/index.js',
      };
    }
    
    // External canvas dependency for SSR
    config.externals = [
      ...(config.externals || []),
      {
        'canvas': 'canvas',
      },
    ];
    
    return config;
  },
}

module.exports = nextConfig 