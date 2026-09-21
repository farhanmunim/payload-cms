import type { CollectionConfig } from 'payload'

const isAdmin = ({ req }: { req: { user?: { role?: string } | null } }) =>
  req.user?.role === 'admin'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'role'],
    group: 'Settings',
  },
  auth: {
    // Lock an account for 10 minutes after 5 failed login attempts
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    // Allow issuing API keys (used by the frontend build to read
    // non-public data such as author names)
    useAPIKey: true,
  },
  access: {
    // Admins manage everyone; other roles can only see and edit themselves
    create: isAdmin,
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    delete: isAdmin,
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
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      saveToJWT: true,
      // Only admins may assign or change roles, so editors cannot
      // promote themselves
      access: {
        create: isAdmin,
        update: isAdmin,
      },
      admin: {
        position: 'sidebar',
        description: 'Admins manage users and settings; editors manage content.',
      },
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
