import { WorkbenchShell } from '@/components/workbench/WorkbenchShell'
import { LibraryPanePlaceholder } from '@/components/workbench/panes/LibraryPanePlaceholder'
import { CenterPanePlaceholder } from '@/components/workbench/panes/CenterPanePlaceholder'
import { AssistantPanePlaceholder } from '@/components/workbench/panes/AssistantPanePlaceholder'

export const metadata = { title: 'Workbench' }

/**
 * Workbench home — the gated landing for signed-in users.
 *
 * In M0, the three panes are placeholders that demonstrate the shell.
 * Real content arrives in M1 (library), M2 (assistant), M3 (protocols).
 */
export default function WorkbenchHome() {
  return (
    <WorkbenchShell
      left={<LibraryPanePlaceholder />}
      center={<CenterPanePlaceholder />}
      right={<AssistantPanePlaceholder />}
    />
  )
}
