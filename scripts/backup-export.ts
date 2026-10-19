/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Full export: every collection (all fields, latest draft state), every global,
 * all uploaded files, and a snapshot of the Payload configuration.
 *
 *   NODE_ENV=production pnpm backup:export
 *
 * Output: $BACKUP_DIR (default ./backups)/payload-backup-<timestamp>.tar.gz
 * Env: BACKUP_DIR, BACKUP_INCLUDE_USERS=false to leave users out.
 *
 * User passwords/API keys are never exported (Payload does not expose them);
 * restored users get a random password and must use "Forgot password".
 * Version history is not exported, only the current document state.
 */
import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import {
  FORMAT_VERSION,
  describeFields,
  isSystemCollection,
} from './lib/backup'

const BACKUP_DIR = path.resolve(process.env.BACKUP_DIR || 'backups')
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const name = `payload-backup-${stamp}`
const root = path.join(BACKUP_DIR, name)

const writeJson = (file: string, data: unknown) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

const copyIfExists = (from: string, to: string) => {
  if (fs.existsSync(from)) fs.cpSync(from, to, { recursive: true })
}

const main = async () => {
  const payload = await getPayload({ config })
  const log = (msg: string) => payload.logger.info(`[backup] ${msg}`)

  const manifest: Record<string, any> = {
    formatVersion: FORMAT_VERSION,
    createdAt: new Date().toISOString(),
    payloadVersion: JSON.parse(
      fs.readFileSync(path.resolve('node_modules/payload/package.json'), 'utf8'),
    ).version,
    collections: {},
    globals: [],
    files: 0,
  }

  // ---- collections
  for (const collection of payload.config.collections) {
    const slug = collection.slug
    if (isSystemCollection(slug)) continue
    if (slug === 'users' && process.env.BACKUP_INCLUDE_USERS === 'false') continue

    const docs: any[] = []
    for (let page = 1; ; page++) {
      const res = await payload.find({
        collection: slug as any,
        depth: 0,
        draft: Boolean(collection.versions?.drafts),
        limit: 100,
        page,
        overrideAccess: true,
      })
      docs.push(...res.docs)
      if (!res.hasNextPage) break
    }
    writeJson(path.join(root, 'collections', `${slug}.json`), docs)
    manifest.collections[slug] = docs.length
    log(`${slug}: ${docs.length}`)

    // uploaded files
    if (collection.upload) {
      const staticDir = (collection.upload as any).staticDir
      for (const doc of docs) {
        const file = doc.filename && path.join(staticDir, doc.filename)
        if (file && fs.existsSync(file)) {
          fs.mkdirSync(path.join(root, 'uploads', slug), { recursive: true })
          fs.copyFileSync(file, path.join(root, 'uploads', slug, doc.filename))
          manifest.files++
        } else if (doc.filename) {
          payload.logger.warn(`[backup] file missing on disk: ${slug}/${doc.filename}`)
        }
      }
    }
  }

  // ---- globals
  for (const global of payload.config.globals) {
    const data = await payload.findGlobal({
      slug: global.slug as any,
      depth: 0,
      draft: Boolean(global.versions?.drafts),
      overrideAccess: true,
    })
    writeJson(path.join(root, 'globals', `${global.slug}.json`), data)
    manifest.globals.push(global.slug)
    log(`global ${global.slug}`)
  }

  // ---- configuration: schema summary + the config source files
  writeJson(path.join(root, 'config', 'schema.json'), {
    collections: payload.config.collections
      .filter((c) => !isSystemCollection(c.slug))
      .map((c) => ({
        slug: c.slug,
        auth: Boolean(c.auth),
        upload: Boolean(c.upload),
        drafts: Boolean(c.versions?.drafts),
        group: (c.admin as any)?.group,
        useAsTitle: c.admin?.useAsTitle,
        fields: describeFields(c.fields as any[]),
      })),
    globals: payload.config.globals.map((g) => ({
      slug: g.slug,
      fields: describeFields(g.fields as any[]),
    })),
  })
  for (const item of ['src', 'scripts', 'package.json', 'pnpm-lock.yaml', 'next.config.ts', 'tsconfig.json', 'Dockerfile']) {
    copyIfExists(path.resolve(item), path.join(root, 'config', 'source', item))
  }

  writeJson(path.join(root, 'manifest.json'), manifest)

  // ---- archive
  const archive = `${root}.tar.gz`
  const tar = spawnSync('tar', ['-czf', archive, '-C', BACKUP_DIR, name], { stdio: 'inherit' })
  if (tar.status !== 0) throw new Error('tar failed')
  fs.rmSync(root, { recursive: true, force: true })
  log(`Done: ${archive}`)
  process.exit(0)
}

await main().catch((err) => {
  console.error(err)
  process.exit(1)
})
