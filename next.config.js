/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // SEO and performance optimizations
  compress: true,
  poweredByHeader: false,
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: ['trust.descope.com', 'www.descope.com'],
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