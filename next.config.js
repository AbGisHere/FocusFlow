/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  // New turbopack configuration (replaces experimental.turbo)
  turbopack: {
    // Turbopack specific configurations can go here
  },
  // Disable turbopack in development if needed
  experimental: {
    // Other experimental features can go here
  },
};

export default nextConfig;
