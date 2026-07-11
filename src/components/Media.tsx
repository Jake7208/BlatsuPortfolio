import React from 'react'

type Props = {
  src: string
  srcSet?: string | null
  sizes?: string
  alt: string
  mimeType?: string | null
  width?: number | null
  height?: number | null
  loading?: 'lazy' | 'eager'
  /** focal point percentages from the admin — only visible when a frame crops the image */
  focalX?: number
  focalY?: number
}

/**
 * Plain renderer for a Payload upload — <video> for videos, <img> for
 * everything else. Wrapped in a .media-frame div as a styling hook.
 */
export default function Media({
  src,
  srcSet,
  sizes,
  alt,
  mimeType,
  width,
  height,
  loading = 'lazy',
  focalX,
  focalY,
}: Props) {
  const objectPosition =
    focalX !== undefined || focalY !== undefined
      ? `${focalX ?? 50}% ${focalY ?? 50}%`
      : undefined

  return (
    <div className="media-frame">
      {mimeType?.startsWith('video/') ? (
        <video src={src} controls playsInline preload="metadata" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- media served from object storage, dimensions vary
        <img
          src={src}
          srcSet={srcSet ?? undefined}
          sizes={srcSet ? sizes : undefined}
          alt={alt}
          width={width ?? undefined}
          height={height ?? undefined}
          loading={loading}
          decoding="async"
          style={objectPosition ? { objectPosition } : undefined}
        />
      )}
    </div>
  )
}
