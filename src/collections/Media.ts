import path from 'path'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Organisation',
  },
  access: {
    read: () => true,
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
  },
}
