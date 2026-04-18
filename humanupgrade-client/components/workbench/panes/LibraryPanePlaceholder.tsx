import { LibraryIcon } from 'lucide-react'
import { PanePlaceholder } from '@/components/workbench/panes/PanePlaceholder'

/** Left pane — replaced in M1 (Library) with saved entities, notes, highlights, files, folders. */
export function LibraryPanePlaceholder() {
  return (
    <PanePlaceholder
      icon={<LibraryIcon className="size-5" aria-hidden />}
      title="Library"
      milestone="M1"
      description="Your saved entities, notes, highlights and files will live here."
    />
  )
}
