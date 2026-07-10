'use client'

import React, { useState } from 'react'

import type { Testimonial } from '@/payload-types'
import { mediaInfo } from '@/lib/media'

/** Only the fields the list renders — lets pages query with `select`. */
export type TestimonialCard = Pick<
  Testimonial,
  'id' | 'name' | 'role' | 'company' | 'companyLogo' | 'image' | 'quote'
>

/**
 * Quote switcher — a rail of names on the left, the selected quote on the right.
 * Follows the same `aria-pressed` button convention as the work and gallery filters.
 */
export default function Testimonials({ items }: { items: TestimonialCard[] }) {
  const [active, setActive] = useState(0)

  if (items.length === 0) return null

  const current = items[active] ?? items[0]
  const portrait = mediaInfo(current.image)

  return (
    <div className="testimonial-list">
      <div className="testimonial-rail">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={`testimonial-pill${i === active ? ' is-active' : ''}`}
            aria-pressed={i === active}
            aria-controls="testimonial-panel"
            onClick={() => setActive(i)}
          >
            {[item.name, item.company].filter(Boolean).join(', ')}
          </button>
        ))}
      </div>

      <figure className="testimonial" id="testimonial-panel">
        <blockquote className="testimonial-quote">&ldquo;{current.quote}&rdquo;</blockquote>

        <figcaption className="testimonial-who">
          {portrait && (
            // eslint-disable-next-line @next/next/no-img-element -- media served from object storage, dimensions vary
            <img
              className="testimonial-avatar"
              src={portrait.url}
              srcSet={portrait.srcSet ?? undefined}
              sizes={portrait.srcSet ? '55px' : undefined}
              alt={portrait.alt || current.name}
              loading="lazy"
              decoding="async"
            />
          )}
          <span>
            <span className="testimonial-name">{current.name}</span>
            {current.role && <span className="testimonial-role">, {current.role}</span>}
            {current.company && <span className="testimonial-company">{current.company}</span>}
          </span>
        </figcaption>
      </figure>
    </div>
  )
}
