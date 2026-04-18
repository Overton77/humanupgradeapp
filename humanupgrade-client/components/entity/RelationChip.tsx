import Link from 'next/link'

/**
 * One row inside a <RelationGroup>. Title + optional helper.
 */
export function RelationChip({
  href,
  title,
  helper,
}: {
  href: string
  title: string
  helper?: string | null
}) {
  return (
    <li>
      <Link
        href={href}
        className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
      >
        <div className="font-medium leading-tight">{title}</div>
        {helper ? (
          <div className="text-xs text-muted-foreground line-clamp-1">{helper}</div>
        ) : null}
      </Link>
    </li>
  )
}
