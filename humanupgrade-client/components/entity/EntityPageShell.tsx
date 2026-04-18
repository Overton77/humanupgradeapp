import { SiteHeader } from '@/components/marketing/SiteHeader'
import { SiteFooter } from '@/components/marketing/SiteFooter'

/**
 * Wrapping shell for every public entity detail page.
 *
 * Two-column layout (main + relation rail) on lg+, single-column on small.
 * The rail collapses below the main on mobile so it doesn't get scrolled past.
 */
export function EntityPageShell({
  main,
  rail,
}: {
  main: React.ReactNode
  rail: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-10 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
          <div className="min-w-0">{main}</div>
          <div>{rail}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
