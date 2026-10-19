import type { Block } from 'payload'

export const Code: Block = {
  slug: 'code',
  labels: { singular: 'Code block', plural: 'Code blocks' },
  fields: [
    {
      name: 'code',
      type: 'code',
      required: true,
    },
  ],
}
