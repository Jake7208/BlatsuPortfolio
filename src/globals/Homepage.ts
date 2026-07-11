import type { GlobalConfig } from 'payload'

/**
 * Singleton settings for the home page — shows up in the admin sidebar as
 * "Homepage" so there's one obvious place to curate what the page features.
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'offer',
      label: 'What I Offer — disciplines',
      type: 'array',
      labels: {
        singular: 'Discipline',
        plural: 'Disciplines',
      },
      admin: {
        initCollapsed: false,
        description:
          'The rotation in the “What I Offer” section on the home page. Pick the image each discipline shows while it’s highlighted. Leave the image empty to automatically feature the newest case study tagged with the same name.',
      },
      defaultValue: [
        { label: 'Graphic Design' },
        { label: 'Photography' },
        { label: 'Marketing & Social Media' },
      ],
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Shown while this discipline is highlighted.',
          },
        },
      ],
    },
  ],
}
