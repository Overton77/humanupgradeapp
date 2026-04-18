import { Badge } from '@/components/ui/badge'

/**
 * Reusable empty-state for unbuilt workbench panes. Tracks which milestone
 * will replace it so the agent can find them later.
 */
export function PanePlaceholder({
  icon,
  title,
  description,
  milestone,
}: {
  icon: React.ReactNode
  title: string
  description: string
  /** Milestone id (e.g. "M1", "M2") that will replace this placeholder. */
  milestone: string
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6">
      <div className="rounded-full border border-dashed border-border p-3 mb-3 text-muted-foreground">
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-medium">{title}</h3>
        <Badge variant="secondary" className="text-[10px]">
          coming in {milestone}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground max-w-[24ch]">{description}</p>
    </div>
  )
}
