import type { CollectionConfig } from 'payload'

import { triggerDeployAfterChange, triggerDeployAfterDelete } from '../hooks/triggerDeploy'
import { slugField } from '../fields/slug'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt', '_status'],
  },
  access: {
    // Public requests see only published documents; authenticated
    // users (e.g. the admin, or the frontend build with an API key)
    // can also read drafts
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [triggerDeployAfterChange],
    afterDelete: [triggerDeployAfterDelete],
    beforeChange: [
      // Default the publish date to now the first time a post is published
      ({ data }) => {
        if (data?._status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Highlight this post on the homepage or top of listings.',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'The post’s section(s). Use tags for cross-cutting labels.',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      defaultValue: ({ user }) => user?.id,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary shown in post listings and previews.',
      },
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
}
