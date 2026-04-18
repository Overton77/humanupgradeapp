import { Badge } from '@/components/ui/badge'

/**
 * Episode summary card stack: short summary, key takeaways, topic chips.
 * Detailed summary lives below the fold (collapsed by default in M0+).
 */
export function EpisodeSummarySection({
  short,
  detailed,
  keyTakeaways,
  topicPrimary,
  topics,
}: {
  short?: string | null
  detailed?: string | null
  keyTakeaways: string[]
  topicPrimary?: string | null
  topics: string[]
}) {
  if (!short && !detailed && (keyTakeaways?.length ?? 0) === 0 && (topics?.length ?? 0) === 0) {
    return null
  }

  return (
    <section aria-labelledby="episode-summary" className="space-y-4">
      <h2 id="episode-summary" className="text-lg font-semibold">
        Summary
      </h2>

      {short ? <p className="text-base text-foreground/90 leading-relaxed">{short}</p> : null}

      {(topicPrimary || (topics?.length ?? 0) > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {topicPrimary ? (
            <Badge>{topicPrimary}</Badge>
          ) : null}
          {topics
            .filter((t) => t !== topicPrimary)
            .slice(0, 12)
            .map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
        </div>
      )}

      {(keyTakeaways?.length ?? 0) > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Key takeaways</h3>
          <ul className="list-disc list-outside ml-5 space-y-1 text-sm">
            {keyTakeaways.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
      )}

      {detailed ? (
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground select-none">
            Show detailed summary
          </summary>
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">{detailed}</p>
        </details>
      ) : null}
    </section>
  )
}
