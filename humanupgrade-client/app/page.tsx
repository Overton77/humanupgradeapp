import Link from 'next/link'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

/**
 * Marketing home (anonymous landing).
 *
 * After sign-in, users are routed into /workbench (the gated `(app)` group).
 * Public deep-links into /e/... continue to render publicly with this same
 * marketing chrome.
 */
export default function MarketingHome() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pt-24 pb-16">
          <p className="text-sm uppercase tracking-widest text-[color:var(--color-fg-muted)]">
            HumanUpgrade
          </p>
          <h1 className="mt-3 text-5xl sm:text-6xl font-semibold tracking-tight">
            A precision biohacking <span className="text-[color:var(--color-accent)]">workbench</span>.
          </h1>
          <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] max-w-2xl">
            Explore a curated knowledge graph of podcasts, claims, compounds, products, lab tests,
            biomarkers and case studies — and turn it into a personal protocol you actually run,
            with a context-aware AI assistant alongside.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
                  Get started
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="rounded-md surface px-5 py-2.5 text-sm font-medium hover:bg-[color:var(--color-bg)] transition-colors">
                  Sign in
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/workbench"
                className="rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Open the workbench →
              </Link>
            </Show>
          </div>
        </section>

        {/* Quick browse rails */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <h2 className="text-xl font-semibold mb-4">Browse the knowledge graph</h2>
          <p className="text-sm text-[color:var(--color-fg-muted)] mb-6">
            Anyone can deep-link into any of these. Sign in to save, take notes, build protocols
            and track biomarkers.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {browseEntities.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="surface px-4 py-3 hover:border-[color:var(--color-accent)] transition-colors"
              >
                <div className="text-xs uppercase tracking-wide text-[color:var(--color-fg-muted)]">
                  {e.label}
                </div>
                <div className="mt-1 text-sm font-medium">Explore →</div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

const browseEntities = [
  { label: 'Episodes', href: '/search?q=&type=episode' },
  { label: 'Compounds', href: '/search?q=&type=compound' },
  { label: 'Products', href: '/search?q=&type=product' },
  { label: 'Case studies', href: '/search?q=&type=caseStudy' },
  { label: 'Biomarkers', href: '/search?q=&type=biomarker' },
  { label: 'Claims', href: '/search?q=&type=claim' },
  { label: 'People', href: '/search?q=&type=person' },
  { label: 'Organizations', href: '/search?q=&type=organization' },
  { label: 'Lab tests', href: '/search?q=&type=labTest' },
  { label: 'Podcasts', href: '/search?q=&type=podcast' },
] as const

function SiteHeader() {
  return (
    <header className="border-b border-[color:var(--color-border)]">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          HumanUpgrade
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/search" className="text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]">
            Search
          </Link>
          <Show when="signed-out">
            <SignInButton mode="modal" />
            <SignUpButton mode="modal" />
          </Show>
          <Show when="signed-in">
            <Link href="/workbench" className="text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]">
              Workbench
            </Link>
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--color-border)] py-6 text-center text-xs text-[color:var(--color-fg-muted)]">
      Educational, not medical advice. © {new Date().getFullYear()} HumanUpgrade.
    </footer>
  )
}
