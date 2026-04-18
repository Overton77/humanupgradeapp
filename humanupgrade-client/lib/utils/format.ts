/** Pure formatting helpers. No React, no DOM, no I/O. */

/** Episode duration: "1h 47m" / "12m 30s" / "45s". */
export function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

/** Compact ISO-date → "Apr 17, 2026" without timezone surprises. */
export function formatPublishDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** "12:33" / "1:02:14" timestamp from seconds. */
export function formatTimestamp(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const mm = m.toString().padStart(2, '0')
  const ss = s.toString().padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`
}

/** Truncate a long string with an ellipsis. */
export function truncate(s: string | null | undefined, max: number): string {
  if (!s) return ''
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + '…'
}
