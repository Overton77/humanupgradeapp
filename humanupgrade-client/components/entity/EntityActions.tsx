'use client'

import { BookmarkIcon, ShareIcon, SparklesIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

/**
 * Inline action row for entity headers.
 *
 * In M0 these are intentionally non-functional placeholders: they explain
 * what's coming and toast a friendly note. They get real wiring in:
 *   - Save        \u2192 M1 (saveEntity GraphQL mutation)
 *   - Ask AI      \u2192 M2 (assistant pre-attached context)
 *   - Share       \u2192 M0+ (always works as a copy-link)
 */
export function EntityActions({
  shareUrl,
  entityKind,
}: {
  shareUrl: string
  entityKind: string
}) {
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => toast.message('Save coming in M1', { description: `Sign-in + Save ${entityKind} lands with the Library milestone.` })}
      >
        <BookmarkIcon className="size-4" aria-hidden />
        Save
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          if (typeof window === 'undefined') return
          const absolute = new URL(shareUrl, window.location.origin).toString()
          navigator.clipboard.writeText(absolute).then(
            () => toast.success('Link copied'),
            () => toast.error('Could not copy'),
          )
        }}
      >
        <ShareIcon className="size-4" aria-hidden />
        Share
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => toast.message('Assistant coming in M2', { description: 'You\'ll be able to ask the AI assistant about this directly.' })}
      >
        <SparklesIcon className="size-4" aria-hidden />
        Ask assistant
      </Button>
    </>
  )
}
