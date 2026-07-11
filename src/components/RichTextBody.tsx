import React from 'react'
import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import type { Media } from '@/payload-types'
import { mediaInfo } from '@/lib/media'
import VideoEmbed from '@/components/VideoEmbed'

type VideoEmbedFields = {
  blockType: 'videoEmbed'
  url?: string | null
  caption?: string | null
}

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<VideoEmbedFields>

/**
 * Renders a Lexical rich-text field. The default converters cover headings,
 * lists, links etc. — uploads are overridden so videos get a <video> tag
 * instead of the default <img>, and the videoEmbed block becomes a YouTube
 * iframe.
 */
const converters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    videoEmbed: ({ node }) => (
      <VideoEmbed url={node.fields.url} caption={node.fields.caption} />
    ),
  },
  upload: ({ node }) => {
    const info = mediaInfo(node.value as Media | string | null)
    if (!info) return null

    if (info.mime?.startsWith('video/')) {
      return <video src={info.url} controls playsInline preload="metadata" />
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element -- media served from object storage, dimensions vary
      <img
        src={info.url}
        srcSet={info.srcSet ?? undefined}
        sizes={info.srcSet ? '(max-width: 900px) 100vw, 760px' : undefined}
        alt={info.alt}
        width={info.width ?? undefined}
        height={info.height ?? undefined}
        loading="lazy"
        decoding="async"
      />
    )
  },
})

export default function RichTextBody({ data }: { data: SerializedEditorState }) {
  return <RichText data={data} converters={converters} className="rich-text" />
}
