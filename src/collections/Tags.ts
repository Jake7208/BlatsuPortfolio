import type { CollectionConfig } from 'payload'

/**
 * Tags double as collections of work: a tag like "Grand Archive" groups every
 * case study done for that client, and — when featured with a cover — appears
 * as a card on the home page that deep-links into the filtered work index.
 */
export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'featured', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Cover image shown on the home page card for this collection.',
      },
    },
    {
      name: 'blurb',
      type: 'text',
      admin: {
        description: 'Caption under the card, e.g. "Graphic Design • Marketing".',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Featured collections appear as cards on the home page (needs a cover).',
      },
    },
  ],
}
