import type { CollectionConfig } from 'payload'

import { youtubeId } from '../lib/youtube'

/**
 * Videography portfolio pieces, shown on /videos. The video itself lives on
 * YouTube (so long-form content never hits R2) — each entry is a link plus
 * presentation details.
 */
export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: {
    singular: 'Video',
    plural: 'Videos',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'year', 'publishedAt', 'updatedAt'],
    description: 'Videography portfolio — each entry shows on the Videography page.',
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  access: {
    // the public only sees published videos; logged-in users see everything
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
      name: 'youtubeUrl',
      label: 'YouTube link',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value) return 'Paste a YouTube link.'
        return youtubeId(value)
          ? true
          : 'That doesn’t look like a YouTube link — use the “Share” button on the video and paste it here.'
      },
      admin: {
        placeholder: 'https://youtu.be/…',
        description: 'Upload the video to YouTube (unlisted works fine), then paste its link.',
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
        description: 'Newest first on the page.',
      },
    },
    {
      name: 'year',
      type: 'number',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'roles',
      type: 'text',
      label: 'Roles / Services',
      admin: {
        placeholder: 'e.g. Direction & Editing',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'A sentence or two shown under the player.',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional cover still shown before the video plays. Leave empty to use YouTube’s own thumbnail.',
      },
    },
  ],
}
