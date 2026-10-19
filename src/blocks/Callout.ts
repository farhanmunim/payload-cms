import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const Callout: Block = {
  slug: 'callout',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'info',
      required: true,
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warning' },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      // Own editor without blocks, so callouts can't nest
      editor: lexicalEditor(),
      required: true,
    },
  ],
}
