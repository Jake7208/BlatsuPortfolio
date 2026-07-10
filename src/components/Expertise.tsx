'use client'

import Link from 'next/link'
import React from 'react'

import type { MediaInfo } from '@/lib/media'

export type ExpertiseSlide = {
  label: string
  /** Featured work for this discipline — shown when a tagged case study exists. */
  media: MediaInfo | null
  /** Static image used until then; distinct per slide so the swap is visible. */
  fallbackSrc: string
}

const ROTATE_MS = 4500

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

const subscribeToMotionPreference = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/**
 * "What I Offer" — the disciplines take turns: the blue rule sweeps the active
 * item's underline as a dwell timer and the slide switches when it reaches the
 * end. Hover (mouse only) pauses; leaving restarts the dwell. Under
 * prefers-reduced-motion the sweep collapses to a static rule and rotation
 * stops; clicking always picks manually.
 */
export default function Expertise({ slides }: { slides: ExpertiseSlide[] }) {
  const [active, setActive] = React.useState(0)
  // restart token: the timeout and the underline sweep both key off it, so a
  // tick, a manual pick, or a hover-resume restarts them in lockstep
  const [cycle, setCycle] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const reducedMotion = React.useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  )

  const pick = (index: number) => {
    setActive(index)
    setCycle((c) => c + 1)
  }

  React.useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) return
    const timer = setTimeout(() => {
      setActive((index) => (index + 1) % slides.length)
      setCycle((c) => c + 1)
    }, ROTATE_MS)
    return () => clearTimeout(timer)
  }, [paused, reducedMotion, slides.length, cycle])

  return (
    <section
      className={`expertise${paused ? ' is-paused' : ''}`}
      aria-labelledby="expertise-title"
      style={{ '--rotate-ms': `${ROTATE_MS}ms` } as React.CSSProperties}
      onPointerEnter={(event) => {
        // touch fires enter without a matching leave, which would stall the rotation
        if (event.pointerType !== 'touch') setPaused(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'touch') return
        setPaused(false)
        setCycle((c) => c + 1)
      }}
    >
      <div className="expertise-inner">
        <div className="expertise-media">
          {slides.map((slide, i) => {
            const src = slide.media?.url ?? slide.fallbackSrc
            return (
              // eslint-disable-next-line @next/next/no-img-element -- media served from object storage, dimensions vary
              <img
                key={slide.label}
                className={`expertise-slide${i === active ? ' is-active' : ''}`}
                src={src}
                srcSet={slide.media?.srcSet ?? undefined}
                sizes={slide.media?.srcSet ? '(max-width: 1100px) 90vw, 47vw' : undefined}
                alt={i === active ? slide.media?.alt || `Featured ${slide.label} work` : ''}
                decoding="async"
              />
            )
          })}
        </div>

        <div className="expertise-body">
          <p className="chip">What I Offer</p>

          <h2 className="visually-hidden" id="expertise-title">
            What I offer
          </h2>

          <ul className="expertise-list">
            {slides.map((slide, i) => (
              <li key={slide.label} className={i === active ? 'is-active' : undefined}>
                <button type="button" aria-pressed={i === active} onClick={() => pick(i)}>
                  {slide.label}
                </button>
                {/* remounting on every cycle restarts the sweep from zero */}
                {i === active && (
                  <span key={cycle} className="expertise-timer" aria-hidden="true" />
                )}
              </li>
            ))}
          </ul>

          <p className="expertise-note">
            As a graphic designer I created and produced content from all types of media.
          </p>

          <Link href="/work" className="btn btn-primary">
            Learn More
          </Link>
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element -- decorative shape */}
      <img className="expertise-decor" src="/decor/shape-expertise.svg" alt="" aria-hidden="true" />
    </section>
  )
}
