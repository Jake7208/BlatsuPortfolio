import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import config from '@/payload.config'
import { siteConfig } from '@/site.config'
import CaseStudyGrid from '@/components/CaseStudyGrid'
import { ContactButton } from '@/components/ContactModal'
import CollectionsRail from '@/components/CollectionsRail'
import Expertise from '@/components/Expertise'
import JournalList from '@/components/JournalList'
import Testimonials from '@/components/Testimonials'
import TrustedBy from '@/components/TrustedBy'
import { ArrowRight } from '@/components/icons'
import { mediaInfo } from '@/lib/media'

// statically rendered, refreshed in the background at most once a minute
export const revalidate = 60

/** The disciplines listed in the What I Offer rotation — labels must match tag
 * names in the admin panel for their featured work to appear; until then each
 * slide shows its static fallback so the rotation is visible out of the box. */
const DISCIPLINES = [
  { label: 'Graphic Design', fallbackSrc: '/offer/graphic-design.png' },
  { label: 'Photography', fallbackSrc: '/offer/photography.png' },
  { label: 'Marketing & Social Media', fallbackSrc: '/offer/marketing.jpg' },
]

export default async function HomePage() {
  const payload = await getPayload({ config: await config })

  const [collectionsRes, featuredRes, journalRes, testimonialRes, ...disciplineRes] =
    await Promise.all([
      payload.find({
        collection: 'collections',
        limit: 8,
        // drag order from the admin list view
        sort: '_order',
        depth: 1,
        select: { name: true, slug: true, blurb: true, cover: true },
      }),
      payload.find({
        collection: 'case-studies',
        where: { _status: { not_equals: 'draft' } },
        limit: 3,
        sort: '-publishedAt',
        depth: 1,
        select: {
          title: true,
          slug: true,
          roles: true,
          year: true,
          mainMedia: true,
          tags: true,
        },
      }),
      payload.find({
        collection: 'blog',
        where: { _status: { not_equals: 'draft' } },
        limit: 2,
        sort: '-publishedAt',
        depth: 1,
        select: {
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
          tags: true,
          mainMedia: true,
        },
      }),
      payload.find({
        collection: 'testimonials',
        where: { featured: { equals: true } },
        limit: 6,
        // drag order from the admin list view
        sort: '_order',
        depth: 1,
        select: {
          name: true,
          role: true,
          company: true,
          companyLogo: true,
          image: true,
          quote: true,
        },
      }),
      // newest piece of work per discipline, for the What I Offer rotation
      ...DISCIPLINES.map(({ label }) =>
        payload.find({
          collection: 'case-studies',
          where: {
            and: [{ _status: { not_equals: 'draft' } }, { 'tags.name': { equals: label } }],
          },
          limit: 1,
          sort: '-publishedAt',
          depth: 1,
          select: { mainMedia: true },
        }),
      ),
    ])

  const collections = collectionsRes.docs
  const featured = featuredRes.docs
  const journal = journalRes.docs
  const testimonials = testimonialRes.docs
  const expertiseSlides = DISCIPLINES.map(({ label, fallbackSrc }, i) => ({
    label,
    fallbackSrc,
    media: mediaInfo(disciplineRes[i]?.docs[0]?.mainMedia),
  }))

  return (
    <>
      <section className="hero">
        <div className="hero-panel">
          <h1 className="hero-title">
            <span>{siteConfig.name}</span>
            <span>Graphic Designer &amp;</span>
            <span>Marketing Expert</span>
          </h1>

          <ContactButton className="btn btn-primary btn-lg">
            Get In Touch
            <ArrowRight className="btn-arrow" />
          </ContactButton>
        </div>

        <div className="hero-rail">
          <a className="hero-scroll" href="#about">
            Scroll Down
            <ArrowRight className="arrow-down" />
          </a>
          <p className="hero-location">
            <span className="dot" aria-hidden="true" />
            Based in {siteConfig.location.line1}
          </p>
        </div>
      </section>

      <TrustedBy />

      <section className="about" id="about" aria-labelledby="about-title">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative shape */}
        <img className="about-decor" src="/decor/shape-about.svg" alt="" aria-hidden="true" />

        <div className="about-body">
          <p className="chip">About</p>

          <h2 className="visually-hidden" id="about-title">
            About {siteConfig.name}
          </h2>

          <p className="about-text">
            <span className="about-lead">
              I&rsquo;m {siteConfig.name} (ジェーデン・ロバートソン), aka Blastsu,
            </span>{' '}
            <span>
              a graphic designer and marketer in NYC with a passion for anime and gaming. After a
              year-long internship at Yen Press, I now freelance for them as a video editor and
              designer. I also design logos and covers for J-Novel Club and handle social media
              marketing for TOKYOPOP.
            </span>
          </p>

          <Link href="/work" className="btn btn-primary">
            Read More
          </Link>
        </div>
      </section>

      <section className="work-showcase" aria-labelledby="work-title">
        <h2 className="work-showcase-title" id="work-title">
          In the manga industry I&rsquo;ve had many roles check out some of{' '}
          <span>my work.</span>
        </h2>

        {collections.length > 0 ? (
          <CollectionsRail collections={collections} />
        ) : featured.length > 0 ? (
          <CaseStudyGrid posts={featured} className="work-rail" />
        ) : (
          <div className="empty-state">
            <p>Nothing here yet — add a collection with a cover, or publish a case study.</p>
          </div>
        )}
      </section>

      <Expertise slides={expertiseSlides} />

      {testimonials.length > 0 && (
        <section className="testimonials" aria-labelledby="testimonials-title">
          <div className="testimonials-panel">
            <p className="chip chip-light">Testimonials</p>
            <h2 className="testimonials-title" id="testimonials-title">
              Hear what <span>others had to say.</span>
            </h2>
            <Testimonials items={testimonials} />
          </div>
        </section>
      )}

      <section className="blog-section" aria-labelledby="blog-title">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative shape */}
        <img className="blog-decor" src="/decor/shape-blog.svg" alt="" aria-hidden="true" />

        <h2 className="blog-section-title" id="blog-title">
          Stay updated in the anime &amp; manga industry
        </h2>

        {journal.length > 0 ? (
          <JournalList posts={journal} />
        ) : (
          <div className="empty-state">
            <p>Nothing published yet — the first post is coming.</p>
          </div>
        )}

        <Link href="/blog" className="btn btn-primary btn-shadow">
          All Blogs
        </Link>
      </section>
    </>
  )
}
