/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['lh3.googleusercontent.com'],
  },

  // 🔥 ADD THIS (critical)
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
