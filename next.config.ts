import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'
    
    const baseDirectives = [
      "default-src 'self'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://images.unsplash.com",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "frame-src https://www.google.com https://www.youtube.com https://player.vimeo.com https://js.stripe.com",
    ]
    
    const scriptDirectives = isDev
      ? [
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
          "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
          "script-src-attr 'self' 'unsafe-inline'",
        ]
      : [
          "script-src 'self' 'unsafe-inline' https://js.stripe.com",
          "script-src-elem 'self' 'unsafe-inline' https://js.stripe.com",
        ]
    
    const connectDirectives = ["connect-src 'self' https: ws: wss: https://api.stripe.com"]

    const csp = [...baseDirectives, ...scriptDirectives, ...connectDirectives].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'geolocation=(self), microphone=(), camera=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

// Sentry configuration
const sentryOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: 'kurs-og-kompetansesystemer-as',
  project: 'javascript-nextjs',
};

export default withSentryConfig(nextConfig, sentryOptions);
