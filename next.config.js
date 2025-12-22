/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // SEO and performance optimizations
  compress: true,
  poweredByHeader: false,
  // Build optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-select', '@radix-ui/react-label'],
  },
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'trust.descope.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.descope.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
  // Static file configuration (migrated from Bun serve.static)
  // Note: output: 'export' removed to allow API routes to function
  trailingSlash: true,
  // Environment variables support (migrated from Bun env configuration)
  env: {
    // Support for BUN_PUBLIC_* environment variables
    // These will be available as NEXT_PUBLIC_* in Next.js
  },
}

export default nextConfig