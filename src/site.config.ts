/**
 * One place for everything site-specific. Fill this out first when starting a
 * new site — the layout, header, footer, metadata and Payload defaults all
 * read from here.
 */

/** A nav entry. `children` turns it into a dropdown in the header. */
export type NavItem = {
  href: string
  label: string
  children?: NavItem[]
}

export type SocialLink = {
  label: string
  href: string
  /** Path under /public — rendered as the icon inside the footer's round chip. */
  icon: string
}

type SiteConfig = {
  name: string
  description: string
  author: string
  email: string
  location: { line1: string; line2: string }
  /** Brand mark shown in the header (light background) and footer (dark background). */
  logo: { light: string; dark: string }
  social: SocialLink[]
  nav: NavItem[]
  footerNav: NavItem[]
  credit: { label: string; href?: string }
}

export const siteConfig: SiteConfig = {
  /** Site / brand name — used in the <title> template and the header logo slot. */
  name: 'Jaden Robertson',

  /** Default meta description for the whole site. */
  description:
    'Graphic designer and marketer in New York working across the anime and manga industry.',

  /** The person (or studio) behind the site — used as the default post author. */
  author: 'Jaden Robertson',

  /** Public contact email shown in the footer and the contact popup. */
  email: 'Blastoon14@gmail.com',

  /** Shown in the footer's location column and the hero's corner rail. */
  location: {
    line1: 'New York, USA',
    line2: 'EST — UTC−5',
  },

  logo: {
    light: '/brand/logo.svg',
    dark: '/brand/logo-footer.svg',
  },

  /** External profiles listed in the footer. */
  social: [
    { label: 'X', href: 'https://x.com/USERNAME', icon: '/social/x.svg' },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/USERNAME/',
      icon: '/social/linkedin.svg',
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/USERNAME/',
      icon: '/social/instagram.svg',
    },
    { label: 'TikTok', href: 'https://www.tiktok.com/@USERNAME', icon: '/social/tiktok.svg' },
    { label: 'YouTube', href: 'https://www.youtube.com/@USERNAME', icon: '/social/youtube.svg' },
  ],

  /** Primary navigation. The header renders `children` as a dropdown. */
  nav: [
    { href: '/', label: 'Home' },
    { href: '/#about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    {
      href: '/work',
      label: 'Work',
      children: [
        { href: '/work', label: 'Case studies' },
        { href: '/videos', label: 'Videography' },
        { href: '/blog', label: 'Blog' },
        { href: '/gallery', label: 'Gallery' },
      ],
    },
  ],

  /** The footer lists services alongside pages, so it keeps its own set. */
  footerNav: [
    { href: '/', label: 'Home' },
    { href: '/contact', label: 'Contact' },
    { href: '/#about', label: 'About' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/videos', label: 'Video Editing' },
  ],

  credit: { label: 'Site By Jacob Price' },
}
