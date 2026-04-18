'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { Loader2Icon, SearchIcon } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GlobalSearchDocument, SearchMode, type GlobalSearchQuery } from '@/lib/gql'
import { useDebounced } from '@/hooks/useDebounced'
import { GlobalSearchResults } from '@/components/search/GlobalSearchResults'

const MIN_QUERY = 2
const PER_TYPE = 4
const DEBOUNCE_MS = 220

/**
 * Live search dialog. Hits the API on every debounced keystroke; renders
 * grouped results via <GlobalSearchResults variant="compact" />.
 *
 * Enter goes to /search?q=… for the full results page.
 */
export function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const debounced = useDebounced(q, DEBOUNCE_MS)

  // ⌘K / Ctrl+K toggles globally.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  const enabled = debounced.trim().length >= MIN_QUERY

  const { data, loading, error } = useQuery(GlobalSearchDocument, {
    variables: { input: { query: debounced.trim(), perTypeLimit: PER_TYPE, mode: SearchMode.Hybrid } },
    skip: !enabled,
    fetchPolicy: 'cache-and-network',
  })

  function gotoResultsPage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (q.trim().length === 0) return
    onOpenChange(false)
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search HumanUpgrade</DialogTitle>
          <DialogDescription>
            Search across episodes, claims, compounds, products, lab tests, biomarkers, case
            studies, people and organizations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={gotoResultsPage} className="flex items-center gap-2 px-3 py-3 border-b border-border">
          <SearchIcon className="size-4 text-muted-foreground shrink-0" aria-hidden />
          <input
            autoFocus
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the knowledge graph…"
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          {loading && enabled ? (
            <Loader2Icon className="size-4 text-muted-foreground animate-spin" aria-hidden />
          ) : null}
          <kbd className="ml-1 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            Enter
          </kbd>
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          {!enabled ? (
            <EmptyState hint="Type at least 2 characters to search." />
          ) : error ? (
            <EmptyState hint={`Search failed: ${error.message}`} variant="error" />
          ) : data?.search ? (
            data.search.totalAcrossTypes === 0 ? (
              <EmptyState hint={`No results for "${debounced.trim()}".`} />
            ) : (
              <GlobalSearchResults
                data={data.search as GlobalSearchQuery['search']}
                variant="compact"
                perGroup={PER_TYPE}
                baseHref={`/search?q=${encodeURIComponent(debounced.trim())}`}
              />
            )
          ) : (
            <EmptyState hint="Searching…" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EmptyState({
  hint,
  variant = 'muted',
}: {
  hint: string
  variant?: 'muted' | 'error'
}) {
  return (
    <p
      className={
        variant === 'error'
          ? 'text-sm text-destructive py-8 text-center'
          : 'text-sm text-muted-foreground py-8 text-center'
      }
    >
      {hint}
    </p>
  )
}
