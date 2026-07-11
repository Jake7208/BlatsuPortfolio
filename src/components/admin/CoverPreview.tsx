'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

type MediaDoc = {
  url?: string | null
  mimeType?: string | null
  alt?: string | null
  focalX?: number | null
  focalY?: number | null
}

/**
 * Admin-only companion to the `mainMedia` field: shows the selected cover
 * inside the same wide frame the post page uses (cover-cropped around the
 * focal point), so what gets cut off is visible before publishing.
 */
export default function CoverPreview() {
  const mediaId = useFormFields(([fields]) => {
    const value = fields?.mainMedia?.value
    return typeof value === 'string' ? value : null
  })
  // stored with the id it was fetched for, so a stale doc never renders
  // after the cover is swapped or cleared
  const [loaded, setLoaded] = React.useState<{ id: string; doc: MediaDoc } | null>(null)
  const [refreshTick, setRefreshTick] = React.useState(0)

  React.useEffect(() => {
    if (!mediaId) return
    let cancelled = false
    fetch(`/api/media/${mediaId}?depth=0`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setLoaded({ id: mediaId, doc: data })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [mediaId, refreshTick])

  const doc = mediaId && loaded?.id === mediaId ? loaded.doc : null
  if (!doc?.url) return null
  // videos aren't cropped by the banner, nothing useful to preview
  if (doc.mimeType && !doc.mimeType.startsWith('image/')) return null

  const focalX = typeof doc.focalX === 'number' ? doc.focalX : 50
  const focalY = typeof doc.focalY === 'number' ? doc.focalY : 50

  return (
    <div style={{ marginBottom: 'calc(var(--base, 20px) * 1.2)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--theme-elevation-600, #666)' }}>
          Cover preview — how it crops on the page
        </span>
        <button
          type="button"
          onClick={() => setRefreshTick((t) => t + 1)}
          style={{
            border: 0,
            background: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: 13,
            textDecoration: 'underline',
            color: 'var(--theme-elevation-600, #666)',
          }}
        >
          Refresh
        </button>
      </div>
      <div
        style={{
          // the post page shows the cover at up to 1376px wide, capped at
          // 720px tall — same shape here, scaled down
          aspectRatio: '1376 / 720',
          overflow: 'hidden',
          borderRadius: 8,
          border: '1px solid var(--theme-elevation-150, #e5e5e5)',
          maxWidth: 640,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an uploaded file */}
        <img
          src={doc.url}
          alt={doc.alt || ''}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${focalX}% ${focalY}%`,
            display: 'block',
          }}
        />
      </div>
      <p
        style={{
          margin: '8px 0 0',
          fontSize: 12,
          color: 'var(--theme-elevation-500, #888)',
        }}
      >
        To change the crop, open the image (pencil icon), drag the focal point, save, then hit
        Refresh.
      </p>
    </div>
  )
}
