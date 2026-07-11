'use client'

import React from 'react'

import { Play } from '@/components/icons'
import { youtubeId } from '@/lib/youtube'

/** 0–100 — quiet enough not to startle, loud enough to notice it's playing */
const START_VOLUME = 15

type Props = {
  url: string
  title: string
  /** custom cover still — falls back to YouTube's own thumbnail */
  thumbUrl?: string | null
  thumbSrcSet?: string | null
}

/**
 * A YouTube facade: shows a cover still with a play badge — under a mouse the
 * badge gives way to a "Play video" pill that trails the cursor — and only
 * swaps in the real (autoplaying, quiet) player once clicked, so the page
 * loads no YouTube JavaScript until someone plays something.
 */
export default function VideoCard({ url, title, thumbUrl, thumbSrcSet }: Props) {
  const id = youtubeId(url)
  const [playing, setPlaying] = React.useState(false)
  const [hovering, setHovering] = React.useState(false)
  // maxres isn't generated for every video — drop to the always-present size on error
  const [ytThumb, setYtThumb] = React.useState<'maxresdefault' | 'hqdefault'>('maxresdefault')
  const playerRef = React.useRef<HTMLIFrameElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const cursorRef = React.useRef<HTMLSpanElement>(null)

  // The widget ignores messages until its JS is up, so a short burst of
  // setVolume commands covers the load window — accepted ones turn the
  // volume down before (or as) audio starts, instead of blasting at 100.
  React.useEffect(() => {
    if (!playing) return
    const send = () =>
      playerRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [START_VOLUME] }),
        '*',
      )
    const interval = window.setInterval(send, 250)
    const stop = window.setTimeout(() => window.clearInterval(interval), 5000)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(stop)
    }
  }, [playing])

  // positioned via the DOM instead of state so mouse moves don't re-render;
  // the pill trails behind the pointer and settles centered on it, clamped
  // so it can't slide out of the frame
  const moveCursor = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const rect = stageRef.current?.getBoundingClientRect()
    const pill = cursorRef.current
    if (!rect || !pill) return
    const w = pill.offsetWidth
    const h = pill.offsetHeight
    const x = Math.min(Math.max(e.clientX - rect.left - w / 2, 8), rect.width - w - 8)
    const y = Math.min(Math.max(e.clientY - rect.top - h / 2, 8), rect.height - h - 8)
    pill.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  if (!id) return null

  if (playing) {
    return (
      <div className="video-stage">
        {/* rel=0 is the most YouTube allows since 2018: end-screen and pause
            recommendations still appear, but only from the video's own channel */}
        <iframe
          ref={playerRef}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div
      ref={stageRef}
      className={`video-stage video-cover${hovering ? ' is-hovering' : ''}`}
      // the follower pill only makes sense with a real pointer — on touch
      // there's no hover, so the centered badge stays as the affordance
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return
        moveCursor(e)
        setHovering(true)
      }}
      onPointerMove={moveCursor}
      onPointerLeave={() => setHovering(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- covers come from object storage or YouTube */}
      <img
        src={thumbUrl || `https://i.ytimg.com/vi/${id}/${ytThumb}.jpg`}
        srcSet={thumbUrl ? (thumbSrcSet ?? undefined) : undefined}
        sizes={thumbUrl && thumbSrcSet ? '(max-width: 1140px) 100vw, 1100px' : undefined}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => {
          if (!thumbUrl && ytThumb === 'maxresdefault') setYtThumb('hqdefault')
        }}
      />

      <button
        type="button"
        className="video-play-overlay"
        onClick={() => setPlaying(true)}
        aria-label={`Play ${title}`}
      >
        <span className="video-play-badge">
          <Play />
        </span>
      </button>

      {/* cursor-follower — purely decorative, the overlay button is the control */}
      <span ref={cursorRef} className="video-cursor" aria-hidden="true">
        <span className="video-cursor-chip">
          <Play />
          Play video
        </span>
      </span>
    </div>
  )
}
