import Link from 'next/link'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { SiteFooter } from '@/components/marketing/SiteFooter'
import { SiteHeader } from '@/components/marketing/SiteHeader'

/**
 * Marketing home (anonymous landing).
 *
 * After sign-in, users go to /workbench (the gated `(app)` group).
 * Public deep-links into /e/... continue to render publicly.
 */
export default function MarketingHome() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <HeroSection />
        <BrowseRailSection />
      </main>

      <SiteFooter />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-24 pb-16">
      <p className="text-sm uppercase tracking-widest text-muted-foreground">HumanUpgrade</p>
      <h1 className="mt-3 text-5xl sm:text-6xl font-semibold tracking-tight">
        A precision biohacking{' '}
        <span style={{ color: 'var(--hu-accent)' }}>workbench</span>.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
        Explore a curated knowledge graph of podcasts, claims, compounds, products, lab tests,
        biomarkers and case studies — and turn it into a personal protocol you actually run, with a
        context-aware AI assistant alongside.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Show when="signed-out">
          <SignUpButton mode="modal">
            <Button size="lg">Get started</Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <Button size="lg" asChild>
            <Link href="/workbench">Open the workbench →</Link>
          </Button>
          <UserButton />
        </Show>
      </div>
    </section>
  )
}

function BrowseRailSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-24">
      <h2 className="text-xl font-semibold mb-2">Browse the knowledge graph</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Anyone can deep-link into any of these. Sign in to save, take notes, build protocols and
        track biomarkers.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {browseEntities.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className="group rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-foreground/40"
          >
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{e.label}</div>
            <div className="mt-1 text-sm font-medium group-hover:underline underline-offset-4">
              Explore →
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

const browseEntities = [
  { label: 'Episodes', href: '/search?type=episode' },
  { label: 'Compounds', href: '/search?type=compound' },
  { label: 'Products', href: '/search?type=product' },
  { label: 'Case studies', href: '/search?type=caseStudy' },
  { label: 'Biomarkers', href: '/search?type=biomarker' },
  { label: 'Claims', href: '/search?type=claim' },
  { label: 'People', href: '/search?type=person' },
  { label: 'Organizations', href: '/search?type=organization' },
  { label: 'Lab tests', href: '/search?type=labTest' },
  { label: 'Podcasts', href: '/search?type=podcast' },
] as const
