import type { CollectionConfig } from 'payload'

import { triggerDeployAfterChange, triggerDeployAfterDelete } from '../hooks/triggerDeploy'

import { slugField } from '../fields/slug'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
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
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
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
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Highlight this project on the homepage or top of listings.',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
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
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'thumbnailFallback',
      type: 'text',
      maxLength: 4,
      admin: {
        position: 'sidebar',
        description: 'Short initials shown in place of a cover image, e.g. "SC".',
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
      name: 'role',
      type: 'text',
      admin: {
        description: 'Your role on the project, e.g. Developer.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'Link to the live project, if any.',
          },
        },
        {
          name: 'urlLabel',
          type: 'text',
          admin: {
            description: 'Link text for the live project.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sourceUrl',
          type: 'text',
          admin: {
            description: 'Link to the source code, if open source.',
          },
        },
        {
          name: 'sourceLabel',
          type: 'text',
          admin: {
            description: 'Link text for the source code.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Case study',
      fields: [
        { name: 'problem', type: 'textarea' },
        { name: 'approach', type: 'textarea' },
        { name: 'outcome', type: 'textarea' },
        {
          name: 'kpis',
          label: 'KPIs',
          type: 'array',
          maxRows: 3,
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'caption', type: 'text', required: true },
          ],
        },
      ],
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
