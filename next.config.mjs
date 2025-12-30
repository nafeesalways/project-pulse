/** @type {import('next').NextConfig} */
const nextConfig = {
  // Externalize MongoDB from webpack
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'mongodb': 'commonjs mongodb',
        'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
      });
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['mongodb'],
  },
};

export default nextConfig;
