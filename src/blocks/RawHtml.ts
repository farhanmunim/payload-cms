import type { Block } from 'payload'

export const RawHtml: Block = {
  slug: 'rawHtml',
  labels: { singular: 'Raw HTML', plural: 'Raw HTML blocks' },
  fields: [
    {
      name: 'html',
      type: 'code',
      required: true,
      admin: {
        language: 'html',
        description: 'Rendered as-is by the frontend, e.g. an inline SVG diagram.',
      },
    },
  ],
}
