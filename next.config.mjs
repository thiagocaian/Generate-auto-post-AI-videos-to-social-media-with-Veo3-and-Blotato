/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  generateBuildId: () => 'build-' + Date.now(),
  headers: async () => [{
    source: '/:path*',
    headers: [
      { key: 'Cache-Control', value: 'no-store, must-revalidate' },
    ],
  }],
};

export default nextConfig;
