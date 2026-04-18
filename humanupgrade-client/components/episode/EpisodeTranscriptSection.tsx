'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/**
 * Transcript section. Renders nothing when no transcript or when the
 * transcript is still being processed.
 *
 * Behavior:
 *   - Defaults to a ~6k-char preview to keep page weight bounded.
 *   - "Read more" expands fully (still client-rendered to avoid SSR cost
 *     for transcripts that can be 100k+ chars).
 *   - Highlight-to-ask interactions ship in M2.
 */
const PREVIEW_CHARS = 6000

export function EpisodeTranscriptSection({
  transcript,
  status,
}: {
  transcript?: string | null
  status?: string
}) {
  const [expanded, setExpanded] = useState(false)

  if (!transcript || transcript.trim().length === 0) {
    if (status && status !== 'STORED') {
      return (
        <section aria-labelledby="episode-transcript" className="space-y-2">
          <h2 id="episode-transcript" className="text-lg font-semibold flex items-center gap-2">
            Transcript
            <Badge variant="secondary">{status.toLowerCase()}</Badge>
          </h2>
          <p className="text-sm text-muted-foreground">
            Transcript is not yet available for this episode.
          </p>
        </section>
      )
    }
    return null
  }

  const truncated = transcript.length > PREVIEW_CHARS
  const visible = expanded || !truncated ? transcript : transcript.slice(0, PREVIEW_CHARS) + '…'

  return (
    <section aria-labelledby="episode-transcript" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="episode-transcript" className="text-lg font-semibold">
          Transcript
        </h2>
        <span className="text-xs text-muted-foreground">
          {transcript.length.toLocaleString()} chars
        </span>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 max-h-[60vh] overflow-y-auto">
        <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-foreground/90">
          {visible}
        </pre>
      </div>

      {truncated && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Collapse transcript' : 'Read full transcript'}
        </Button>
      )}
    </section>
  )
}
