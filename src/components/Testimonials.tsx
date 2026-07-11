'use client'

import React, { useState } from 'react'

import type { Testimonial } from '@/payload-types'
import { ArrowLeft, ArrowRight, Quote } from '@/components/icons'
import { mediaInfo } from '@/lib/media'

/** Only the fields the list renders — lets pages query with `select`. */
export type TestimonialCard = Pick<
  Testimonial,
  'id' | 'name' | 'role' | 'company' | 'companyLogo' | 'image' | 'quote'
>

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * One oversized quote at a time, typography-led: quote mark, the quote itself,
 * an avatar chip, and arrow navigation with a counter. Keyed on the active
 * index so each switch replays the fade-in.
 */
export default function Testimonials({ items }: { items: TestimonialCard[] }) {
  const [active, setActive] = useState(0)

  if (items.length === 0) return null

  const current = items[active] ?? items[0]
  const portrait = mediaInfo(current.image)
  const detail = [current.role, current.company].filter(Boolean).join(' — ')
  const step = (dir: 1 | -1) => setActive((i) => (i + dir + items.length) % items.length)

  return (
    <div className="testimonial" aria-live="polite">
      <Quote className="testimonial-mark" />

      <div className="testimonial-body" key={active}>
        <blockquote className="testimonial-quote">&ldquo;{current.quote}&rdquo;</blockquote>

        <div className="testimonial-who">
          {portrait && (
            // eslint-disable-next-line @next/next/no-img-element -- media served from object storage, dimensions vary
            <img
              className="testimonial-avatar"
              src={portrait.url}
              srcSet={portrait.srcSet ?? undefined}
              sizes={portrait.srcSet ? '48px' : undefined}
              alt={portrait.alt || current.name}
              loading="lazy"
              decoding="async"
            />
          )}
          <span className="testimonial-meta">
            <span className="testimonial-name">{current.name}</span>
            {detail && <span className="testimonial-role">{detail}</span>}
          </span>
        </div>
      </div>

      {items.length > 1 && (
        <div className="testimonial-controls">
          <button
            type="button"
            className="testimonial-nav"
            onClick={() => step(-1)}
            aria-label="Previous testimonial"
          >
            <ArrowLeft />
          </button>
          <span className="testimonial-count">
            {pad(active + 1)} / {pad(items.length)}
          </span>
          <button
            type="button"
            className="testimonial-nav"
            onClick={() => step(1)}
            aria-label="Next testimonial"
          >
            <ArrowRight />
          </button>
        </div>
      )}
    </div>
  )
}
