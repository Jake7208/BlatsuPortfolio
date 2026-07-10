import Link from 'next/link'
import React from 'react'

import type { Collection } from '@/payload-types'
import Media from '@/components/Media'
import { mediaInfo } from '@/lib/media'

/** Only the fields the rail renders — lets pages query with `select`. */
export type RailCollection = Pick<Collection, 'id' | 'name' | 'slug' | 'blurb' | 'cover'>

/**
 * The home page's work rail: one card per collection (a client / body of
 * work), cover first, caption and name underneath. Each card links to the
 * collection's own page with all of its media.
 */
export default function CollectionsRail({ collections }: { collections: RailCollection[] }) {
  return (
    <div className="work-grid work-rail">
      {collections.map((collection, i) => {
        const media = mediaInfo(collection.cover)
        return (
          <div key={collection.id} className={`work-item reveal reveal-delay-${(i % 3) + 1}`}>
            <Link href={`/work/${collection.slug}`} className="work-card">
              {media ? (
                <Media
                  src={media.url}
                  srcSet={media.srcSet}
                  sizes="(max-width: 768px) 90vw, 40vw"
                  alt={media.alt || `${collection.name} — selected work`}
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
                {collection.blurb && <p className="work-card-info">{collection.blurb}</p>}
                <h3 className="work-card-title">{collection.name}</h3>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
