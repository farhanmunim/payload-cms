import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName'],
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
  ],
}
