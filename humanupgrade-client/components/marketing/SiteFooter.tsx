/**
 * Site-wide footer for public pages.
 * The disclaimer is mandatory copy per docs/01 and 09 — please don't remove.
 */
export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
      Educational, not medical advice. © {year} HumanUpgrade.
    </footer>
  )
}
