import path from 'path'
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
  ],
  upload: {
    // Stored on disk relative to the server's working directory;
    // mount a persistent volume at this path in production
    staticDir: path.resolve(process.cwd(), 'media'),
  },
}
