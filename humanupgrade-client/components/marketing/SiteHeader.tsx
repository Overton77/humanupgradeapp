import Link from 'next/link'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { GlobalSearchTrigger } from '@/components/search/GlobalSearchTrigger'

/**
 * Marketing-grade site header. Used by the public marketing layout and any
 * unauthenticated public pages (entity pages, /search, /).
 *
 * The (app) workbench layout has its own AppHeader.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold tracking-tight whitespace-nowrap">
          HumanUpgrade
        </Link>

        <div className="flex-1 max-w-md hidden md:block">
          <GlobalSearchTrigger />
        </div>

        <nav className="flex items-center gap-2 text-sm">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button size="sm" variant="ghost">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Sign up</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Button size="sm" variant="ghost" asChild>
              <Link href="/workbench">Workbench</Link>
            </Button>
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  )
}
