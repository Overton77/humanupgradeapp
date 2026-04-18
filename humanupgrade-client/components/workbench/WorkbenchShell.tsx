'use client'

import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelGroupHandle } from 'react-resizable-panels'
import { useRef } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Three-pane resizable workbench shell.
 *
 * Pane sizing rules (per docs/04 §"Resizable panes"):
 *   left   [12, 32]  — library / nav
 *   center [40, 76]  — focused entity / note / protocol
 *   right  [16, 36]  — assistant (placeholder in M0)
 *
 * Layout ratios are persisted to localStorage by react-resizable-panels
 * via the `autoSaveId` prop. Cross-route persistence to PaneLayout is M4.
 *
 * Mobile fallback (≤ md): stacks vertically. Resize handles hide.
 */
export function WorkbenchShell({
  left,
  center,
  right,
  className,
}: {
  left: React.ReactNode
  center: React.ReactNode
  right: React.ReactNode
  className?: string
}) {
  const groupRef = useRef<ImperativePanelGroupHandle>(null)

  return (
    <div className={cn('h-[calc(100vh-3.5rem)] w-full', className)}>
      {/* Mobile: stacked */}
      <div className="md:hidden h-full overflow-y-auto">
        <section className="border-b border-border p-4">{left}</section>
        <section className="p-4">{center}</section>
        <section className="border-t border-border p-4">{right}</section>
      </div>

      {/* Desktop: 3-pane */}
      <PanelGroup
        ref={groupRef}
        direction="horizontal"
        autoSaveId="hu:workbench:layout"
        className="hidden md:flex h-full"
      >
        <Panel id="left" order={1} defaultSize={22} minSize={12} maxSize={32}>
          <WorkbenchPane>{left}</WorkbenchPane>
        </Panel>

        <ResizeHandle />

        <Panel id="center" order={2} defaultSize={56} minSize={40} maxSize={76}>
          <WorkbenchPane>{center}</WorkbenchPane>
        </Panel>

        <ResizeHandle />

        <Panel id="right" order={3} defaultSize={22} minSize={16} maxSize={36}>
          <WorkbenchPane>{right}</WorkbenchPane>
        </Panel>
      </PanelGroup>
    </div>
  )
}

/** Inner-pane container with scroll. Kept simple so individual surfaces own their padding. */
function WorkbenchPane({ children }: { children: React.ReactNode }) {
  return <div className="h-full overflow-y-auto bg-background">{children}</div>
}

/** Subtle, accessible resize handle. Wider hit area than visual width. */
function ResizeHandle() {
  return (
    <PanelResizeHandle
      className={cn(
        'group relative w-px bg-border data-[resize-handle-state=hover]:bg-foreground/30',
        'data-[resize-handle-state=drag]:bg-foreground/50 transition-colors',
      )}
    >
      <span className="absolute inset-y-0 -inset-x-1" aria-hidden />
    </PanelResizeHandle>
  )
}
