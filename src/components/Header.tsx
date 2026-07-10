'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { siteConfig, type NavItem } from '@/site.config'
import { ChevronDown, Close, Menu } from '@/components/icons'

/** `/#about` points at a section of the home page, not a route of its own. */
const routeOf = (href: string) => href.split('#')[0] || '/'

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null)
  const headerRef = React.useRef<HTMLElement>(null)

  const isActive = (item: NavItem) => {
    // in-page anchors like `/#about` share the home route — they never own it
    if (item.href.includes('#')) return false
    const route = routeOf(item.href)
    if (route === '/') return pathname === '/'
    if (pathname.startsWith(route)) return true
    return (item.children ?? []).some((child) => pathname.startsWith(routeOf(child.href)))
  }

  // following a link should leave nothing hanging open
  const closeAll = () => {
    setMenuOpen(false)
    setOpenDropdown(null)
  }

  React.useEffect(() => {
    if (!menuOpen && !openDropdown) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAll()
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) closeAll()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen, openDropdown])

  return (
    <header className="site-header" ref={headerRef}>
      <div className="nav-bar">
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <Close /> : <Menu />}
        </button>

        <nav id="site-nav" className={`site-nav${menuOpen ? ' is-open' : ''}`}>
          {siteConfig.nav.map((item) => {
            const current = isActive(item) ? 'page' : undefined

            if (!item.children) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="nav-link"
                  aria-current={current}
                  onClick={closeAll}
                >
                  {item.label}
                </Link>
              )
            }

            const dropdownId = `nav-menu-${item.label.toLowerCase()}`
            const expanded = openDropdown === item.label

            return (
              <div
                key={item.label}
                className={`nav-item has-children${expanded ? ' is-open' : ''}`}
              >
                <Link
                  href={item.href}
                  className="nav-link"
                  aria-current={current}
                  onClick={closeAll}
                >
                  {item.label}
                </Link>
                <button
                  type="button"
                  className="nav-caret"
                  aria-expanded={expanded}
                  aria-controls={dropdownId}
                  aria-label={`${expanded ? 'Hide' : 'Show'} ${item.label} pages`}
                  onClick={() => setOpenDropdown(expanded ? null : item.label)}
                >
                  <ChevronDown />
                </button>
                <ul id={dropdownId} className="nav-menu">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        aria-current={pathname.startsWith(routeOf(child.href)) ? 'page' : undefined}
                        onClick={closeAll}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </nav>

        <Link href="/" className="logo" aria-label={`${siteConfig.name} — home`} onClick={closeAll}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand mark, no optimization needed */}
          <img src={siteConfig.logo.light} alt="" width={59} height={40} />
        </Link>

        <Link href="/contact" className="btn btn-primary nav-cta" onClick={closeAll}>
          Let&rsquo;s Talk
        </Link>
      </div>
    </header>
  )
}
