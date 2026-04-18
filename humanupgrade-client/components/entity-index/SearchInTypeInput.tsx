'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { SearchIcon, Loader2Icon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDebounced } from '@/hooks/useDebounced'
import { buildIndexHref } from '@/lib/entity-index/params'
import type { EntityIndexParams } from '@/lib/entity-index/types'

const DEBOUNCE_MS = 250

/**
 * Per-entity search input. Lives inside the entity-index controls row.
 *
 * - Mirrors the URL `q` param (so back/forward works).
 * - Debounces, then `router.replace`s with the new q (resetting page to 1).
 * - Uses useTransition so the input never feels janky during streaming.
 */
export function SearchInTypeInput({
  current,
  placeholder,
}: {
  current: EntityIndexParams
  placeholder: string
}) {
  const router = useRouter()
  const pathname = usePathname() ?? ''

  const [value, setValue] = useState(current.q)
  const debounced = useDebounced(value, DEBOUNCE_MS)
  const [isPending, startTransition] = useTransition()

  // Keep local input in sync if the URL changes externally (e.g. nav back).
  useEffect(() => {
    setValue(current.q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.q])

  // Push to URL on debounced change.
  useEffect(() => {
    if (debounced === current.q) return
    const href = buildIndexHref(pathname, current, { q: debounced, page: 1 })
    startTransition(() => router.replace(href, { scroll: false }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <div className="relative flex items-center w-full max-w-md">
      <SearchIcon className="absolute left-3 size-4 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 rounded-md border border-input bg-background pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {value.length > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 h-7 w-7 p-0"
          onClick={() => setValue('')}
          aria-label="Clear search"
        >
          {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : <XIcon className="size-3.5" />}
        </Button>
      ) : isPending ? (
        <Loader2Icon className="absolute right-3 size-3.5 text-muted-foreground animate-spin" />
      ) : null}
    </div>
  )
}
