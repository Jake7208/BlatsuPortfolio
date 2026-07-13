import React from 'react'

import { youtubeId } from '@/lib/youtube'

/**
 * Responsive YouTube embed for the videoEmbed block — long-form video streams
 * from YouTube instead of R2. Uses the no-cookie domain and lazy-loads.
 */
export default function VideoEmbed({
  url,
  caption,
}: {
  url?: string | null
  caption?: string | null
}) {
  const id = url ? youtubeId(url) : null
  if (!id) return null

  return (
    <figure className="video-embed">
      {/* rel=0 limits end-screen/pause recommendations to the video's own channel */}
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&controls=1&cc_load_policy=0`}
        title={caption || 'Video'}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
