import Link from 'next/link'
import { CompassIcon, ExternalLinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const explorerStarters = [
  { label: 'Episodes', href: '/search?type=episode', helper: 'Podcast deep dives' },
  { label: 'Compounds', href: '/search?type=compound', helper: 'Mechanisms + biomarker effects' },
  { label: 'Products', href: '/search?type=product', helper: 'What contains what' },
  { label: 'Case studies', href: '/search?type=caseStudy', helper: 'Evidence corpus' },
  { label: 'Biomarkers', href: '/search?type=biomarker', helper: 'What you might track' },
] as const

/**
 * Center pane content for the M0 workbench.
 *
 * Shows the user a productive landing: how to start exploring the graph,
 * with deep-link cards into the public entity browser.
 *
 * Replaced in M2 once tabs + the assistant land.
 */
export function CenterPanePlaceholder() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <header className="flex items-center gap-3 mb-2">
        <CompassIcon className="size-5 text-muted-foreground" aria-hidden />
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to your workbench</h1>
      </header>
      <p className="text-sm text-muted-foreground max-w-prose">
        This is the foundation of the HumanUpgrade workbench. The left pane will host your library;
        the right pane will host the AI assistant; this center pane will host whatever you&apos;re
        currently focused on.
      </p>

      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mt-8 mb-3">
        Explore the knowledge graph
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {explorerStarters.map((s) => (
          <Card key={s.href}>
            <CardHeader>
              <CardTitle className="text-base">{s.label}</CardTitle>
              <CardDescription>{s.helper}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild>
                <Link href={s.href}>
                  Browse {s.label.toLowerCase()}
                  <ExternalLinkIcon className="ml-1 size-3.5" aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-8">
        Coming in M1: save anything to your library. Coming in M2: ask the assistant. Coming in M3:
        build protocols and track biomarkers.
      </p>
    </div>
  )
}
