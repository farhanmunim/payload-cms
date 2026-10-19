/**
 * One-off import of the WordPress site (https://cms.farhan.app) into Payload,
 * through the public WP REST API.
 *
 *   NODE_ENV=production pnpm seed:wordpress
 *
 * Run it wherever the target database and media directory live (e.g. inside
 * the container), after `pnpm migrate`. At least one Payload user must exist
 * (create the first admin at /admin); that user becomes the author of all
 * imported content. Re-running skips anything already imported by slug /
 * filename, so edits made in Payload are never overwritten. Set
 * SEED_OVERWRITE=true to re-import and overwrite existing documents.
 *
 * Env:
 *   WP_URL              default https://cms.farhan.app
 *   SEED_USER_EMAIL     author of imported content (default: the first user)
 *   SEED_OVERWRITE=true overwrite documents that already exist
 *   SEED_RESET=true     FIRST DELETE all posts, projects, services, resources,
 *                       experience, categories, tags and media (files too),
 *                       then import from scratch. Users and globals are kept.
 *   WP_USER, WP_APP_PASSWORD
 *                       optional WordPress application-password credentials.
 *                       With them the import also reads drafts, private and
 *                       scheduled content and attachments the public API
 *                       hides; those are imported as drafts.
 *
 * Media filenames and alt text come from scripts/media-manifest.json.
 */
import { randomBytes } from 'crypto'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { getPayload, type RichTextField } from 'payload'

import config from '../src/payload.config'

type ManifestEntry = { filename: string; alt: string }
const manifest: Record<string, ManifestEntry> = JSON.parse(
  fs.readFileSync(new URL('./media-manifest.json', import.meta.url), 'utf8'),
)

const WP = (process.env.WP_URL || 'https://cms.farhan.app').replace(/\/$/, '')
const OVERWRITE = process.env.SEED_OVERWRITE === 'true'
const RESET = process.env.SEED_RESET === 'true'
// Stops the deploy hook firing once per document; fired once at the end instead
const ctx = { context: { skipDeploy: true } }

// ---------------------------------------------------------------- helpers

/* eslint-disable @typescript-eslint/no-explicit-any */
type WPItem = Record<string, any>

const AUTH =
  process.env.WP_USER && process.env.WP_APP_PASSWORD
    ? {
        Authorization: `Basic ${Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64')}`,
      }
    : undefined
const STATUS_ANY = new Set(['posts', 'projects', 'solutions', 'resources', 'experience', 'socials'])

const fetchAll = async (restBase: string): Promise<WPItem[]> => {
  const items: WPItem[] = []
  const status = AUTH && STATUS_ANY.has(restBase) ? '&status=any' : ''
  for (let page = 1; ; page++) {
    const res = await fetch(
      `${WP}/wp-json/wp/v2/${restBase}?per_page=100&page=${page}${status}`,
      { headers: AUTH },
    )
    if (!res.ok) throw new Error(`GET ${restBase} page ${page}: ${res.status}`)
    items.push(...(await res.json()))
    if (page >= Number(res.headers.get('x-wp-totalpages') || 1)) return items
  }
}

const decode = (value: unknown): string => {
  if (typeof value !== 'string' || !value) return ''
  return new JSDOM(`<body>${value}</body>`).window.document.body.textContent ?? ''
}
const plain = (html: unknown): string => decode(html).replace(/\r\n/g, '\n').trim()
const text = (value: unknown): string | undefined => plain(value) || undefined
const meta = (item: WPItem): Record<string, any> =>
  item.meta_box && !Array.isArray(item.meta_box) ? item.meta_box : {}
// Drafts can have an unset (0000-…) date; fall back to the last-modified time
const iso = (item: WPItem): string =>
  `${item.date_gmt?.startsWith('0000') ? item.modified_gmt : item.date_gmt}Z`
const isPublished = (item: WPItem): boolean => item.status === 'publish'
const slugOf = (item: WPItem): string => item.slug || `wp-${item.id}`
const humanise = (value: string): string =>
  value.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
const objectId = (): string => randomBytes(12).toString('hex')

// ------------------------------------------------------------ HTML → Lexical

type Convert = (html: string) => any[]

const blockNode = (blockType: string, fields: Record<string, unknown>) => ({
  type: 'block',
  version: 2,
  format: '',
  fields: { id: objectId(), blockType, blockName: '', ...fields },
})

// Walk Lexical JSON and turn upload ids (strings from DOM attributes) into numbers
const fixUploadIds = (nodes: any[]): void => {
  for (const node of nodes) {
    if (node.type === 'upload' && typeof node.value === 'string') node.value = Number(node.value)
    if (Array.isArray(node.children)) fixUploadIds(node.children)
  }
}

const emptyEditorState = (children: any[]) => ({
  root: { type: 'root', format: '' as const, indent: 0, version: 1, direction: 'ltr' as const, children },
})

const makeConverter = (
  editorConfig: ReturnType<typeof editorConfigFactory.fromField>,
  mediaByWpId: Map<number, number>,
  mediaByFilename: Map<string, number>,
  warn: (msg: string) => void,
) => {
  const chunk = (html: string): any[] => {
    if (!html.trim()) return []
    const state = convertHTMLToLexical({ editorConfig, html, JSDOM: JSDOM as any })
    const children = (state as any).root.children as any[]
    fixUploadIds(children)
    return children
  }

  const resolveMedia = (img: Element): number | undefined => {
    const fromClass = /wp-image-(\d+)/.exec(img.getAttribute('class') ?? '')?.[1]
    if (fromClass && mediaByWpId.has(Number(fromClass))) return mediaByWpId.get(Number(fromClass))
    // WP serves resized copies as name-300x200.png; match the original name
    const file = (img.getAttribute('src') ?? '').split('?')[0].split('/').pop() ?? ''
    return mediaByFilename.get(file) ?? mediaByFilename.get(file.replace(/-\d+x\d+(\.\w+)$/, '$1'))
  }

  const convert: Convert = (html) => {
    const doc = new JSDOM(`<body>${html}</body>`).window.document
    const out: any[] = []
    let buffer = ''
    const flush = () => {
      out.push(...chunk(buffer))
      buffer = ''
    }

    for (const el of Array.from(doc.body.children)) {
      const classes = el.getAttribute('class') ?? ''

      if (el.tagName === 'PRE') {
        flush()
        out.push(blockNode('code', { code: (el.textContent ?? '').replace(/\n$/, '') }))
      } else if (el.tagName === 'DIV' && /\balert--(info|warning)\b/.test(classes)) {
        flush()
        const variant = /alert--warning/.test(classes) ? 'warning' : 'info'
        el.querySelectorAll('svg').forEach((svg) => svg.remove())
        out.push(blockNode('callout', { variant, content: emptyEditorState(chunk(el.innerHTML)) }))
      } else if (el.tagName === 'FIGURE' && el.querySelector('svg')) {
        flush()
        out.push(blockNode('rawHtml', { html: el.outerHTML.trim() }))
      } else {
        // Wrapper figures/divs (images, tables, button groups) → their content
        const imgs = Array.from(el.querySelectorAll('img'))
        for (const img of imgs) {
          const id = resolveMedia(img)
          if (id === undefined) {
            warn(`image not imported, removed from content: ${img.getAttribute('src')}`)
            img.remove()
            continue
          }
          img.setAttribute('data-lexical-upload-relation-to', 'media')
          img.setAttribute('data-lexical-upload-id', String(id))
        }
        const caption = el.querySelector('figcaption')
        const captionText = caption?.textContent?.trim()
        caption?.remove()
        const unwrapped = el.tagName === 'FIGURE' || el.tagName === 'DIV' ? el.innerHTML : el.outerHTML
        buffer += unwrapped
        if (captionText) buffer += `<p><em>${captionText}</em></p>`
      }
    }
    flush()
    return out
  }

  return (html: string) => {
    const children = convert(html)
    return children.length ? emptyEditorState(children) : undefined
  }
}

// ------------------------------------------------------------------- main

const main = async () => {
  const payload = await getPayload({ config })
  const log = (msg: string) => payload.logger.info(`[seed] ${msg}`)
  const warn = (msg: string) => payload.logger.warn(`[seed] ${msg}`)

  // Author for all imported content
  const users = await payload.find({
    collection: 'users',
    limit: 1,
    sort: 'createdAt',
    ...(process.env.SEED_USER_EMAIL
      ? { where: { email: { equals: process.env.SEED_USER_EMAIL } } }
      : {}),
  })
  const user = users.docs[0]
  if (!user) {
    throw new Error('No Payload user found. Create the first admin at /admin, then re-run.')
  }
  log(`Author: ${user.email}`)

  const exists = async (collection: any, field: string, value: string) =>
    (await payload.find({ collection, where: { [field]: { equals: value } }, limit: 1 })).docs[0]

  const upsert = async (collection: any, slug: string, data: Record<string, any>, extra: any = {}) => {
    const found = await exists(collection, 'slug', slug)
    if (found && !OVERWRITE) return found
    if (found) return payload.update({ collection, id: found.id, data, ...ctx, ...extra })
    return payload.create({ collection, data: { slug, ...data }, ...ctx, ...extra })
  }

  // ---- optional reset
  if (RESET) {
    log('SEED_RESET: deleting existing imported content…')
    for (const collection of [
      'posts',
      'projects',
      'services',
      'resources',
      'experience',
      'tags',
      'categories',
      'media',
    ] as const) {
      if (collection === 'media') {
        // Unlink media still referenced by users and globals, or deleting it fails
        await payload.update({
          collection: 'users',
          where: { avatar: { exists: true } },
          data: { avatar: null },
          ...ctx,
        })
        await payload.updateGlobal({
          slug: 'site-settings',
          data: { logo: null, favicon: null, shareImage: null },
          ...ctx,
        })
      }
      const { docs, errors } = await payload.delete({
        collection,
        where: { id: { exists: true } },
        ...ctx,
      })
      if (errors.length) {
        throw new Error(`Could not delete all ${collection}: ${JSON.stringify(errors)}`)
      }
      log(`  ${collection}: deleted ${docs.length}`)
    }
  }
  if (AUTH) log('WordPress credentials supplied: importing drafts/private content too')

  // ---- media
  log('Media…')
  const wpMedia = await fetchAll('media')
  const mediaByWpId = new Map<number, number>()
  const mediaByFilename = new Map<string, number>()
  for (const m of wpMedia) {
    const originalName: string = m.source_url.split('/').pop()
    const entry = manifest[String(m.id)]
    if (!entry) warn(`media ${m.id} (${originalName}) is not in media-manifest.json; using defaults`)
    const filename = entry?.filename ?? originalName
    const existing = await exists('media', 'filename', filename)
    let id: number
    if (existing) {
      id = existing.id as number
    } else {
      const res = await fetch(m.source_url)
      if (!res.ok) {
        warn(`could not download ${m.source_url} (${res.status})`)
        continue
      }
      const data = Buffer.from(await res.arrayBuffer())
      const created = await payload.create({
        collection: 'media',
        data: {
          alt: entry?.alt ?? text(m.alt_text) ?? humanise(decode(m.title?.rendered) || filename),
        },
        file: { data, mimetype: m.mime_type, name: filename, size: data.length },
        ...ctx,
      })
      id = created.id as number
    }
    mediaByWpId.set(m.id, id)
    mediaByFilename.set(originalName, id) // inline images and resource covers look up by WP name
  }
  const mediaByName = (name: string) => mediaByFilename.get(name)

  // ---- taxonomies
  log('Categories and tags…')
  const categoryIds = new Map<number, number>()
  for (const c of await fetchAll('categories')) {
    if (c.slug === 'uncategorised') continue // WordPress's empty default
    const doc = await upsert('categories', c.slug, { name: decode(c.name) })
    categoryIds.set(c.id, doc.id as number)
  }
  const tagIds = new Map<number, number>()
  for (const t of await fetchAll('tags')) {
    const doc = await upsert('tags', t.slug, { name: decode(t.name) })
    tagIds.set(t.id, doc.id as number)
  }
  const mapIds = (ids: number[] | undefined, map: Map<number, number>) =>
    (ids ?? []).map((id) => map.get(id)).filter((id): id is number => id !== undefined)

  const toLexical = makeConverter(
    editorConfigFactory.fromField({
      field: payload.collections.posts.config.fields.find(
        (f) => 'name' in f && f.name === 'content',
      ) as RichTextField,
    }),
    mediaByWpId,
    mediaByFilename,
    warn,
  )
  const common = (item: WPItem) => ({
    title: decode(item.title.rendered),
    author: user.id,
    tags: mapIds(item.tags, tagIds),
    createdAt: iso(item),
    _status: isPublished(item) ? ('published' as const) : ('draft' as const),
  })
  // Drafts skip required-field validation; published content is saved as published
  const opts = (item: WPItem) => ({ draft: !isPublished(item) })

  // ---- posts
  log('Posts…')
  for (const p of await fetchAll('posts')) {
    const cover = p.featured_media ? mediaByWpId.get(p.featured_media) : undefined
    if (p.featured_media && cover === undefined) {
      warn(`post "${p.slug}": featured image (WP media ${p.featured_media}) no longer exists in WordPress`)
    }
    await upsert(
      'posts',
      slugOf(p),
      {
        ...common(p),
        categories: mapIds(p.categories, categoryIds),
        publishedAt: iso(p),
        featured: Boolean(p.sticky),
        thumbnailFallback: text(meta(p).blog_thumbnail_fallback),
        coverImage: cover,
        excerpt: text(p.excerpt?.rendered),
        content: toLexical(p.content.rendered),
      },
      opts(p),
    )
  }

  // ---- projects
  log('Projects…')
  for (const p of await fetchAll('projects')) {
    const m = meta(p)
    const kpis = [1, 2, 3]
      .map((n) => ({ value: text(m[`project_kpi_${n}`]), caption: text(m[`project_kpi_caption_${n}`]) }))
      .filter((k) => k.value && k.caption)
    await upsert(
      'projects',
      slugOf(p),
      {
        ...common(p),
        categories: mapIds(p.categories, categoryIds),
        publishedAt: iso(p),
        thumbnailFallback: text(m.project_thumbnail_fallback),
        summary: text(m.project_excerpt),
        role: text(m.project_role),
        url: text(m.project_link),
        urlLabel: text(m.project_link_label),
        sourceUrl: text(m.project_source_link),
        sourceLabel: text(m.project_source_link_label),
        problem: text(m.project_Problem),
        approach: text(m.project_approach),
        outcome: text(m.project_outcome),
        kpis,
      },
      opts(p),
    )
  }

  // ---- services (WordPress "solutions")
  log('Services…')
  for (const s of await fetchAll('solutions')) {
    await upsert('services', slugOf(s), { ...common(s), content: toLexical(s.content.rendered) }, opts(s))
  }

  // ---- resources
  log('Resources…')
  // Screenshots in the WP media library are named after the resource's site
  const resourceImages: Record<string, string> = {
    claude: 'claude.ai_new.jpg',
    nordvpn: 'nordvpn.com_.jpg',
    bricksforge: 'bricksforge.io_.jpg',
    acpt: 'acpt.io_.jpg',
    hostarmada: 'hostarmada.com_.jpg',
    siteground: 'www.siteground.co_.uk_.jpg',
    trading212: 'www.trading212.com_.jpg',
    revolut: 'www.revolut.com_-scaled-1.jpg',
  }
  for (const r of await fetchAll('resources')) {
    const m = meta(r)
    await upsert(
      'resources',
      slugOf(r),
      {
        ...common(r),
        thumbnailFallback: text(m.resource_thumbnail_fallback),
        coverImage: resourceImages[r.slug] ? mediaByName(resourceImages[r.slug]) : undefined,
        description: text(m.resource_excerpt),
        url: text(m.resource_link),
        urlLabel: text(m.resource_link_label),
        referral: m.resource_referral === '1' || m.resource_referral === true,
      },
      opts(r),
    )
  }

  // ---- experience (listed newest-first in WP; keep that order)
  log('Experience…')
  const experience = await fetchAll('experience')
  for (const [i, e] of experience.entries()) {
    await upsert('experience', slugOf(e), { title: decode(e.title.rendered), order: i })
  }

  // ---- site settings, author profile
  log('Site settings and profile…')
  const root = await (await fetch(`${WP}/wp-json/`)).json()
  const socials = (await fetchAll('socials')).map((s) => ({
    platform: decode(s.title.rendered),
    url: meta(s).social_link as string,
  }))
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: settings.siteName || decode(root.name),
      tagline: settings.tagline || text(root.description),
      // After a reset the old media is gone, so always re-link these
      favicon: (!RESET && settings.favicon) || mediaByName('favicon.png'),
      shareImage: (!RESET && settings.shareImage) || mediaByName('banner.png'),
      socialLinks: settings.socialLinks?.length ? settings.socialLinks : socials,
    },
    ...ctx,
  })

  const [wpUser] = await fetchAll('users')
  const [firstName, ...rest] = decode(wpUser.name).split(' ')
  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      firstName: user.firstName || firstName,
      lastName: user.lastName || rest.join(' ') || undefined,
      avatar: (!RESET && user.avatar) || mediaByName('headshot.png'),
      bio: user.bio ?? toLexical(`<p>${decode(wpUser.description)}</p>`),
      socialLinks: user.socialLinks?.length ? user.socialLinks : socials,
    },
    ...ctx,
  })

  // One deploy-hook call for the whole import (individual calls were skipped)
  const finalSettings = await payload.findGlobal({ slug: 'site-settings' })
  if (finalSettings.deployHookUrl) {
    try {
      await fetch(finalSettings.deployHookUrl, { method: 'POST' })
      log('Deploy hook triggered')
    } catch (err) {
      warn(`Deploy hook failed: ${(err as Error).message}`)
    }
  }

  log('Done.')
  process.exit(0)
}

await main().catch((err) => {
  console.error(err)
  process.exit(1)
})
