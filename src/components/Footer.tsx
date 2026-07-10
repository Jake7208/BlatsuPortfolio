import Link from 'next/link'
import React from 'react'

import { siteConfig } from '@/site.config'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="logo" aria-label={`${siteConfig.name} — home`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand mark, no optimization needed */}
            <img src={siteConfig.logo.dark} alt="" width={81} height={55} />
          </Link>

          <p className="footer-tagline">
            Expert in graphic design &amp; marketing in the anime and manga industry.
          </p>

          <a className="footer-email" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>

          <Link href="/contact" className="btn btn-primary">
            Contact Me
          </Link>

          <p className="footer-head">Follow Me</p>
          <ul className="footer-social">
            {siteConfig.social.map(({ label, href, icon }) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static icon, no optimization needed */}
                  <img src={icon} alt="" width={55} height={55} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-links">
          <p className="footer-head">Navigation</p>
          <nav className="footer-col">
            {siteConfig.footerNav.map(({ href, label }) => (
              <Link key={label} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          All Rights Reserved {siteConfig.author} &copy; {new Date().getFullYear()}
        </span>
        <span>{siteConfig.credit.label}</span>
        <a href="#top">Back To Top</a>
      </div>

      <div className="footer-rule" aria-hidden="true" />
    </footer>
  )
}
