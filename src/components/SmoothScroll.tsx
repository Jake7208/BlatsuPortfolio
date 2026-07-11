'use client'

import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Site-wide Lenis smooth scrolling. `anchors` keeps in-page links (/#about,
 * #top) smooth; overlays that scroll internally opt out via
 * `data-lenis-prevent`. Skipped entirely under prefers-reduced-motion.
 */
export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ autoRaf: true, anchors: true })
    lenisRef.current = lenis
    return () => {
      lenisRef.current = null
      lenis.destroy()
    }
  }, [])

  // Route changes land at the top of the new page. Next resets the scroll
  // position itself, but Lenis's rAF loop writes the old position right back —
  // so the jump has to go through Lenis. Hash targets (/#about) are left to
  // their anchor behavior.
  useEffect(() => {
    if (window.location.hash) return
    lenisRef.current?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
