'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { siteConfig, type NavItem } from '@/site.config'
import { useContactModal } from '@/components/ContactModal'
import { ChevronDown, Close, Menu } from '@/components/icons'

/** `/#about` points at a section of the home page, not a route of its own. */
const routeOf = (href: string) => href.split('#')[0] || '/'

export default function Header() {
  const pathname = usePathname()
  const { open: openContact } = useContactModal()
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
              // contact opens as a popup instead of navigating
              if (routeOf(item.href) === '/contact') {
                return (
                  <button
                    key={item.label}
                    type="button"
                    className="nav-link"
                    onClick={() => {
                      closeAll()
                      openContact()
                    }}
                  >
                    {item.label}
                  </button>
                )
              }
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
                {/* the parent only toggles its dropdown — clicking "Work"
                    (once or twice) never navigates; pages are picked below */}
                <button
                  type="button"
                  className="nav-link nav-parent"
                  aria-current={current}
                  aria-expanded={expanded}
                  aria-controls={dropdownId}
                  onClick={() => setOpenDropdown(expanded ? null : item.label)}
                >
                  {item.label}
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

        <button
          type="button"
          className="btn btn-primary nav-cta"
          onClick={() => {
            closeAll()
            openContact()
          }}
        >
          Let&rsquo;s Talk
        </button>
      </div>
    </header>
  )
}
