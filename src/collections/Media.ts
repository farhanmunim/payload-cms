import path from 'path'
import type { CollectionConfig } from 'payload'

import { triggerDeployAfterChange, triggerDeployAfterDelete } from '../hooks/triggerDeploy'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Organisation',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [triggerDeployAfterChange],
    afterDelete: [triggerDeployAfterDelete],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Describes the image for screen readers and SEO. Not needed for documents.',
      },
      // Required for images only; attachments like PDFs don't need alt text
      validate: (value: string | null | undefined, { data }: { data: { mimeType?: string } }) => {
        if (!value && data?.mimeType?.startsWith('image/')) {
          return 'Alt text is required for images.'
        }
        return true
      },
    },
  ],
  upload: {
    // Stored on disk relative to the server's working directory;
    // mount a persistent volume at this path in production
    staticDir: path.resolve(process.cwd(), 'media'),
    // Deliberately no imageSizes/formatOptions/resizeOptions: originals
    // are stored untouched, and the frontend (Astro) handles all image
    // optimization at build time. Do not add automatic transforms here.
  },
}
