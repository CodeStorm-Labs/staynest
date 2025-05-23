/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.pravatar.cc', 'picsum.photos', 'images.unsplash.com'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig 