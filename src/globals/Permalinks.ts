import type { Field, GlobalConfig } from 'payload'

// One entry per routable content collection; the frontend prepends the
// prefix to the document slug when building URLs.
const routableCollections: { slug: string; label: string; defaultPrefix: string }[] = [
  { slug: 'pages', label: 'Pages', defaultPrefix: '' },
  { slug: 'posts', label: 'Posts', defaultPrefix: 'blog' },
  { slug: 'projects', label: 'Projects', defaultPrefix: 'projects' },
  { slug: 'services', label: 'Services', defaultPrefix: 'services' },
  { slug: 'resources', label: 'Resources', defaultPrefix: 'resources' },
  { slug: 'tags', label: 'Tags', defaultPrefix: 'tags' },
]

export const Permalinks: GlobalConfig = {
  slug: 'permalinks',
  label: 'Permalinks',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin',
  },
  fields: routableCollections.map(
    ({ slug, label, defaultPrefix }): Field => ({
      name: slug,
      label: `${label} prefix`,
      type: 'text',
      defaultValue: defaultPrefix,
      admin: {
        description: `URL prefix for ${label.toLowerCase()}, without slashes — e.g. "blog" gives /blog/example-slug. Leave empty to serve ${label.toLowerCase()} from the site root.`,
      },
    }),
  ),
}
