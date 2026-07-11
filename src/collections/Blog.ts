import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { videoEmbedBlock } from '../blocks/videoEmbed'
import { siteConfig } from '../site.config'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export const Blog: CollectionConfig = {
  slug: 'blog',
  labels: {
    singular: 'Blog Post',
    plural: 'Blog Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'publishedAt', 'updatedAt'],
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  access: {
    // the public only sees published posts; logged-in users see everything
    read: ({ req }) => {
      if (req.user) return true
      return { _status: { equals: 'published' } }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Leave blank to generate from the title.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) =>
            value || (typeof data?.title === 'string' ? slugify(data.title) : value),
        ],
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'author',
      type: 'text',
      defaultValue: siteConfig.author,
      admin: {
        position: 'sidebar',
        description: 'Shown as “Written by …” on the post.',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Categories',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short teaser shown on cards and used as the SEO description.',
      },
    },
    {
      name: 'mainMedia',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image / Video',
      admin: {
        description:
          'The post page crops this to a wide banner. Edit the image and drag the focal point to choose what stays centered — the preview below shows the result.',
      },
    },
    {
      // renders the chosen cover in the post page's banner frame so the
      // crop is visible before publishing — stores nothing
      name: 'coverPreview',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/CoverPreview',
        },
      },
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Body',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({ blocks: [videoEmbedBlock] }),
        ],
      }),
      admin: {
        description:
          'The post itself — headings, text, images and video all live here. For long videos, add a “YouTube Video” block (via the + menu or /) instead of uploading the file.',
      },
    },
  ],
}
