import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { entityRoutes } from '@/lib/entities/routes'
import { formatTimestamp } from '@/lib/utils/format'

/**
 * Render the Episode's claims as a vertical list.
 *
 * Each row shows: stance/confidence/type badges, the claim text, the
 * speaker (if known), the source timestamp (if known), and a link into
 * the claim's own detail page.
 */
type ClaimNode = {
  id: string
  text: string
  evidenceExcerpt?: string | null
  claimType: string
  stance: string
  claimConfidence: string
  startTimeSeconds?: number | null
  endTimeSeconds?: number | null
  sourceUrl?: string | null
  tags: string[]
  probableSpeaker?: string | null
  speaker?: { id: string; slug: string; fullName: string } | null
}

export function EpisodeClaimsSection({ claims }: { claims: ClaimNode[] }) {
  if (!claims || claims.length === 0) return null

  return (
    <section aria-labelledby="episode-claims" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="episode-claims" className="text-lg font-semibold">
          Claims
        </h2>
        <span className="text-xs text-muted-foreground">{claims.length} total</span>
      </div>

      <ul className="space-y-3">
        {claims.map((c) => (
          <li
            key={c.id}
            className="rounded-md border border-border bg-card p-4 hover:border-foreground/40 transition-colors"
          >
            <ClaimBadgeRow stance={c.stance} confidence={c.claimConfidence} type={c.claimType} />

            <p className="mt-2 text-sm leading-relaxed">{c.text}</p>

            <ClaimAttributionRow
              speaker={c.speaker}
              probableSpeaker={c.probableSpeaker}
              start={c.startTimeSeconds}
              claimId={c.id}
            />

            {c.evidenceExcerpt ? (
              <p className="mt-2 text-xs text-muted-foreground italic line-clamp-3">
                &ldquo;{c.evidenceExcerpt}&rdquo;
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

function ClaimBadgeRow({
  stance,
  confidence,
  type,
}: {
  stance: string
  confidence: string
  type: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
      <Badge variant={stanceVariant(stance)}>{stance.toLowerCase()}</Badge>
      <Badge variant={confidenceVariant(confidence)}>{confidence.toLowerCase().replace('_', ' ')}</Badge>
      <Badge variant="outline">{type.toLowerCase().replace(/_/g, ' ')}</Badge>
    </div>
  )
}

function ClaimAttributionRow({
  speaker,
  probableSpeaker,
  start,
  claimId,
}: {
  speaker?: { slug: string; fullName: string } | null
  probableSpeaker?: string | null
  start?: number | null
  claimId: string
}) {
  const ts = formatTimestamp(start)
  return (
    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
      {speaker ? (
        <Link href={entityRoutes.person(speaker.slug)} className="hover:text-foreground underline-offset-2 hover:underline">
          {speaker.fullName}
        </Link>
      ) : probableSpeaker ? (
        <span>~ {probableSpeaker}</span>
      ) : null}

      {ts ? <span>{ts}</span> : null}

      <Link
        href={entityRoutes.claim(claimId)}
        className="ml-auto hover:text-foreground underline-offset-2 hover:underline"
      >
        Open claim →
      </Link>
    </div>
  )
}

function stanceVariant(s: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (s) {
    case 'SUPPORTS':
      return 'default'
    case 'OPPOSES':
      return 'destructive'
    case 'MIXED':
    case 'NEUTRAL':
      return 'secondary'
    default:
      return 'outline'
  }
}

function confidenceVariant(c: string): 'default' | 'secondary' | 'outline' {
  switch (c) {
    case 'HIGH':
    case 'VERY_HIGH':
      return 'default'
    case 'MEDIUM':
      return 'secondary'
    default:
      return 'outline'
  }
}
