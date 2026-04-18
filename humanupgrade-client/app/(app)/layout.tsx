import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/workbench/AppHeader'

/**
 * Gated layout for the authenticated app surface.
 *
 * The middleware already redirects unauthed users to sign-in for non-public
 * routes — this `auth.protect()` is a defense-in-depth: even if middleware
 * misses (e.g. matcher edge case), this server-side check still gates.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  )
}
