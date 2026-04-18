'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * Global search dialog. Stub for D17 — gets the live debounced query
 * input + results list once the API resolver lands.
 */
export function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [q, setQ] = useState('')

  // Open with ⌘K / Ctrl+K from anywhere.
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search HumanUpgrade</DialogTitle>
          <DialogDescription>
            Search across episodes, claims, compounds, products, lab tests, biomarkers, case
            studies, people and organizations.
          </DialogDescription>
        </DialogHeader>

        <input
          autoFocus
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try: HRV, magnesium, sleep…"
          className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <div className="text-xs text-muted-foreground pt-2">
          Live results coming next — for now press{' '}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">Enter</kbd> to go to{' '}
          <code>/search?q={encodeURIComponent(q || '...')}</code>
        </div>
      </DialogContent>
    </Dialog>
  )
}
