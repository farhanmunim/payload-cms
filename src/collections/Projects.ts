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
      name: 'url',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Link to the live project, if any.',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        position: 'sidebar',
        description: 'Tech stack or topic labels, e.g. Astro, Payload, Design.',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
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
      name: 'attachment',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional downloadable file for this project (e.g. PDF, case study).',
      },
    },
  ],
}
