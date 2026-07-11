import type { Block } from 'payload'

import { youtubeId } from '../lib/youtube'

/**
 * A YouTube embed. Long-form video lives on YouTube instead of being uploaded,
 * so big files never hit R2 storage — used in the blog body editor and the
 * case-study content blocks.
 */
export const videoEmbedBlock: Block = {
  slug: 'videoEmbed',
  labels: {
    singular: 'YouTube Video',
    plural: 'YouTube Videos',
  },
  fields: [
    {
      name: 'url',
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
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional — shown under the video.',
      },
    },
  ],
}
