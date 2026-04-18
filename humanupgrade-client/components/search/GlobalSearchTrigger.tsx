'use client'

import { useState } from 'react'
import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlobalSearchDialog } from '@/components/search/GlobalSearchDialog'

/**
 * Header search affordance.
 *
 * This is a thin wrapper that opens the GlobalSearchDialog. It's split out
 * so the header itself stays a server component and doesn't need to manage
 * dialog open state.
 */
export function GlobalSearchTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start text-muted-foreground gap-2 h-9"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-4" aria-hidden />
        <span className="text-sm">Search anything…</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <GlobalSearchDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
