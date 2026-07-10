import type { CollectionConfig } from 'payload'

/**
 * Plain labels for filtering — case studies, blog posts and gallery media all
 * reference tags. Grouping work under a cover lives in the Collections
 * collection instead.
 */
export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
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
  ],
}
