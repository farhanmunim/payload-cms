import { APIError, type CollectionConfig } from 'payload'

const isAdmin = ({ req }: { req: { user?: { role?: string } | null } }) =>
  req.user?.role === 'admin'

const countOtherAdmins = async (
  payload: { count: (args: any) => Promise<{ totalDocs: number }> },
  excludeId: number | string,
): Promise<number> => {
  const { totalDocs } = await payload.count({
    collection: 'users',
    where: {
      and: [{ role: { equals: 'admin' } }, { id: { not_equals: excludeId } }],
    },
  })
  return totalDocs
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'role'],
    group: 'Settings',
  },
  // When a user is referenced through a relationship (e.g. a post's
  // author), only expose the public author profile — never email,
  // sessions, or account details
  defaultPopulate: {
    firstName: true,
    lastName: true,
    avatar: true,
    bio: true,
    socialLinks: true,
  },
  auth: {
    // Lock an account for 10 minutes after 5 failed login attempts
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    // Allow issuing API keys (used by the frontend build to read
    // non-public data such as author names)
    useAPIKey: true,
  },
  hooks: {
    beforeChange: [
      async ({ req, data, operation, originalDoc }) => {
        // The very first user is always an admin, whatever the form says
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users' })
          if (totalDocs === 0) {
            data.role = 'admin'
          }
        }
        // Never demote the last remaining admin
        if (
          operation === 'update' &&
          originalDoc?.role === 'admin' &&
          data?.role &&
          data.role !== 'admin'
        ) {
          if ((await countOtherAdmins(req.payload, originalDoc.id)) === 0) {
            throw new APIError(
              'This is the only admin account. Make another user an admin before changing this role.',
              400,
            )
          }
        }
        return data
      },
    ],
    beforeDelete: [
      // Never delete the last remaining admin
      async ({ req, id }) => {
        const doc = await req.payload.findByID({ collection: 'users', id })
        if (doc?.role === 'admin' && (await countOtherAdmins(req.payload, id)) === 0) {
          throw new APIError(
            'This is the only admin account. Make another user an admin before deleting it.',
            400,
          )
        }
      },
    ],
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
