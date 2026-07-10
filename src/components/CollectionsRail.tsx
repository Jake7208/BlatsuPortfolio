import Link from 'next/link'
import React from 'react'

import type { Tag } from '@/payload-types'
import Media from '@/components/Media'
import { mediaInfo } from '@/lib/media'

/** Only the fields the rail renders — lets pages query with `select`. */
export type FeaturedCollection = Pick<Tag, 'id' | 'name' | 'blurb' | 'cover'>

/**
 * The home page's work rail: one card per featured tag (a client / collection
 * of work), cover first, caption and name underneath. Each card deep-links
 * into the work index pre-filtered to that tag.
 */
export default function CollectionsRail({ collections }: { collections: FeaturedCollection[] }) {
  return (
    <div className="work-grid work-rail">
      {collections.map((tag, i) => {
        const media = mediaInfo(tag.cover)
        return (
          <div key={tag.id} className="work-item">
            <Link href={`/work?tag=${encodeURIComponent(tag.name)}`} className="work-card">
              {media ? (
                <Media
                  src={media.url}
                  srcSet={media.srcSet}
                  sizes="(max-width: 768px) 90vw, 40vw"
                  alt={media.alt || `${tag.name} — selected work`}
                  mimeType={media.mime}
                  width={media.width}
                  height={media.height}
                />
              ) : (
                <div className="media-frame work-card-empty">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                </div>
              )}
              <div className="work-card-meta">
                {tag.blurb && <p className="work-card-info">{tag.blurb}</p>}
                <h3 className="work-card-title">{tag.name}</h3>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
