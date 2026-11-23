const STATIC_IMAGE_CACHE = 'public, max-age=2592000, stale-while-revalidate=86400'
// Public pages have no camera or microphone. Logged-in routes that capture
// video, audio, or a barcode override this after the catch-all header.
const PUBLIC_PERMISSIONS = 'camera=(), microphone=(), geolocation=()'
const CAMERA_AND_MIC = 'camera=(self), microphone=(self), geolocation=()'
const CAMERA_ONLY = 'camera=(self), microphone=(), geolocation=()'

/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: () => 'build-' + Date.now(),
  // Retired public pages: send visitors to the home page
  redirects: async () => [
    // 308 when the request reaches Next. A Vercel domain redirect can 307 www
    // before this runs; that setting lives in the dashboard, not this repo.
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'www.cytronai.com' }],
      destination: 'https://cytronai.com/:path*',
      permanent: true,
    },
    { source: '/landing', destination: '/', permanent: true },
    { source: '/solutions/:path*', destination: '/', permanent: true },
    // Short links into the multi-page site (temporary while the structure settles)
    { source: '/audit', destination: '/contact', permanent: false },
    { source: '/booking', destination: '/contact', permanent: false },
    { source: '/free-audit', destination: '/contact', permanent: false },
    { source: '/industries', destination: '/use-cases', permanent: false },
    { source: '/faq', destination: '/pricing#faq', permanent: false },
    { source: '/how', destination: '/how-it-works', permanent: false },
    { source: '/clinics', destination: '/use-cases', permanent: true },
    { source: '/clinics/:path*', destination: '/use-cases', permanent: true },
    { source: '/trades', destination: '/use-cases', permanent: true },
    { source: '/trades/:path*', destination: '/use-cases', permanent: true },
    { source: '/real-estate', destination: '/use-cases', permanent: true },
    { source: '/real-estate/:path*', destination: '/use-cases', permanent: true },
    { source: '/hospitality', destination: '/use-cases', permanent: true },
    { source: '/hospitality/:path*', destination: '/use-cases', permanent: true },
    { source: '/retail', destination: '/use-cases', permanent: true },
    { source: '/retail/:path*', destination: '/use-cases', permanent: true },
    { source: '/professional-services', destination: '/use-cases', permanent: true },
    { source: '/professional-services/:path*', destination: '/use-cases', permanent: true },
  ],
  headers: async () => [
    // Immutable static assets (production only: in dev the chunk names don't change, so the browser would keep stale code)
    ...(process.env.NODE_ENV === 'production'
      ? [{
          source: '/_next/static/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ],
        }]
      : []),
    // Unfingerprinted marketing images. immutable is reserved for hashed /_next/static files.
    {
      source: '/icon.svg',
      headers: [{ key: 'Cache-Control', value: STATIC_IMAGE_CACHE }],
    },
    {
      source: '/marketing/integrations/:file(.*\\.svg)',
      headers: [{ key: 'Cache-Control', value: STATIC_IMAGE_CACHE }],
    },
    {
      source: '/backoffice/video/:file(.*-poster\\.webp)',
      headers: [{ key: 'Cache-Control', value: STATIC_IMAGE_CACHE }],
    },
    // API routes — no cache
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store' },
      ],
    },
    // Security headers on all pages. Permissions-Policy is closed here;
    // the device routes below overwrite it because later matches win.
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: PUBLIC_PERMISSIONS },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            // Next.js inline bootstrap scripts have no nonce hook that stays static.
            // 'unsafe-inline' stays until that can be done without dynamic rendering.
            "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
            // Supabase, Stripe, external APIs
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://backend.blotato.com https://app.ayrshare.com https://api.outstand.so https://*.n8n.cloud",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "media-src 'self' blob: https:",
            "font-src 'self' data:",
            "frame-src https://js.stripe.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; '),
        },
      ],
    },
    // Vercel adds Access-Control-Allow-Origin: * on prerendered HTML and public
    // files unless a route header replaces it. No API route is a public
    // cross-origin API, so those responses are left without a CORS header.
    {
      source: '/((?!api(?:/|$)).*)',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://cytronai.com' },
      ],
    },
    { source: '/marketing', headers: [{ key: 'Permissions-Policy', value: CAMERA_AND_MIC }] },
    { source: '/operator', headers: [{ key: 'Permissions-Policy', value: CAMERA_ONLY }] },
    { source: '/warehouse/scan', headers: [{ key: 'Permissions-Policy', value: CAMERA_ONLY }] },
    { source: '/warehouse/pick', headers: [{ key: 'Permissions-Policy', value: CAMERA_ONLY }] },
  ],
}

export default nextConfig
