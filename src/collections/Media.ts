import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      // 'collection' itself is a reserved mongoose pathname — hence the prefix
      name: 'workCollection',
      label: 'Collection',
      type: 'relationship',
      relationTo: 'collections',
      admin: {
        description:
          'Which collection of work this belongs to — shows on that collection’s page. Leave empty if it’s not part of one; it just stays in the library (and the gallery, if tagged).',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: 'Tagged images appear in the site gallery, filterable by tag.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'The most recently updated featured photo fills the full-width gallery band on the homepage.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Shown next to the image in the gallery lightbox.',
      },
    },
    {
      name: 'dateTaken',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'When the photo was taken — shown in the gallery lightbox.',
      },
    },
  ],
  upload: {
    // Payload core builds string-based adminThumbnail URLs against its own
    // /api/media/file route, which is disabled when files are served straight
    // from R2 — so build the public URL from the stored filename instead.
    adminThumbnail: ({ doc }) => {
      const sizes = doc?.sizes as { thumbnail?: { filename?: string | null } } | undefined
      const filename = sizes?.thumbnail?.filename || (doc?.filename as string | undefined)
      if (!filename) return null
      const base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '')
      return base
        ? `${base}/${encodeURIComponent(filename)}`
        : `/api/media/file/${encodeURIComponent(filename)}`
    },
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 480,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1440,
      },
      {
        name: 'xlarge',
        width: 2048,
      },
    ],
  },
}
