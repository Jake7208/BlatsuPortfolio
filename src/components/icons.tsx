import React from 'react'

// Minimal inline icons drawn with `currentColor` so they inherit the
// surrounding text color. Swap for your own icon set when styling.

type IconProps = React.SVGProps<SVGSVGElement>

const cx = (base: string, extra?: string) => (extra ? `${base} ${extra}` : base)

export function ArrowRight({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('arrow-icon', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}

export function ArrowLeft({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('arrow-icon', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M19 12H5m6-7-7 7 7 7" />
    </svg>
  )
}

export function ChevronDown({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('chevron-icon', className)}
      viewBox="0 0 10 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="m1 1 4 4 4-4" />
    </svg>
  )
}

export function Menu({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('menu-icon', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function Close({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('menu-icon', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

// Oversized double quotation mark for the testimonials section.
export function Quote({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('quote-icon', className)}
      viewBox="0 0 49 36"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M0 36V21.6C0 10 6.9 2.3 18.6 0l2.2 5.4C13.9 7.6 10.4 11.8 10 17h10.4v19H0Z" />
      <path d="M28.2 36V21.6C28.2 10 35.1 2.3 46.8 0L49 5.4C42.1 7.6 38.6 11.8 38.2 17h10.4v19H28.2Z" />
    </svg>
  )
}

// Solid play triangle for video cover stills. The path's bounding box is
// centered in the viewBox — optical centering is the stylesheet's job.
export function Play({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('play-icon', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M6.8 5.5v13L17.2 12Z" />
    </svg>
  )
}

// Outline heart that fills with `currentColor` when its button carries `.is-liked`.
export function Heart({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('heart-icon', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  )
}
