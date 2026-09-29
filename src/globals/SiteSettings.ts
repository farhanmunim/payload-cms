import type { GlobalConfig } from 'payload'

import { triggerDeployAfterGlobalChange } from '../hooks/triggerDeploy'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
  },
  hooks: {
    afterChange: [triggerDeployAfterGlobalChange],
  },
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      admin: {
        description: 'Shown in the browser tab, header, and social shares.',
      },
    },
    {
      name: 'tagline',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Default meta description for pages without their own.',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Square image, ideally 512x512 PNG or SVG.',
      },
    },
    {
      name: 'shareImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Default social media share banner (Open Graph image), ideally 1200x630. Used when a page has no image of its own.',
      },
    },
    {
      name: 'copyrightText',
      type: 'text',
      admin: {
        description: 'Shown in the site footer, e.g. "© 2026 Example. All rights reserved."',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      admin: {
        description: 'Social profiles shown on the site, in this order.',
      },
      fields: [
        {
          name: 'platform',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g. GitHub, LinkedIn, X, Instagram, YouTube',
          },
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'handle',
          type: 'text',
          admin: {
            description: 'Display handle, e.g. @farhan',
          },
        },
      ],
    },
    {
      name: 'analyticsShareUrl',
      type: 'text',
      admin: {
        description:
          'Optional. A read-only Umami share URL; the dashboard is embedded at /analytics on this domain for logged-in users.',
      },
    },
    {
      name: 'deployHookUrl',
      type: 'text',
      admin: {
        description:
          'Optional. When set, the CMS sends a POST request here whenever published content changes, so the frontend can rebuild (e.g. a Coolify or Cloudflare Pages deploy hook URL).',
      },
    },
    {
      type: 'collapsible',
      label: 'Script Injection',
      admin: {
        initCollapsed: true,
        description: 'Raw HTML injected on every page of the site, e.g. analytics snippets.',
      },
      fields: [
        {
          name: 'headScripts',
          type: 'code',
          admin: {
            language: 'html',
            description: 'Injected before the closing </head> tag.',
          },
        },
        {
          name: 'footerScripts',
          type: 'code',
          admin: {
            language: 'html',
            description: 'Injected before the closing </body> tag.',
          },
        },
      ],
    },
  ],
}
