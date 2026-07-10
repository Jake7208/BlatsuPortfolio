import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import React, { cache } from 'react'

import config from '@/payload.config'
import ArticleBody from '@/components/ArticleBody'
import CaseStudyGrid from '@/components/CaseStudyGrid'
import CommentsSection from '@/components/CommentsSection'
import GalleryGrid, { type GalleryItem } from '@/components/GalleryGrid'
import { mediaInfo, ratioFor } from '@/lib/media'

// statically rendered per slug, refreshed in the background at most once a minute
export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

// /work/<slug> serves case studies and collections from one namespace —
// case studies win if a slug ever exists in both.

// cache() dedupes the generateMetadata + page queries into one DB hit
const getPost = cache(async (slug: string) => {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: slug }, _status: { not_equals: 'draft' } },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
})

const getCollection = cache(async (slug: string) => {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'collections',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (post) {
    return { title: post.title, description: post.excerpt || post.roles || post.title }
  }
  const collection = await getCollection(slug)
  if (collection) {
    return {
      title: collection.name,
      description: collection.description || collection.blurb || `${collection.name} — selected work`,
    }
  }
  return {}
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (post) return <CaseStudyView slug={slug} post={post} />

  const collection = await getCollection(slug)
  if (!collection) notFound()
  return <CollectionView collection={collection} />
}

async function CaseStudyView({
  slug,
  post,
}: {
  slug: string
  post: NonNullable<Awaited<ReturnType<typeof getPost>>>
}) {
  const payload = await getPayload({ config: await config })
  const { docs: more } = await payload.find({
    collection: 'case-studies',
    where: { slug: { not_equals: slug }, _status: { not_equals: 'draft' } },
    limit: 2,
    sort: '-publishedAt',
    depth: 1,
    select: { title: true, slug: true, roles: true, year: true, mainMedia: true, tags: true },
  })

  return (
    <>
      <ArticleBody post={post} />

      <CommentsSection postId={post.id} postType="case-studies" />

      {more.length > 0 && (
        <section className="section container">
          <div className="section-head">
            <h2>More work</h2>
            <Link href="/work">All work</Link>
          </div>
          <CaseStudyGrid posts={more} />
        </section>
      )}
    </>
  )
}

async function CollectionView({
  collection,
}: {
  collection: NonNullable<Awaited<ReturnType<typeof getCollection>>>
}) {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'media',
    where: { workCollection: { equals: collection.id } },
    limit: 200,
    sort: '-createdAt',
    depth: 1,
    select: {
      alt: true,
      description: true,
      dateTaken: true,
      url: true,
      mimeType: true,
      width: true,
      height: true,
      sizes: true,
      tags: true,
      // url/sizes URLs are generated at read time from these — they must be selected too
      filename: true,
      prefix: true,
    },
  })

  const items: GalleryItem[] = docs.flatMap((doc) => {
    const info = mediaInfo(doc)
    if (!info || !(info.mime?.startsWith('image/') || info.mime?.startsWith('video/'))) return []
    return [
      {
        id: doc.id,
        url: info.url,
        srcSet: info.srcSet,
        thumbUrl: doc.sizes?.thumbnail?.url || info.url,
        alt: info.alt,
        description: doc.description ?? null,
        dateTaken: doc.dateTaken ?? null,
        tags: (doc.tags ?? [])
          .filter((t): t is Exclude<typeof t, string> => typeof t !== 'string')
          .map((t) => t.name),
        mime: info.mime,
        ratio: ratioFor(info),
        width: info.width,
        height: info.height,
      },
    ]
  })

  return (
    <>
      <section className="page-intro container">
        <p className="eyebrow">Collection / {items.length}</p>
        <h1>{collection.name}</h1>
        {(collection.description || collection.blurb) && (
          <p className="collection-intro">{collection.description || collection.blurb}</p>
        )}
      </section>

      <section className="container">
        {items.length > 0 ? (
          <GalleryGrid items={items} />
        ) : (
          <div className="empty-state">
            <p>
              Nothing in this collection yet — assign media to it in the admin panel and it shows
              up here.
            </p>
          </div>
        )}
      </section>
    </>
  )
}
