'use client'

import React from 'react'
import { createPortal } from 'react-dom'

import { siteConfig } from '@/site.config'
import { ArrowRight, Close } from '@/components/icons'

type Reason = 'job' | 'inquiry' | 'other'

// values must match the `topic` select options in collections/ContactSubmissions.ts
const REASONS: { value: Reason; label: string }[] = [
  { value: 'job', label: 'Job Opportunity' },
  { value: 'inquiry', label: 'Inquiry' },
  { value: 'other', label: 'Other' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPTY = { firstName: '', lastName: '', email: '', reason: '' as Reason | '', message: '' }

const ContactModalContext = React.createContext<{ open: () => void } | null>(null)

export function useContactModal() {
  const ctx = React.useContext(ContactModalContext)
  if (!ctx) throw new Error('useContactModal must be used inside <ContactModalProvider>')
  return ctx
}

/** A button that opens the contact modal — for use anywhere in the site chrome. */
export function ContactButton({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { open } = useContactModal()
  return (
    <button type="button" className={className} onClick={open}>
      {children}
    </button>
  )
}

/**
 * Site-wide contact popup (the Figma "Contact Active" frame): header links and
 * buttons open it in place instead of navigating. /contact redirects to
 * /?contact=open for old links — the mount effect below catches that.
 */
export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const open = React.useCallback(() => setIsOpen(true), [])
  const close = React.useCallback(() => setIsOpen(false), [])

  // old /contact links land on /?contact=open (server redirect → full load)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('contact') === 'open') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL on mount; can't be initial state (SSR has no window)
      setIsOpen(true)
      params.delete('contact')
      const query = params.toString()
      window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`)
    }
  }, [])

  return (
    <ContactModalContext.Provider value={React.useMemo(() => ({ open }), [open])}>
      {children}
      {isOpen && <ContactDialog close={close} />}
    </ContactModalContext.Provider>
  )
}

function ContactDialog({ close }: { close: () => void }) {
  const closeRef = React.useRef<HTMLButtonElement>(null)
  const [values, setValues] = React.useState(EMPTY)
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  // scroll lock + keyboard while open
  React.useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [close])

  const set =
    (key: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (values.firstName.trim().length < 1) return setError('Please enter your first name.')
    if (values.lastName.trim().length < 1) return setError('Please enter your last name.')
    if (!EMAIL_RE.test(values.email.trim())) return setError('That email doesn’t look right yet.')

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${values.firstName.trim()} ${values.lastName.trim()}`,
          email: values.email.trim(),
          topic: values.reason || undefined,
          message: values.message.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      setValues(EMPTY)
      setSent(true)
    } catch {
      setError('Something went wrong sending that — try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div
      className="contact-overlay"
      data-lenis-prevent
      onClick={(e) => {
        // clicking the dimmed backdrop closes, like the lightbox
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
        <div className="contact-modal-head">
          <h2 className="contact-modal-title" id="contact-modal-title">
            Contact {siteConfig.name} | ジェーデン・ロバートソン
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="contact-modal-close"
            onClick={close}
            aria-label="Close contact form"
          >
            <Close />
          </button>

          <div className="contact-modal-links">
            <a className="btn btn-primary contact-modal-email" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
            <ul className="contact-modal-social">
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
        </div>

        {sent ? (
          <div className="contact-modal-body contact-modal-done">
            <p>Thanks — your message is on its way.</p>
            <button type="button" className="btn btn-primary" onClick={close}>
              Close
            </button>
          </div>
        ) : (
          <form className="contact-modal-body" onSubmit={submit} noValidate>
            <div className="contact-modal-names">
              <label className="contact-modal-field">
                <span>
                  First Name <em aria-hidden="true">*</em>
                </span>
                <input
                  type="text"
                  autoComplete="given-name"
                  placeholder="Enter First Name"
                  value={values.firstName}
                  onChange={set('firstName')}
                  required
                />
              </label>
              <label className="contact-modal-field">
                <span>
                  Last Name <em aria-hidden="true">*</em>
                </span>
                <input
                  type="text"
                  autoComplete="family-name"
                  placeholder="Enter Last Name"
                  value={values.lastName}
                  onChange={set('lastName')}
                  required
                />
              </label>
            </div>

            <label className="contact-modal-field">
              <span>
                Email <em aria-hidden="true">*</em>
              </span>
              <input
                type="email"
                autoComplete="email"
                placeholder="Enter Your Email"
                value={values.email}
                onChange={set('email')}
                required
              />
            </label>

            <fieldset className="contact-modal-reasons">
              <legend>Reason For Contact</legend>
              <div className="contact-modal-pills">
                {REASONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`contact-pill${values.reason === value ? ' is-selected' : ''}`}
                    aria-pressed={values.reason === value}
                    onClick={() =>
                      setValues((v) => ({ ...v, reason: v.reason === value ? '' : value }))
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="contact-modal-field contact-modal-textarea">
              <span>Additional Information</span>
              <textarea
                rows={6}
                placeholder="Add Any Additional info here. . ."
                value={values.message}
                onChange={set('message')}
              />
            </label>

            {error && <p className="contact-error">{error}</p>}

            <div className="contact-modal-actions">
              <button type="submit" className="btn btn-primary contact-modal-send" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Form'}
                <ArrowRight className="contact-send-arrow" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  )
}
