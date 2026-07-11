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
import MangaCanvas from '@/components/MangaCanvas'
import { mediaInfo } from '@/lib/media'

// statically rendered, refreshed in the background at most once a minute
export const revalidate = 60

/** The What I Offer rotation before anything is set in the admin — the
 * Homepage global (admin sidebar → Globals → Homepage) overrides labels and
 * images; a row without an image falls back to the newest case study tagged
 * with the same name, then to these static files. */
const DISCIPLINES = [
  { label: 'Graphic Design', fallbackSrc: '/offer/graphic-design.png' },
  { label: 'Photography', fallbackSrc: '/offer/photography.png' },
  { label: 'Marketing & Social Media', fallbackSrc: '/offer/marketing.jpg' },
]

export default async function HomePage() {
  const payload = await getPayload({ config: await config })

  // fetched first — its rows decide which discipline tags to query below
  const homepage = await payload.findGlobal({ slug: 'homepage', depth: 1 })
  const offerRows =
    homepage.offer && homepage.offer.length > 0
      ? homepage.offer
      : DISCIPLINES.map(({ label }) => ({ label, image: null }))

  const [collectionsRes, featuredRes, journalRes, testimonialRes, mediaFeaturedRes, ...disciplineRes] =
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
      payload.find({
        collection: 'media',
        where: { featured: { equals: true } },
        limit: 8,
        depth: 1,
      }),
      // newest piece of work per discipline — the fallback image for rows
      // where no image was picked in the Homepage global
      ...offerRows.map(({ label }) =>
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
  const featuredMedia = mediaFeaturedRes.docs
  const expertiseSlides = offerRows.map((row, i) => ({
    label: row.label,
    fallbackSrc: DISCIPLINES[i % DISCIPLINES.length].fallbackSrc,
    // the admin-picked image wins; otherwise the newest matching case study
    media: mediaInfo(row.image) ?? mediaInfo(disciplineRes[i]?.docs[0]?.mainMedia),
  }))

  let heroCovers = featuredMedia
    .map((mediaDoc) => mediaInfo(mediaDoc)?.url)
    .filter((url): url is string => typeof url === 'string' && url !== '')

  if (heroCovers.length === 0) {
    heroCovers = [
      '/offer/graphic-design.png',
      '/offer/photography.png',
      '/offer/marketing.jpg',
    ]
  }

  return (
    <>
      <section className="hero">
        <div className="hero-panel">
          <div className="hero-content">
            <h1 className="hero-title">
              <span>{siteConfig.name}</span>
              <span className="hero-tagline">I design brand systems and marketing campaigns for the anime and manga industry.</span>
            </h1>

            <ContactButton className="btn btn-primary btn-lg">
              Get In Touch
              <ArrowRight className="btn-arrow" />
            </ContactButton>
          </div>

          <MangaCanvas covers={heroCovers} />
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

        <div className="about-body reveal">
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
        <h2 className="work-showcase-title reveal" id="work-title">
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
          <div className="testimonials-inner reveal">
            <p className="chip">Testimonials</p>
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

        <h2 className="blog-section-title reveal" id="blog-title">
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
