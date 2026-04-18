import type { NextConfig } from 'next'

/**
 * Workflow SDK is intentionally NOT wrapped here yet.
 *
 * It ships in M2.5 (durable assistant). When that milestone lands,
 * uncomment the import and wrap the export:
 *
 *   import { withWorkflow } from 'workflow/next'
 *   export default withWorkflow(nextConfig)
 *
 * The reason we don't wrap it now: `workflow/next` is not yet a
 * dependency, and adding it without using it just bloats install.
 */

const nextConfig: NextConfig = {
  typedRoutes: true,

  // The client lives in a workspace package; transpile shared workspace deps.
  transpilePackages: ['@humanupgrade/db-types'],

  images: {
    // We embed YouTube thumbnails for episodes; allowlist them here.
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'images.clerk.dev' },
      { protocol: 'https', hostname: 'img.clerk.com' },
    ],
  },
}

export default nextConfig
