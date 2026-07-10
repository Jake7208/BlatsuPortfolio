import type { Metadata } from 'next'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

import config from '@/payload.config'
import WorkIndex from '@/components/WorkIndex'

// statically rendered, refreshed in the background at most once a minute
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Case studies and selected work by Jaden Robertson — graphic design, marketing and social media across the anime and manga industry.',
}

export default async function WorkPage() {
  const payload = await getPayload({ config: await config })

  const { docs: posts, totalDocs } = await payload.find({
    collection: 'case-studies',
    where: { _status: { not_equals: 'draft' } },
    limit: 30,
    sort: '-publishedAt',
    depth: 1,
    // grid view never needs the article body — skip the heaviest field
    select: { title: true, slug: true, roles: true, year: true, mainMedia: true, tags: true },
  })

  return (
    <>
      <section className="page-intro container">
        <p className="eyebrow">Work / {totalDocs}</p>
        <h1>
          Covers, campaigns and case studies from <span>my work</span> in manga publishing.
        </h1>
      </section>

      <section className="container">
        {posts.length > 0 ? (
          // useSearchParams (the ?tag= deep link) requires a Suspense boundary to stay static
          <Suspense fallback={null}>
            <WorkIndex posts={posts} />
          </Suspense>
        ) : (
          <div className="empty-state">
            <p>Case studies are being written — check back soon.</p>
          </div>
        )}
      </section>
    </>
  )
}
