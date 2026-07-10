import type { CollectionConfig } from 'payload'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

/**
 * A collection of work — a client or project (e.g. "Grand Archive") that
 * groups uploaded media. Every collection appears as a card on the home page
 * work rail (no featured switch to forget), linking to its own page at
 * /work/<slug> with all of its media in a gallery grid. Media joins a
 * collection via the optional `collection` field on uploads.
 */
export const Collections: CollectionConfig = {
  slug: 'collections',
  labels: {
    singular: 'Collection',
    plural: 'Collections',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'blurb', 'updatedAt'],
    description:
      'Each collection is a card on the home page. Drag rows in this list to set their order.',
  },
  // drag-and-drop ordering in the admin list — the home page sorts by this
  orderable: true,
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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Leave blank to generate from the name.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => value || (typeof data?.name === 'string' ? slugify(data.name) : value),
        ],
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Cover image for the home page card and the collection page header.',
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
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional intro shown at the top of the collection page.',
      },
    },
  ],
}
