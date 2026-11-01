/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Support larger file headers if needed
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
