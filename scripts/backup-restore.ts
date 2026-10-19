/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Restore a backup made by backup-export.ts.
 *
 *   NODE_ENV=production BACKUP_FILE=/path/payload-backup-….tar.gz pnpm backup:restore
 *
 * Env:
 *   BACKUP_FILE           the .tar.gz (or an extracted backup directory)
 *   RESTORE_WIPE=true     delete existing content first. Without it the restore
 *                         refuses to run unless every content collection is empty.
 *   RESTORE_CONFIG_TO=dir also extract the config snapshot (source files) there.
 *
 * Documents get new IDs; all relationships (including those inside rich text)
 * are remapped. Users are matched by email: existing users are kept, missing
 * ones are created with a random password (use "Forgot password"). The schema
 * snapshot is compared with the running config and differences are reported;
 * the config itself is code, so deploy the matching git commit to restore it.
 */
import { spawnSync } from 'child_process'
import { randomBytes } from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import {
  FORMAT_VERSION,
  dependencyOrder,
  isSystemCollection,
  referencedCollections,
  remapRefs,
  topLevelFieldNames,
} from './lib/backup'

const ctx = { context: { skipDeploy: true } }
const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'))
const NON_DATA = ['id', 'createdAt', 'updatedAt', 'globalType', '_status', 'sizes', 'url', 'thumbnailURL']

const main = async () => {
  const source = process.env.BACKUP_FILE
  if (!source) throw new Error('Set BACKUP_FILE to the backup .tar.gz (or directory).')

  // ---- unpack
  let root = path.resolve(source)
  if (root.endsWith('.tar.gz') || root.endsWith('.tgz')) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'payload-restore-'))
    if (spawnSync('tar', ['-xzf', root, '-C', tmp], { stdio: 'inherit' }).status !== 0) {
      throw new Error('Could not extract the archive')
    }
    root = path.join(tmp, fs.readdirSync(tmp)[0])
  }
  const manifest = readJson(path.join(root, 'manifest.json'))
  if (manifest.formatVersion !== FORMAT_VERSION) {
    throw new Error(`Unsupported backup format ${manifest.formatVersion}`)
  }

  const payload = await getPayload({ config })
  const log = (msg: string) => payload.logger.info(`[restore] ${msg}`)
  const warn = (msg: string) => payload.logger.warn(`[restore] ${msg}`)
  log(`Backup from ${manifest.createdAt} (Payload ${manifest.payloadVersion})`)

  if (process.env.RESTORE_CONFIG_TO) {
    fs.cpSync(path.join(root, 'config', 'source'), path.resolve(process.env.RESTORE_CONFIG_TO), {
      recursive: true,
    })
    log(`Config snapshot extracted to ${process.env.RESTORE_CONFIG_TO}`)
  }

  // ---- compare the schema snapshot with the running config
  const schema = readJson(path.join(root, 'config', 'schema.json'))
  for (const c of schema.collections) {
    const current = payload.config.collections.find((x) => x.slug === c.slug)
    if (!current) {
      warn(`collection "${c.slug}" is in the backup but not in the current config; skipped`)
      continue
    }
    const have = new Set(topLevelFieldNames(current.fields as any[]))
    const missing = topLevelFieldNames(c.fields).filter((n: string) => !have.has(n))
    if (missing.length) warn(`"${c.slug}": fields not in current config (data dropped): ${missing.join(', ')}`)
  }

  // ---- collections present in both, in dependency order
  const slugs = fs
    .readdirSync(path.join(root, 'collections'))
    .map((f) => f.replace(/\.json$/, ''))
    .filter((s) => !isSystemCollection(s) && (payload.collections as any)[s])
  const deps = new Map(
    slugs.map((s) => [s, referencedCollections((payload.collections as any)[s].config.fields)]),
  )
  const order = dependencyOrder(deps)
  const content = order.filter((s) => s !== 'users')

  // ---- wipe or refuse
  const existing: Record<string, number> = {}
  for (const s of content) existing[s] = (await payload.count({ collection: s as any })).totalDocs
  const nonEmpty = Object.entries(existing).filter(([, n]) => n > 0)
  if (nonEmpty.length && process.env.RESTORE_WIPE !== 'true') {
    throw new Error(
      `Target is not empty (${nonEmpty.map(([s, n]) => `${s}: ${n}`).join(', ')}). ` +
        'Set RESTORE_WIPE=true to delete it first.',
    )
  }
  if (nonEmpty.length) {
    log('RESTORE_WIPE: deleting existing content…')
    const wiped = new Set(content)
    // Unlink kept documents (users, globals) from content that is about to go
    const unlink = (rel: string, id: unknown) => (wiped.has(rel) ? undefined : id)
    for (const user of (await payload.find({ collection: 'users', limit: 1000, depth: 0 })).docs) {
      const data: any = JSON.parse(JSON.stringify(user))
      remapRefs((payload.collections as any).users.config.fields, data, unlink)
      await payload.update({ collection: 'users', id: user.id, data, ...ctx })
    }
    for (const g of payload.config.globals) {
      const data: any = await payload.findGlobal({ slug: g.slug as any, depth: 0 })
      remapRefs(g.fields, data, unlink)
      await payload.updateGlobal({ slug: g.slug as any, data, ...ctx })
    }
    for (const s of [...content].reverse()) {
      const { errors } = await payload.delete({ collection: s as any, where: { id: { exists: true } }, ...ctx })
      if (errors.length) throw new Error(`Could not delete all ${s}: ${JSON.stringify(errors)}`)
    }
  }

  // ---- restore documents
  const maps: Record<string, Map<unknown, unknown>> = {}
  const resolve = (rel: string, id: unknown): unknown => {
    const hit = maps[rel]?.get(id)
    if (hit === undefined) warn(`dropped reference to ${rel} #${String(id)} (not in backup)`)
    return hit
  }

  for (const slug of order) {
    const col = (payload.collections as any)[slug].config
    maps[slug] = new Map()
    const docs: any[] = readJson(path.join(root, 'collections', `${slug}.json`))
    let pending = docs
    log(`${slug}: ${docs.length}`)

    // Documents may reference earlier documents of the same collection (e.g. a
    // category's parent): create those whose references are ready, repeat.
    while (pending.length) {
      const deferred: any[] = []
      for (const doc of pending) {
        // Defer documents that point at a not-yet-restored document of this collection
        let waiting = false
        remapRefs(col.fields, JSON.parse(JSON.stringify(doc)), (rel, id) => {
          if (rel === slug && !maps[slug].has(id)) waiting = true
          return id
        })
        if (waiting) {
          deferred.push(doc)
          continue
        }

        const data: any = JSON.parse(JSON.stringify(doc))
        for (const key of NON_DATA) delete data[key]
        remapRefs(col.fields, data, resolve)

        let created: any
        if (slug === 'users') {
          const found = (await payload.find({ collection: 'users', where: { email: { equals: doc.email } }, limit: 1 })).docs[0]
          if (found) {
            maps.users.set(doc.id, found.id)
            continue
          }
          warn(`user ${doc.email} created with a random password; use "Forgot password"`)
          created = await payload.create({
            collection: 'users',
            data: { ...data, password: randomBytes(24).toString('hex') },
            ...ctx,
          })
        } else if (col.upload) {
          const file = path.join(root, 'uploads', slug, doc.filename)
          if (!fs.existsSync(file)) {
            warn(`${slug}/${doc.filename}: file missing in backup, skipped`)
            continue
          }
          const buf = fs.readFileSync(file)
          for (const k of ['filename', 'mimeType', 'filesize', 'width', 'height', 'focalX', 'focalY']) delete data[k]
          created = await payload.create({
            collection: slug as any,
            data: { ...data, createdAt: doc.createdAt },
            file: { data: buf, mimetype: doc.mimeType, name: doc.filename, size: buf.length },
            ...ctx,
          })
        } else {
          created = await payload.create({
            collection: slug as any,
            data: { ...data, createdAt: doc.createdAt, ...(doc._status ? { _status: doc._status } : {}) },
            draft: doc._status ? doc._status !== 'published' : false,
            ...ctx,
          })
        }
        maps[slug].set(doc.id, created.id)
      }
      if (deferred.length === pending.length) throw new Error(`Unresolvable references in ${slug}`)
      pending = deferred
    }
  }

  // ---- globals
  const globalsDir = path.join(root, 'globals')
  for (const file of fs.existsSync(globalsDir) ? fs.readdirSync(globalsDir) : []) {
    const slug = file.replace(/\.json$/, '')
    const global = payload.config.globals.find((g) => g.slug === slug)
    if (!global) {
      warn(`global "${slug}" is not in the current config; skipped`)
      continue
    }
    const data: any = readJson(path.join(globalsDir, file))
    for (const key of NON_DATA) delete data[key]
    remapRefs(global.fields, data, resolve)
    await payload.updateGlobal({ slug: slug as any, data, ...ctx })
    log(`global ${slug}`)
  }

  // One deploy-hook call for the whole restore
  const settings: any = await payload.findGlobal({ slug: 'site-settings' })
  if (settings.deployHookUrl) {
    try {
      await fetch(settings.deployHookUrl, { method: 'POST' })
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
