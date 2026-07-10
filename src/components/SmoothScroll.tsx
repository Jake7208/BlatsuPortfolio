'use client'

import Lenis from 'lenis'
import { useEffect } from 'react'

/**
 * Site-wide Lenis smooth scrolling. `anchors` keeps in-page links (/#about,
 * #top) smooth; overlays that scroll internally opt out via
 * `data-lenis-prevent`. Skipped entirely under prefers-reduced-motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ autoRaf: true, anchors: true })
    return () => lenis.destroy()
  }, [])

  return null
}
