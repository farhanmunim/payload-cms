import type { CollectionConfig } from 'payload'

export const Social: CollectionConfig = {
  slug: 'social',
  labels: {
    singular: 'Social Link',
    plural: 'Social Links',
  },
  admin: {
    useAsTitle: 'platform',
    defaultColumns: ['platform', 'url'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'platform',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. GitHub, LinkedIn, X, Instagram, YouTube',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'handle',
      type: 'text',
      admin: {
        description: 'Display handle, e.g. @farhan',
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
