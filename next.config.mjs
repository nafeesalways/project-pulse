/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent MongoDB from being bundled in the client
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        dns: false,
        tls: false,
        fs: false,
        'mongodb-client-encryption': false,
      };
    }
    return config;
  },
  // Exclude MongoDB from serverless function bundling
  experimental: {
    serverComponentsExternalPackages: ['mongodb'],
  },
};

export default nextConfig;
