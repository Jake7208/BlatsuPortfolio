import type { Metadata } from 'next'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import VideoCard from '@/components/VideoCard'
import { mediaInfo } from '@/lib/media'

// statically rendered, refreshed in the background at most once a minute
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Videography',
  description:
    'Video work by Jaden Robertson — edits, motion and campaign video from across the anime and manga industry.',
}

export default async function VideosPage() {
  const payload = await getPayload({ config: await config })

  const { docs, totalDocs } = await payload.find({
    collection: 'videos',
    where: { _status: { not_equals: 'draft' } },
    limit: 50,
    sort: '-publishedAt',
    depth: 1,
    select: {
      title: true,
      youtubeUrl: true,
      roles: true,
      year: true,
      description: true,
      thumbnail: true,
    },
  })

  return (
    <>
      <section className="page-intro container">
        <p className="eyebrow">Videography / {totalDocs}</p>
        <h1>
          Edits, motion and <span>video work</span> from across the industry.
        </h1>
      </section>

      <section className="container">
        {docs.length > 0 ? (
          <div className="video-list">
            {docs.map((video) => {
              const thumb = mediaInfo(video.thumbnail)
              const meta = [video.roles, video.year].filter(Boolean).join(' — ')
              return (
                <article key={video.id} className="video-card">
                  <VideoCard
                    url={video.youtubeUrl}
                    title={video.title}
                    thumbUrl={thumb?.url}
                    thumbSrcSet={thumb?.srcSet}
                  />
                  <div className="video-card-body">
                    <div className="video-card-head">
                      <h2>{video.title}</h2>
                      {meta && <p className="video-card-meta">{meta}</p>}
                    </div>
                    {video.description && <p className="video-card-desc">{video.description}</p>}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>Videos are on the way — check back soon.</p>
          </div>
        )}
      </section>
    </>
  )
}
