/**
 * Top-of-page media block for an Episode.
 *
 * Order of preference:
 *   1. YouTube embed   (best UX — inline transcript-like timestamps later)
 *   2. Audio element   (HTML5)
 *   3. Video element
 *
 * Renders nothing if no media is present (no empty placeholder).
 */
export function EpisodeMediaSection({
  youtubeEmbedUrl,
  audioUrl,
  videoUrl,
}: {
  youtubeEmbedUrl?: string | null
  audioUrl?: string | null
  videoUrl?: string | null
}) {
  if (youtubeEmbedUrl) {
    return (
      <section aria-label="Episode video">
        <div className="relative rounded-lg overflow-hidden border border-border bg-muted aspect-video">
          <iframe
            src={youtubeEmbedUrl}
            title="Episode video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </section>
    )
  }

  if (audioUrl) {
    return (
      <section aria-label="Episode audio">
        <audio controls className="w-full" src={audioUrl} preload="none">
          Your browser does not support the audio element.
        </audio>
      </section>
    )
  }

  if (videoUrl) {
    return (
      <section aria-label="Episode video">
        <video controls className="w-full rounded-lg border border-border" src={videoUrl} preload="none">
          Your browser does not support the video element.
        </video>
      </section>
    )
  }

  return null
}
