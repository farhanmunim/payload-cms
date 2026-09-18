import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
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
        description: 'Highlight this project on the homepage or top of listings.',
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
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: {
        description: 'Short description shown in project listings.',
      },
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        description: 'Link to the live project, if any.',
      },
    },
    {
      name: 'attachment',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional downloadable file for this project (e.g. PDF, case study).',
      },
    },
  ],
}
