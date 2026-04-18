import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

/**
 * Right-side relation rail used by every entity detail page.
 *
 * Compose with <RelationGroup> sections; each group gets a title + count.
 * Empty groups can be hidden by passing `hideWhenEmpty`.
 */
export function RelationRail({ children }: { children: React.ReactNode }) {
  return (
    <aside className="lg:sticky lg:top-20 space-y-4" aria-label="Related entities">
      {children}
    </aside>
  )
}

export function RelationGroup({
  title,
  count,
  hideWhenEmpty = false,
  children,
}: {
  title: string
  count: number
  hideWhenEmpty?: boolean
  children: React.ReactNode
}) {
  if (hideWhenEmpty && count === 0) return null
  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Badge variant="outline" className="text-[10px]">
          {count}
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        {count === 0 ? (
          <p className="text-xs text-muted-foreground italic">None</p>
        ) : (
          <ScrollArea className="max-h-72">
            <ul className="space-y-1.5">{children}</ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
