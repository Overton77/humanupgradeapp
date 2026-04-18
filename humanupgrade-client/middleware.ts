import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * Routes that require an authenticated session.
 *
 * Public surfaces (no auth required):
 *  - /                    marketing home
 *  - /search              search results
 *  - /e/...               public knowledge graph entity pages
 *
 * Anything else (workbench, library, protocols, track, journey, profile,
 * authenticated API routes) requires sign-in.
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/search(.*)',
  '/e/(.*)',
  '/api/webhooks/(.*)',
  '/api/health',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next internals, static assets, AND Workflow SDK's well-known paths (when added).
    '/((?!_next|.well-known/workflow|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
