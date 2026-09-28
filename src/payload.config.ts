import path from 'path'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { resendAdapter } from '@payloadcms/email-resend'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Resources } from './collections/Resources'
import { Services } from './collections/Services'
import { Tags } from './collections/Tags'
import { SiteSettings } from './globals/SiteSettings'
import { Permalinks } from './globals/Permalinks'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    // Native admin header avatar options are 'default' or 'gravatar';
    // set your photo at gravatar.com for your admin email address
    avatar: 'gravatar',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Pages, Posts, Projects, Services, Resources, Categories, Tags, Media, Users],
  globals: [SiteSettings, Permalinks],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  // Without RESEND_API_KEY (e.g. local dev), emails are logged to the console
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
        defaultFromName: process.env.EMAIL_FROM_NAME || 'Payload CMS',
      })
    : undefined,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./data/payload.db',
    },
    prodMigrations: migrations,
  }),
  plugins: [
    // CSV/JSON import and export controls on the content collections
    // (deliberately not users or media: accounts shouldn't bulk-export,
    // and media records reference files the export can't carry)
    importExportPlugin({
      // Run imports/exports synchronously — this deployment has no
      // worker processing Payload's jobs queue
      collections: ['pages', 'posts', 'projects', 'services', 'resources', 'categories', 'tags'].map(
        (slug) => ({
          slug: slug as 'pages',
          export: { disableJobsQueue: true },
          import: { disableJobsQueue: true },
        }),
      ),
    }),
  ],
  sharp,
})
