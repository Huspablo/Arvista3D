import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

// Extract CDN hostname from R2_PUBLIC_URL so next/image can proxy it for WebGL textures.
// Falls back gracefully if the var is unset (e.g. in CI without env).
const cdnRemotePattern = (() => {
  try {
    const host = new URL(process.env.R2_PUBLIC_URL ?? '').hostname
    return host ? [{ protocol: 'https' as const, hostname: host }] : []
  } catch {
    return []
  }
})()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      ...cdnRemotePattern,
    ],
  },
  // Proxy Clerk API calls through Next.js server to avoid CORS.
  // Domain is decoded from the publishable key — no extra env var needed.
  async rewrites() {
    const key     = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''
    const encoded = key.split('_')[2] ?? ''
    if (!encoded) return []
    const domain  = `https://${Buffer.from(encoded, 'base64').toString().replace(/\$$/, '')}`
    return [
      {
        source:      '/api/clerk-proxy/:path*',
        destination: `${domain}/:path*`,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org:     'personal-afj',
  project: 'javascript-nextjs',

  // Tunnel para evitar que los ad-blockers bloqueen los eventos de Sentry
  tunnelRoute: '/monitoring',

  // Oculta los source maps del bundle público y los sube a Sentry en el build
  // Requiere SENTRY_AUTH_TOKEN en .env.local
  sourcemaps: {
    filesToDeleteAfterUpload: ['.next/static/**/*.map'],
  },

  silent: !process.env.CI,
})
