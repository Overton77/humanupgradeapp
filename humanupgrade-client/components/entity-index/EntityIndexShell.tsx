import { SiteHeader } from '@/components/marketing/SiteHeader'
import { SiteFooter } from '@/components/marketing/SiteFooter'

/**
 * Page chrome for /e/<type> index pages. Two-row layout:
 *   - Title row (kicker, title, total count)
 *   - Controls row (search input, filter pills) — sticky on scroll
 *   - Body (grid of cards + pagination)
 *
 * The marketing chrome wraps everything so deep links work without sign-in.
 */
export function EntityIndexShell({
  kicker,
  title,
  description,
  controls,
  children,
}: {
  kicker: string
  title: string
  description?: string
  controls: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <header className="space-y-2 mb-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{kicker}</p>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            {description ? <p className="text-sm text-muted-foreground max-w-2xl">{description}</p> : null}
          </header>

          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border py-3 mb-6 -mx-6 px-6">
            {controls}
          </div>

          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
