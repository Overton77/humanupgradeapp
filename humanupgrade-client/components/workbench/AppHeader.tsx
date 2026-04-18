import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { GlobalSearchTrigger } from '@/components/search/GlobalSearchTrigger'
import { Button } from '@/components/ui/button'

/**
 * Header inside the gated (app) shell.
 *
 * Differences from SiteHeader (marketing):
 *   - Always assumes a signed-in user.
 *   - Search bar is full-width (always visible).
 *   - Nav points to library/track/protocols/journey (placeholders until M1+).
 */
export function AppHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1600px] px-4 h-14 flex items-center gap-4">
        <Link href="/workbench" className="font-semibold tracking-tight whitespace-nowrap">
          HumanUpgrade
        </Link>

        <div className="flex-1 max-w-xl">
          <GlobalSearchTrigger />
        </div>

        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {appNavItems.map((item) => (
            <Button
              key={item.href}
              size="sm"
              variant="ghost"
              asChild
              disabled={item.disabled}
              className={item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Link href={item.href} aria-disabled={item.disabled}>
                {item.label}
                {item.disabled ? <span className="ml-1 text-[10px] uppercase">soon</span> : null}
              </Link>
            </Button>
          ))}
        </nav>

        <UserButton />
      </div>
    </header>
  )
}

const appNavItems = [
  { label: 'Workbench', href: '/workbench', disabled: false },
  { label: 'Library', href: '/library', disabled: true },
  { label: 'Track', href: '/track', disabled: true },
  { label: 'Protocols', href: '/protocols', disabled: true },
  { label: 'Journey', href: '/journey', disabled: true },
] as const
