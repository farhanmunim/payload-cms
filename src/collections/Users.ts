import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email'],
  },
  auth: {
    // Lock an account for 10 minutes after 5 failed login attempts
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    // Allow issuing API keys (used by the frontend build to read
    // non-public data such as author names)
    useAPIKey: true,
  },
  fields: [
    // Email added by default
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Profile picture, shown next to your content on the site.',
      },
    },
    {
      name: 'bio',
      type: 'richText',
      label: 'About the author',
    },
    {
      name: 'socialLinks',
      type: 'array',
      admin: {
        description: 'Personal social profiles, shown alongside your author byline.',
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
      ],
    },
  ],
}
