import type { Field } from 'payload'

const format = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')

// URL-friendly identifier, auto-generated from the given field when left empty
export const slugField = (fallbackFrom: string = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Used in URLs. Leave empty to generate from the title.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.length > 0) return format(value)
        const fallback = data?.[fallbackFrom]
        if (typeof fallback === 'string' && fallback.length > 0) return format(fallback)
        return value
      },
    ],
  },
})
