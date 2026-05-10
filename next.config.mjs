import { createRequire } from 'module'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimisation — allow Supabase Storage CDN domain
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'djirwwtijunzrpanfxwa.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Security headers applied to all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
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
      // Immutable cache for all Next.js static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Canonical redirects: strip trailing slashes
  trailingSlash: false,

  // Compress responses
  compress: true,

  // Strict mode for React
  reactStrictMode: true,

  // Bundle analyser (enabled via ANALYZE=true npm run build)
  ...(process.env.ANALYZE === 'true'
    ? {
        // @next/bundle-analyzer is applied via wrapper below
      }
    : {}),
}

export default nextConfig
